import os
import csv
import time
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException, TimeoutException, NoAlertPresentException
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def setup_driver():
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    return driver

def handle_alert(driver):
    try:
        alert = driver.switch_to.alert
        alert_text = alert.text
        logging.info(f"Handling alert with text: {alert_text}")
        alert.accept()  # Clicks the "OK" button
        logging.info("Alert accepted.")
        # Optional: Wait briefly after accepting the alert
        time.sleep(2)
        return True
    except NoAlertPresentException:
        # No alert to handle
        return False
    except Exception as e:
        logging.error(f"Error handling alert: {e}")
        return False

def loginToBOSS(wait):
    load_dotenv('../.env.local')
    USERNAME = os.getenv('USERNAME')
    PASSWORD = os.getenv('PASSWORD')
    try:
        username_input = wait.until(EC.presence_of_element_located((By.ID, 'userNameInput')))
        username_input.send_keys(USERNAME)

        password_input = wait.until(EC.presence_of_element_located((By.ID, 'passwordInput')))
        password_input.send_keys(PASSWORD)

        sign_in_button = wait.until(EC.element_to_be_clickable((By.ID, 'submitButton')))
        sign_in_button.click()
        logging.info("Waiting 10 seconds for user to key in 2FA auth code")
        time.sleep(10)

        logging.info("Login Form submitted successfully")

    except NoSuchElementException as e:
        logging.error(f"Element not found: {e}")
    except Exception as e:
        logging.error(f"An error occurred while logging in: {e}")

def select_term(driver, wait, term_name):
    try:
        # openTerm dropdown
        term_arrow = wait.until(EC.element_to_be_clickable((By.ID, 'rcboTerm_Arrow')))
        term_arrow.click()
        logging.info("Term dropdown opened.")
        # wait for dropdown to fully open
        time.sleep(1)

        wait.until(EC.visibility_of_element_located((By.ID, 'rcboTerm_DropDown')))
        term_items = driver.find_elements(By.CSS_SELECTOR, '#rcboTerm_DropDown .rcbList li')

        # Uncheck all checkboxes
        for item in term_items:
            checkbox = item.find_element(By.CSS_SELECTOR, 'input[type="checkbox"]')
            if checkbox.is_selected():
                checkbox.click()
                logging.info(f"Unchecked term: {item.text.strip()}")

        # Select the desired term
        term_found = False
        for item in term_items:
            label_text = item.text.strip()
            logging.info("label_text: " + label_text)
            if label_text == term_name:
                checkbox = item.find_element(By.CSS_SELECTOR, 'input[type="checkbox"]')
                if not checkbox.is_selected():
                    checkbox.click()
                    logging.info(f"Selected term: {label_text}")
                term_found = True
                break

        if not term_found:
            logging.error(f"Term '{term_name}' not found.")
            return False

        # close dropdown
        body = driver.find_element(By.TAG_NAME, 'body')
        body.click()
        logging.info("Term dropdown closed.")
        return True

    except Exception as e:
        logging.error(f"Error selecting term: {e}")
        return False

def click_search(wait):
    try:
        search_button = wait.until(EC.element_to_be_clickable((By.ID, 'RadButton_Search_input')))
        search_button.click()
        logging.info("Search button clicked.")

        # wait for results table to load
        wait.until(EC.presence_of_element_located((By.ID, 'RadGrid_OverallResults_ctl00')))
        logging.info("Results table loaded.")

    except Exception as e:
        logging.error(f"Error clicking search button or loading results: {e}")

def set_page_size(driver, wait, size):
    try:
        # Click the page size dropdown arrow
        page_size_combo = wait.until(EC.element_to_be_clickable((By.ID, 'RadGrid_OverallResults_ctl00_ctl03_ctl01_PageSizeComboBox_Arrow')))
        page_size_combo.click()
        logging.info("Page size dropdown clicked.")

        size_option_xpath = f'//div[@id="RadGrid_OverallResults_ctl00_ctl03_ctl01_PageSizeComboBox_DropDown"]//li[text()="{size}"]'

        # Wait for the dropdown list to be visible
        wait.until(EC.visibility_of_element_located((By.XPATH, size_option_xpath)))

        # Click on the desired size option
        size_option = driver.find_element(By.XPATH, size_option_xpath)
        size_option.click()
        logging.info(f"Page size set to {size}.")

        # Wait for the table to reload after setting page size
        wait.until(EC.presence_of_element_located((By.XPATH, '//table[contains(@id, "RadGrid_OverallResults")]/tbody/tr[@class="rgRow"]')))
        logging.info("Table reloaded after setting page size.")
    except TimeoutException:
        logging.error("Timeout while setting page size.")
        driver.save_screenshot('set_page_size_timeout.png')
        logging.info("Saved screenshot 'set_page_size_timeout.png' due to timeout.")
    except NoSuchElementException:
        logging.error(f"Page size option '{size}' not found.")
        driver.save_screenshot('page_size_option_not_found.png')
        logging.info("Saved screenshot 'page_size_option_not_found.png' as the desired page size option was not found.")
    except Exception as e:
        logging.error(f"Error setting page size: {e}")
        driver.save_screenshot('set_page_size_error.png')
        logging.info("Saved screenshot 'set_page_size_error.png' due to error.")


def get_table_headers(driver):
    try:
        table = driver.find_element(By.ID, 'RadGrid_OverallResults_ctl00')
        thead = table.find_element(By.TAG_NAME, 'thead')
        header_row = thead.find_element(By.TAG_NAME, 'tr')
        headers = header_row.find_elements(By.TAG_NAME, 'th')
        header_names = [header.text.strip() for header in headers]
        logging.info(f"Headers: {header_names}")
        return header_names
    except Exception as e:
        logging.error(f"Error getting table headers: {e}")
        return []

