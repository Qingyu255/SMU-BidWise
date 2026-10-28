import argparse
import csv
import logging
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import (
    NoAlertPresentException,
    NoSuchElementException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


BOSS_ORIGIN = "https://boss.intranet.smu.edu.sg"
OVERALL_RESULTS_URL = f"{BOSS_ORIGIN}/OverallResults.aspx"
RESULTS_TABLE_ID = "RadGrid_OverallResults_ctl00"
DATA_ROWS_XPATH = (
    '//table[@id="RadGrid_OverallResults_ctl00"]/tbody/'
    'tr[contains(@class, "rgRow") or contains(@class, "rgAltRow")]'
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(threadName)s - %(message)s",
)
logger = logging.getLogger(__name__)


def parse_args():
    parser = argparse.ArgumentParser(
        description=(
            "Scrape BOSS overall bid results with one manual login and "
            "multiple authenticated Selenium workers."
        )
    )
    parser.add_argument(
        "--term",
        default="2025-26 Term 1",
        help="Visible term name in the BOSS term dropdown.",
    )
    parser.add_argument(
        "--start-page",
        type=int,
        default=1,
        help="First results page to scrape, inclusive.",
    )
    parser.add_argument(
        "--end-page",
        type=int,
        required=True,
        help="Last results page to scrape, inclusive.",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=os.cpu_count() or 1,
        help="Number of parallel browser workers. Defaults to all CPU cores.",
    )
    parser.add_argument(
        "--page-size",
        type=int,
        default=50,
        help="BOSS results rows per page.",
    )
    parser.add_argument(
        "--output-dir",
        default="scrapedData",
        help="Directory where the merged CSV is written.",
    )
    parser.add_argument(
        "--headed-workers",
        action="store_true",
        help="Run worker browsers visibly. By default workers run headless.",
    )
    parser.add_argument(
        "--keep-parts",
        action="store_true",
        help="Keep temporary worker CSV part files after merging.",
    )
    parser.add_argument(
        "--keep-login-browser-open",
        action="store_true",
        help="Do not close the manual-login browser after session capture.",
    )
    return parser.parse_args()


def setup_driver(headless=False):
    options = webdriver.ChromeOptions()
    options.page_load_strategy = "eager"
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1440,1000")
    options.add_experimental_option(
        "prefs",
        {
            "profile.managed_default_content_settings.images": 2,
            "profile.default_content_setting_values.notifications": 2,
        },
    )
    return webdriver.Chrome(options=options)


def safe_filename_part(value):
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value).strip("_") or "unknown"


def wait_for_manual_login(driver):
    driver.get(OVERALL_RESULTS_URL)
    logger.info("Manual login browser opened.")
    input(
        "\nLog in manually in the opened Chrome window until the BOSS overall "
        "results page is visible, then press Enter here to start scraping...\n"
    )
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )
    cookies = driver.get_cookies()
    storage = capture_browser_storage(driver)
    if not cookies:
        raise RuntimeError("No cookies were captured after manual login.")
    logger.info("Captured %d cookies from manual login session.", len(cookies))
    return cookies, storage


def capture_browser_storage(driver):
    try:
        return driver.execute_script(
            """
            return {
                localStorage: Object.assign({}, window.localStorage),
                sessionStorage: Object.assign({}, window.sessionStorage)
            };
            """
        )
    except WebDriverException as exc:
        logger.warning("Could not capture browser storage: %s", exc)
        return {"localStorage": {}, "sessionStorage": {}}


def restore_browser_storage(driver, storage):
    for storage_name in ("localStorage", "sessionStorage"):
        values = storage.get(storage_name, {}) or {}
        for key, value in values.items():
            driver.execute_script(
                f"window.{storage_name}.setItem(arguments[0], arguments[1]);",
                key,
                value,
            )


def add_cookie_to_driver(driver, cookie):
    selenium_cookie = cookie.copy()
    same_site = selenium_cookie.pop("sameSite", None)
    if "expiry" in selenium_cookie and selenium_cookie["expiry"] is not None:
        selenium_cookie["expiry"] = int(selenium_cookie["expiry"])

    try:
        driver.add_cookie(selenium_cookie)
        return True
    except WebDriverException as exc:
        logger.debug("Selenium add_cookie rejected %s: %s", cookie.get("name"), exc)

    cdp_cookie = {
        "name": cookie["name"],
        "value": cookie["value"],
        "path": cookie.get("path", "/"),
        "secure": bool(cookie.get("secure", True)),
        "httpOnly": bool(cookie.get("httpOnly", False)),
    }
    if same_site in {"Strict", "Lax", "None"}:
        cdp_cookie["sameSite"] = same_site
    if cookie.get("expiry") is not None:
        cdp_cookie["expires"] = int(cookie["expiry"])

    domain = cookie.get("domain")
    if domain:
        cdp_cookie["domain"] = domain
        cdp_cookie["url"] = f"https://{domain.lstrip('.')}"
    else:
        cdp_cookie["url"] = BOSS_ORIGIN

    try:
        result = driver.execute_cdp_cmd("Network.setCookie", cdp_cookie)
        if result.get("success"):
            return True
    except WebDriverException as exc:
        logger.debug("CDP setCookie rejected %s: %s", cookie.get("name"), exc)

    cdp_cookie.pop("domain", None)
    cdp_cookie["url"] = BOSS_ORIGIN
    try:
        result = driver.execute_cdp_cmd("Network.setCookie", cdp_cookie)
        return bool(result.get("success"))
    except WebDriverException as exc:
        logger.debug("CDP setCookie fallback rejected %s: %s", cookie.get("name"), exc)
        return False


