import argparse
import json
import logging
import os
import re
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import (
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


BOSS_ORIGIN = "https://boss.intranet.smu.edu.sg"
CLASS_DETAILS_PATH = "/ClassDetails.aspx"
MEETING_ROWS_XPATH = '//*[@id="RadGrid_MeetingInfo_ctl00"]/tbody/tr'

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(threadName)s - %(message)s",
)
logger = logging.getLogger(__name__)
file_write_lock = threading.Lock()


def parse_args():
    parser = argparse.ArgumentParser(
        description=(
            "Scrape SMU BOSS class details with one manual login and multiple "
            "authenticated Selenium workers."
        )
    )
    parser.add_argument("--term", default="2610", help="BOSS academic term code.")
    parser.add_argument(
        "--start",
        type=int,
        default=1000,
        help="First class number to scrape, inclusive.",
    )
    parser.add_argument(
        "--end",
        type=int,
        default=3001,
        help="Last class number to scrape, exclusive.",
    )
    parser.add_argument(
        "--class-numbers",
        type=int,
        nargs="+",
        help="Specific class numbers to scrape instead of the --start/--end range.",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=os.cpu_count() or 1,
        help="Number of parallel browser workers. Defaults to all CPU cores.",
    )
    parser.add_argument(
        "--headed-workers",
        action="store_true",
        help="Run worker browsers visibly. By default workers run headless.",
    )
    parser.add_argument(
        "--output-dir",
        default="scrapedData",
        help="Directory where term folders and JSON files are written.",
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


def class_details_url(term, class_number):
    return (
        f"{BOSS_ORIGIN}{CLASS_DETAILS_PATH}"
        f"?SelectedAcadTerm={term}&SelectedClassNumber={class_number}"
    )


def convert_date_range(date_text):
    return datetime.strptime(date_text.strip(), "%d-%b-%Y").strftime("%d/%m/%Y")


def safe_filename_part(value):
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value).strip("_") or "unknown"