def get_table_data(driver, wait):
    data = []
    try:
        # wait till rows show
        wait.until(EC.presence_of_element_located((By.XPATH, '//table[@id="RadGrid_OverallResults_ctl00"]/tbody/tr[@class="rgRow"]')))
        
        table = driver.find_element(By.ID, 'RadGrid_OverallResults_ctl00')
        logging.info("Table found for data extraction.")

        tbody = table.find_element(By.XPATH, '//table[@id="RadGrid_OverallResults_ctl00"]/tbody')
        rows = tbody.find_elements(By.XPATH, './tr[contains(@class, "rgRow") or contains(@class, "rgAltRow")]')
        logging.info(f"Found {len(rows)} 'rgRow' data rows.")

        for index, row in enumerate(rows, start=1):
            if handle_alert(driver):
                logging.info("Handled alert before processing the row.")
            cells = row.find_elements(By.TAG_NAME, 'td')
            row_data = []
            for cell in cells:
                # Handle cells with links (e.g., 'Sect' column)
                links = cell.find_elements(By.TAG_NAME, 'a')
                if links:
                    cell_text = ' '.join([link.text.strip() for link in links])
                else:
                    cell_text = cell.text.strip()
                row_data.append(cell_text)
            logging.info(f"Row {index} data: {row_data}")
            data.append(row_data)
        return data
    except NoSuchElementException as e:
        logging.error(f"Data rows not found: {e}")
        driver.save_screenshot('data_rows_not_found.png')
        logging.info("Saved screenshot 'data_rows_not_found.png' as data rows were not found.")
        return data
    except TimeoutException:
        logging.error("Timeout waiting for data rows.")
        driver.save_screenshot('data_rows_timeout.png')
        logging.info("Saved screenshot 'data_rows_timeout.png' due to timeout.")
        return data
    except Exception as e:
        logging.error(f"Error getting table data: {e}")
        return data


def is_next_page_available(driver):
    try:
        next_page_button = driver.find_element(By.CSS_SELECTOR, 'input.rgPageNext')
        if 'rgPageNextDisabled' in next_page_button.get_attribute('class') or not next_page_button.is_enabled():
            return False
        return True
    except NoSuchElementException:
        logging.info("Next Page button not found.")
        return False
    except Exception as e:
        logging.error(f"Error checking next page availability: {e}")
        return False

def click_next_page(driver, wait):
    # Click the Next Page button
    try:
        next_page_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'input.rgPageNext')))
        next_page_button.click()
        logging.info("Navigated to next page.")
        page_number += 1
        # wait for the new pages table to load
        wait.until(EC.staleness_of(next_page_button))
        wait.until(EC.presence_of_element_located((By.ID, 'RadGrid_OverallResults_ctl00')))
        time.sleep(1)  # small delay to ensure the page is fully loaded
    except Exception as e:
        logging.error
        return

def scrape_data(driver, wait, output_file, start_page, end_page):
    try:
        headers = get_table_headers(driver)
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(headers)
            logging.info("CSV file opened and headers written.")

            set_page_size(driver, wait, 50)
            time.sleep(2)
            page_number = 1

            while page_number < start_page:
                next_page_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'input.rgPageNext')))
                time.sleep(0.2)
                next_page_button.click()
                logging.info("Navigated to next page.")
                page_number += 1
                # wait for the new pages table to load
                wait.until(EC.staleness_of(next_page_button))
                wait.until(EC.presence_of_element_located((By.ID, 'RadGrid_OverallResults_ctl00')))
                time.sleep(1)  # small delay to ensure the page is fully loaded
            
            while page_number < end_page:
                logging.info(f"Scraping data from page {page_number}")
                # set_page_size(driver, wait, 50)
                data_rows = get_table_data(driver, wait)
                writer.writerows(data_rows)
                logging.info(f"Wrote {len(data_rows)} rows to CSV.")

                # Check if there's a next page
                if not is_next_page_available(driver):
                    logging.info("No more pages to navigate. Scraping complete.")
                    break
                # click_next_page(driver, wait)

                # Click the Next Page button
                try:
                    next_page_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'input.rgPageNext')))
                    next_page_button.click()
                    logging.info("Navigated to next page.")
                    page_number += 1
                    # wait for the new pages table to load
                    wait.until(EC.staleness_of(next_page_button))
                    wait.until(EC.presence_of_element_located((By.ID, 'RadGrid_OverallResults_ctl00')))
                    time.sleep(1)  # small delay to ensure the page is fully loaded
                except Exception as e:
                    logging.error(f"Error navigating to next page: {e}")
                    break
    except Exception as e:
        logging.error(f"Error during scraping: {e}")

def main():
    driver = setup_driver()
    wait = WebDriverWait(driver, 15)
    driver.get('https://boss.intranet.smu.edu.sg/OverallResults.aspx')
    loginToBOSS(wait)
    logging.info("Navigated to the webpage.")

    # SPECIFY term here
    term_name = '2024-25 Term 1'
    if not select_term(driver, wait, term_name):
        driver.quit()
        return
    # modify start and end yourself
    start_page = 1
    end_page = 100
    click_search(wait)
    output_file = f'scrapedData/{term_name}_page{start_page}_to_{end_page}.csv'
    scrape_data(driver, wait, output_file, start_page, end_page)

    # driver.quit()
    # logging.info("Browser closed.")

if __name__ == "__main__":
    main()