def prime_authenticated_session(driver, cookies, storage):
    driver.get(BOSS_ORIGIN)
    driver.execute_cdp_cmd("Network.enable", {})
    added_cookie_count = 0
    for cookie in cookies:
        if add_cookie_to_driver(driver, cookie):
            added_cookie_count += 1
    if added_cookie_count == 0:
        raise RuntimeError("Could not add any login cookies to worker browser.")
    logger.info("Restored %d login cookies in worker browser.", added_cookie_count)
    restore_browser_storage(driver, storage)


def handle_alert(driver):
    try:
        alert = driver.switch_to.alert
        logger.info("Handling alert with text: %s", alert.text)
        alert.accept()
        time.sleep(0.3)
        return True
    except NoAlertPresentException:
        return False
    except Exception as exc:
        logger.error("Error handling alert: %s", exc)
        return False


def select_term(driver, wait, term_name):
    term_arrow = wait.until(EC.element_to_be_clickable((By.ID, "rcboTerm_Arrow")))
    term_arrow.click()

    wait.until(EC.visibility_of_element_located((By.ID, "rcboTerm_DropDown")))
    term_items = driver.find_elements(By.CSS_SELECTOR, "#rcboTerm_DropDown .rcbList li")

    for item in term_items:
        checkbox = item.find_element(By.CSS_SELECTOR, 'input[type="checkbox"]')
        if checkbox.is_selected():
            checkbox.click()

    for item in term_items:
        label_text = item.text.strip()
        if label_text == term_name:
            checkbox = item.find_element(By.CSS_SELECTOR, 'input[type="checkbox"]')
            if not checkbox.is_selected():
                checkbox.click()
            driver.find_element(By.TAG_NAME, "body").click()
            logger.info("Selected term: %s", label_text)
            return

    raise ValueError(f"Term '{term_name}' not found.")


def click_search(wait):
    search_button = wait.until(
        EC.element_to_be_clickable((By.ID, "RadButton_Search_input"))
    )
    search_button.click()
    wait.until(EC.presence_of_element_located((By.ID, RESULTS_TABLE_ID)))


def set_page_size(driver, wait, size):
    page_size_combo = wait.until(
        EC.element_to_be_clickable(
            (By.ID, "RadGrid_OverallResults_ctl00_ctl03_ctl01_PageSizeComboBox_Input")
        )
    )
    page_size_combo.click()

    size_option_xpath = (
        '//div[@id="RadGrid_OverallResults_ctl00_ctl03_ctl01_PageSizeComboBox_DropDown"]'
        f'//li[text()="{size}"]'
    )
    size_option = wait.until(EC.element_to_be_clickable((By.XPATH, size_option_xpath)))
    size_option.click()
    wait.until(EC.presence_of_element_located((By.ID, RESULTS_TABLE_ID)))
    wait_for_table_rows_or_empty(driver, wait)


def wait_for_table_rows_or_empty(driver, wait):
    try:
        wait.until(EC.presence_of_element_located((By.XPATH, DATA_ROWS_XPATH)))
    except TimeoutException:
        if not driver.find_elements(By.ID, RESULTS_TABLE_ID):
            raise


def get_table_headers(driver):
    table = driver.find_element(By.ID, RESULTS_TABLE_ID)
    header_row = table.find_element(By.TAG_NAME, "thead").find_element(By.TAG_NAME, "tr")
    return [header.text.strip() for header in header_row.find_elements(By.TAG_NAME, "th")]


def get_table_data(driver, wait):
    wait_for_table_rows_or_empty(driver, wait)
    rows = driver.find_elements(By.XPATH, DATA_ROWS_XPATH)
    data = []

    for row in rows:
        handle_alert(driver)
        row_data = []
        for cell in row.find_elements(By.TAG_NAME, "td"):
            links = cell.find_elements(By.TAG_NAME, "a")
            if links:
                row_data.append(" ".join(link.text.strip() for link in links))
            else:
                row_data.append(cell.text.strip())
        data.append(row_data)

    return data


def is_next_page_available(driver):
    try:
        next_page_button = driver.find_element(By.CSS_SELECTOR, "input.rgPageNext")
        button_class = next_page_button.get_attribute("class") or ""
        return "rgPageNextDisabled" not in button_class and next_page_button.is_enabled()
    except NoSuchElementException:
        return False