def wait_for_manual_login(driver, term, start_class_number):
    driver.get(class_details_url(term, start_class_number))
    logger.info("Manual login browser opened.")
    input(
        "\nLog in manually in the opened Chrome window until the BOSS class "
        "details page is visible, then press Enter here to start scraping...\n"
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


def is_course_number_invalid(driver):
    try:
        WebDriverWait(driver, 0.2).until(
            EC.presence_of_element_located((By.ID, "errorcontent"))
        )
        return True
    except TimeoutException:
        return False


def element_text(parent, by, selector, default=""):
    try:
        return parent.find_element(by, selector).text.strip()
    except NoSuchElementException:
        return default


def meeting_rows_ready(driver):
    try:
        rows = driver.find_elements(By.XPATH, MEETING_ROWS_XPATH)
        return bool(rows) and all(
            element_text(row, By.XPATH, "./td[2]")
            and element_text(row, By.XPATH, "./td[3]")
            for row in rows
        )
    except StaleElementReferenceException:
        return False


def scrape_course_details(driver, wait, term_code, class_number, row_index):
    header = wait.until(
        EC.presence_of_element_located((By.XPATH, '//*[@id="lblClassInfoHeader"]'))
    ).text
    course_code, section_code = [part.strip() for part in header.split(" - ", 1)]
    rows = driver.find_elements(By.XPATH, MEETING_ROWS_XPATH)
    row = rows[row_index]

    section = {
        "section": section_code,
        "type": element_text(row, By.XPATH, "./td[1]"),
        "day": element_text(row, By.XPATH, "./td[4]"),
        "start_time": element_text(row, By.XPATH, "./td[5]"),
        "end_time": element_text(row, By.XPATH, "./td[6]"),
        "venue": element_text(row, By.XPATH, "./td[7]"),
        "instructor": element_text(row, By.XPATH, "./td[8]"),
        "start_date": convert_date_range(element_text(row, By.XPATH, "./td[2]")),
        "end_date": convert_date_range(element_text(row, By.XPATH, "./td[3]")),
    }

    course_areas_el = wait.until(
        EC.presence_of_element_located((By.ID, "lblCourseAreas"))
    )
    section["course_areas"] = [
        item.text.strip()
        for item in course_areas_el.find_elements(By.TAG_NAME, "li")
        if item.text.strip()
    ]
    section["availability"] = {
        "total": element_text(driver, By.XPATH, '//*[@id="lblClassCapacity"]'),
        "current_enrolled": element_text(driver, By.XPATH, '//*[@id="lblEnrolmentTotal"]'),
        "reserved": element_text(driver, By.XPATH, '//*[@id="lblReserved"]'),
        "available_seats": element_text(driver, By.XPATH, '//*[@id="lblAvailableSeats"]'),
    }

    return {
        "term_code": term_code,
        "class_number": str(class_number),
        "course_code": course_code,
        "term": element_text(driver, By.XPATH, '//*[@id="lblClassInfoSubHeader"]'),
        "section": section_code,
        "course_detail": {
            "title": element_text(driver, By.ID, "lblClassSection"),
            "career": element_text(driver, By.XPATH, '//*[@id="lblAcademic"]'),
            "units": element_text(driver, By.ID, "lblUnits"),
            "grading_basis": element_text(driver, By.ID, "lblGradingBasis"),
            "description": element_text(driver, By.ID, "lblCourseDescription"),
            "enrolment_requirements": element_text(
                driver,
                By.XPATH,
                '//*[@id="lblEnrolmentRequirements"]',
                default="Not Available",
            ),
        },
        "section_info": section,
    }


def save_course_data(output_dir, term, class_number, row_index, course_data):
    term_dir = Path(output_dir) / term
    term_dir.mkdir(parents=True, exist_ok=True)
    course_code = safe_filename_part(course_data["course_code"])
    file_path = term_dir / f"course_data_{class_number}_{course_code}_{row_index}.json"
    with file_write_lock:
        with file_path.open("w") as json_file:
            json.dump(course_data, json_file, indent=4)
    return file_path


def scrape_class_number(driver, wait, term, class_number, output_dir):
    url = class_details_url(term, class_number)
    driver.get(url)

    if is_course_number_invalid(driver):
        logger.info("Invalid class number: %s", class_number)
        return 0

    wait.until(meeting_rows_ready)
    row_count = len(driver.find_elements(By.XPATH, MEETING_ROWS_XPATH))
    saved_count = 0

    for row_index in range(row_count):
        course_data = scrape_course_details(
            driver,
            wait,
            term,
            class_number,
            row_index,
        )
        file_path = save_course_data(
            output_dir,
            term,
            class_number,
            row_index,
            course_data,
        )
        logger.info("Saved %s", file_path)
        saved_count += 1

    return saved_count


def split_evenly(values, chunk_count):
    chunk_count = max(1, min(chunk_count, len(values)))
    return [values[i::chunk_count] for i in range(chunk_count)]


def scrape_worker(worker_id, class_numbers, term, output_dir, cookies, storage, headless):
    driver = setup_driver(headless=headless)
    wait = WebDriverWait(driver, 12)
    saved = 0
    failed = []

    try:
        prime_authenticated_session(driver, cookies, storage)
        logger.info("Worker %s scraping %d class numbers.", worker_id, len(class_numbers))
        for class_number in class_numbers:
            try:
                saved += scrape_class_number(driver, wait, term, class_number, output_dir)
            except Exception as exc:
                failed.append(class_number)
                logger.exception("Failed scraping class number %s: %s", class_number, exc)
    finally:
        driver.quit()

    return {"worker_id": worker_id, "saved": saved, "failed": failed}


def main():
    args = parse_args()
    if args.class_numbers:
        class_numbers = sorted(set(args.class_numbers))
        class_label = ",".join(map(str, class_numbers))
    else:
        if args.start >= args.end:
            raise ValueError("--start must be smaller than --end")
        class_numbers = list(range(args.start, args.end))
        class_label = f"{args.start}-{args.end - 1}"
    worker_count = max(1, min(args.workers, len(class_numbers)))

    login_driver = setup_driver(headless=False)
    try:
        cookies, storage = wait_for_manual_login(login_driver, args.term, class_numbers[0])
    finally:
        if not args.keep_login_browser_open:
            login_driver.quit()

    chunks = split_evenly(class_numbers, worker_count)
    logger.info(
        "Starting scrape: term=%s, classes=%s, workers=%s",
        args.term,
        class_label,
        worker_count,
    )

    total_saved = 0
    failed = []
    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        futures = [
            executor.submit(
                scrape_worker,
                worker_id,
                chunk,
                args.term,
                args.output_dir,
                cookies,
                storage,
                not args.headed_workers,
            )
            for worker_id, chunk in enumerate(chunks, start=1)
            if chunk
        ]
        for future in as_completed(futures):
            result = future.result()
            total_saved += result["saved"]
            failed.extend(result["failed"])
            logger.info(
                "Worker %s complete: saved=%s failed=%s",
                result["worker_id"],
                result["saved"],
                len(result["failed"]),
            )

    logger.info("Scrape complete. Saved %s JSON files.", total_saved)
    if failed:
        logger.warning("Failed class numbers: %s", ", ".join(map(str, sorted(failed))))


if __name__ == "__main__":
    main()
