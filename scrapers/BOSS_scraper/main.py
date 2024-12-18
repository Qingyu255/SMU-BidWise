from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException, TimeoutException
from selenium.webdriver.support import expected_conditions as EC
import json
import logging
import time
from datetime import datetime
import os
from dotenv import load_dotenv
import sys

# setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    return driver

def click_if_exists(driver, xpath):
    try:
        button = driver.find_element(By.XPATH, xpath)
        button.click()
        logging.info(f"Button at {xpath} clicked.")
    except NoSuchElementException:
        logging.info(f"Button at {xpath} not found, skipping click")

def convertDateRange(date):
    # """converts datetime format such as from 19-Aug-2024 to 19/08/2024"""
    input_format = '%d-%b-%Y'
    output_format = '%d/%m/%Y'
    return datetime.strptime(date.strip(), input_format).strftime(output_format)

# login
def loginToBOSS(wait):
    load_dotenv('../.env.local')
    USERNAME = os.getenv('USERNAME')
    PASSWORD = os.getenv('PASSWORD')
    VERIFICATION_CODE = sys.argv[1]
    try:
        username_input = wait.until(EC.presence_of_element_located((By.ID, 'userNameInput')))
        username_input.send_keys(USERNAME)

        password_input = wait.until(EC.presence_of_element_located((By.ID, 'passwordInput')))
        password_input.send_keys(PASSWORD)

        sign_in_button = wait.until(EC.element_to_be_clickable((By.ID, 'submitButton')))
        sign_in_button.click()

        verification_input = wait.until(EC.element_to_be_clickable((By.ID, 'verificationCodeInput')))
        verification_input.send_keys(VERIFICATION_CODE)

        sign_in_button2 = wait.until(EC.element_to_be_clickable((By.ID, 'signInButton')))
        sign_in_button2.click()

        time.sleep(2)

        logging.info("Login Form submitted successfully")

    except NoSuchElementException as e:
        logging.error(f"Element not found: {e}")
    except Exception as e:
        logging.error(f"An error occurred while logging in: {e}")

def isCourseNumberInvalid(driver):
    try:
        wait = WebDriverWait(driver, 0.2)
        wait.until(
            EC.presence_of_element_located((By.ID, 'errorcontent'))
        )
        logging.info("Error content found, indicating invalid course number.")
        return True

    except TimeoutException:
        logging.info("No error content found within the wait time.")
        return False
    except Exception as e:
        logging.error(f"exception while checking if the error message exists: {e}")
        return False


def scrapeCourseDetails(driver, wait, course_data, i):
    try:
        courseCode, sectionCode = driver.find_element(By.XPATH, '//*[@id="lblClassInfoHeader"]').text.split(" - ")
        course_data['course_code'] = courseCode
        course_data['term'] = driver.find_element(By.XPATH, '//*[@id="lblClassInfoSubHeader"]').text.strip()
        course_data['section'] = sectionCode
        # Scrape Course Details
        course_data['course_detail'] = {
            "title": wait.until(EC.presence_of_element_located((By.ID, "lblClassSection"))).text.strip(),
            "career": wait.until(EC.presence_of_element_located((By.XPATH, '//*[@id="lblAcademic"]'))).text.strip(),
            "units": wait.until(EC.presence_of_element_located((By.ID, "lblUnits"))).text.strip(),
            "grading_basis": wait.until(EC.presence_of_element_located((By.ID, "lblGradingBasis"))).text.strip(),
            "description": wait.until(EC.presence_of_element_located((By.ID, "lblCourseDescription"))).text.strip(),
            "enrolment_requirements": driver.find_element(By.XPATH, '//*[@id="lblEnrolmentRequirements"]').text.strip()
        }
        logging.info("Course details scraped successfully")

        section = {}
        # section['section'] = driver.find_element(By.XPATH, '//*[@id="lblClassInfoHeader"]').text.split(" - ")[-1]
        section['section'] = course_data['section']

        rows = driver.find_elements(By.XPATH, '//*[@id="RadGrid_MeetingInfo_ctl00"]/tbody/tr')
        row = rows[i]
        section['type'] = row.find_element(By.XPATH, './td[1]').text.strip() # 'class' or 'exam'
        section['day'] = row.find_element(By.XPATH, './td[4]').text.strip()
        section['start_time'] = row.find_element(By.XPATH, './td[5]').text.strip()
        section['end_time'] = row.find_element(By.XPATH, './td[6]').text.strip()
        section['venue'] = row.find_element(By.XPATH, './td[7]').text.strip()
        section['instructor'] = row.find_element(By.XPATH, './td[8]').text.strip()
        section['start_date'] = convertDateRange(row.find_element(By.XPATH, './td[2]').text.strip())
        section['end_date'] = convertDateRange(row.find_element(By.XPATH, './td[3]').text.strip())
        course_data['section_info'] = section
        logging.info("Section details scraped successfully")
        # scrape course areas
        span_element = wait.until(EC.presence_of_element_located((By.ID, "lblCourseAreas")))
        list_items = span_element.find_elements(By.TAG_NAME, "li")
        courseAreas = [item.text for item in list_items]
        section["course_areas"] = courseAreas

        availability = {
            "total": driver.find_element(By.XPATH, '//*[@id="lblClassCapacity"]').text.strip(),
            "current_enrolled": driver.find_element(By.XPATH, '//*[@id="lblEnrolmentTotal"]').text.strip(),
            "reserved": driver.find_element(By.XPATH, '//*[@id="lblReserved"]').text.strip(),
            "available_seats": driver.find_element(By.XPATH, '//*[@id="lblAvailableSeats"]').text.strip(),
        }
        section["availability"] = availability
        
        logging.info("Sections scraped successfully")
        
    except Exception as e:
        logging.error(f"Error scraping course details: {e}")


def main():
    driver = setup_driver()
    wait = WebDriverWait(driver, 15)
    url = f'https://boss.intranet.smu.edu.sg/ClassDetails.aspx?SelectedAcadTerm=2410&SelectedClassNumber=2370'
    driver.get(url)
    loginToBOSS(wait)

    acadTerm = "2420"

    for classNumber in range(1000, 3001):
        try:
            url = f'https://boss.intranet.smu.edu.sg/ClassDetails.aspx?SelectedAcadTerm={acadTerm}&SelectedClassNumber={classNumber}'
            driver.get(url)
            logging.info(f"Opened {url}")

            if isCourseNumberInvalid(driver):
                logging.info(f"Invalid class number: class_number of {classNumber} does not correspond to any records")
                continue
            
            rows = driver.find_elements(By.XPATH, '//*[@id="RadGrid_MeetingInfo_ctl00"]/tbody/tr')
            for i in range(len(rows)):
                course_data = {}
                course_data["term_code"] = acadTerm
                course_data["class_number"] = str(classNumber)
                scrapeCourseDetails(driver, wait, course_data, i)
                course_data_json = json.dumps(course_data, indent=4)
                print(course_data_json)
                filePath = f'scrapedData/{acadTerm}/course_data_{classNumber}_{course_data["course_code"]}_{i}.json'
                with open(filePath, 'w') as json_file:
                    json.dump(course_data, json_file, indent=4)
                    logging.info(f"Data saved to {filePath}")

        except Exception as e:
            logging.error(f"Error scraping from class number {classNumber}: {e}")

    driver.quit()
    logging.info("Browser closed")

if __name__ == "__main__":
    main()