def go_to_next_page(driver, wait):
    next_page_button = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input.rgPageNext"))
    )
    next_page_button.click()
    wait.until(EC.staleness_of(next_page_button))
    wait.until(EC.presence_of_element_located((By.ID, RESULTS_TABLE_ID)))


def navigate_to_page(driver, wait, target_page):
    current_page = 1
    while current_page < target_page:
        if not is_next_page_available(driver):
            return False
        go_to_next_page(driver, wait)
        current_page += 1
    return True


def prepare_results_page(driver, wait, term_name, page_size):
    driver.get(OVERALL_RESULTS_URL)
    select_term(driver, wait, term_name)
    click_search(wait)
    set_page_size(driver, wait, page_size)
    return get_table_headers(driver)


def scrape_page_range(driver, wait, start_page, end_page, part_file):
    if not navigate_to_page(driver, wait, start_page):
        logger.info("Page %s is beyond the available result pages.", start_page)
        return 0

    rows_written = 0
    page_number = start_page
    with part_file.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        while page_number <= end_page:
            logger.info("Scraping page %s", page_number)
            data_rows = get_table_data(driver, wait)
            writer.writerows(data_rows)
            rows_written += len(data_rows)

            if page_number == end_page or not is_next_page_available(driver):
                break
            go_to_next_page(driver, wait)
            page_number += 1

    return rows_written


def split_page_ranges(start_page, end_page, worker_count):
    total_pages = end_page - start_page + 1
    worker_count = max(1, min(worker_count, total_pages))
    base_pages = total_pages // worker_count
    extra_pages = total_pages % worker_count

    ranges = []
    next_start = start_page
    for worker_index in range(worker_count):
        length = base_pages + (1 if worker_index < extra_pages else 0)
        next_end = next_start + length - 1
        ranges.append((next_start, next_end))
        next_start = next_end + 1
    return ranges


def scrape_worker(
    worker_id,
    page_range,
    term_name,
    page_size,
    part_file,
    cookies,
    storage,
    headless,
):
    driver = setup_driver(headless=headless)
    wait = WebDriverWait(driver, 25)
    start_page, end_page = page_range

    try:
        prime_authenticated_session(driver, cookies, storage)
        headers = prepare_results_page(driver, wait, term_name, page_size)
        rows = scrape_page_range(driver, wait, start_page, end_page, part_file)
        return {
            "worker_id": worker_id,
            "page_range": page_range,
            "part_file": part_file,
            "headers": headers,
            "rows": rows,
        }
    finally:
        driver.quit()


def merge_part_files(output_file, headers, worker_results, keep_parts):
    output_file.parent.mkdir(parents=True, exist_ok=True)
    ordered_results = sorted(worker_results, key=lambda result: result["page_range"][0])

    with output_file.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)
        for result in ordered_results:
            with result["part_file"].open("r", newline="", encoding="utf-8") as part:
                reader = csv.reader(part)
                writer.writerows(reader)

    if not keep_parts:
        for result in ordered_results:
            try:
                result["part_file"].unlink()
            except FileNotFoundError:
                pass


def main():
    args = parse_args()
    if args.start_page < 1:
        raise ValueError("--start-page must be at least 1")
    if args.start_page > args.end_page:
        raise ValueError("--start-page must be smaller than or equal to --end-page")

    page_ranges = split_page_ranges(args.start_page, args.end_page, args.workers)
    worker_count = len(page_ranges)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = (
        output_dir
        / f"{args.term}_page{args.start_page}_to_{args.end_page}.csv"
    )
    safe_term = safe_filename_part(args.term)

    login_driver = setup_driver(headless=False)
    try:
        cookies, storage = wait_for_manual_login(login_driver)
    finally:
        if not args.keep_login_browser_open:
            login_driver.quit()

    logger.info(
        "Starting scrape: term=%s, pages=%s-%s, workers=%s",
        args.term,
        args.start_page,
        args.end_page,
        worker_count,
    )

    worker_results = []
    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        futures = []
        for worker_id, page_range in enumerate(page_ranges, start=1):
            part_file = (
                output_dir
                / f".{safe_term}_page{page_range[0]}_to_{page_range[1]}_part{worker_id}.csv"
            )
            futures.append(
                executor.submit(
                    scrape_worker,
                    worker_id,
                    page_range,
                    args.term,
                    args.page_size,
                    part_file,
                    cookies,
                    storage,
                    not args.headed_workers,
                )
            )

        for future in as_completed(futures):
            result = future.result()
            worker_results.append(result)
            logger.info(
                "Worker %s complete: pages=%s-%s rows=%s",
                result["worker_id"],
                result["page_range"][0],
                result["page_range"][1],
                result["rows"],
            )

    headers = worker_results[0]["headers"] if worker_results else []
    merge_part_files(output_file, headers, worker_results, args.keep_parts)
    logger.info("Scrape complete. Wrote %s", output_file)


if __name__ == "__main__":
    main()
