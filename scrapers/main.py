from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException, TimeoutException
from selenium.webdriver.support import expected_conditions as EC
import json
import logging
import time

# setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

options = webdriver.ChromeOptions()
# options.add_argument('--headless')

driver = webdriver.Chrome(options=options)  # Update with your ChromeDriver path

# Set an explicit wait time
wait = WebDriverWait(driver, 30)

# Open the web page (update this URL to the actual page you want to scrape)
url = 'https://publiceservices.smu.edu.sg/psc/ps/EMPLOYEE/HRMS/c/SIS_CR.SIS_CLASS_SEARCH.GBL?PAGE=SSR_CLSRCH_CRSECAT'
driver.get(url)
logging.info(f"Opened {url}")

def click_if_exists(xpath):
    try:
        button = driver.find_element(By.XPATH, xpath)
        button.click()
        logging.info(f"Button at {xpath} clicked.")
    except NoSuchElementException:
        logging.info(f"Button at {xpath} not found, skipping click")

def viewAllSections():
    click_if_exists('//*[@id="CLASS_TBL_VW5$hviewall$0"]')
    try:
        # Wait until the button is no longer present or visible
        WebDriverWait(driver, 5).until(EC.invisibility_of_element_located((By.XPATH, '//*[@id="CLASS_TBL_VW5$hviewall$0"]')))
        logging.info("view all sections button is no longer present")
        return True
    except TimeoutException:
        logging.info("view all sections button is still present after 5 seconds")
        return False
    pass

# Create a dictionary to store scraped data
course_data = {}
try:
    # Scrape Course Details
    course_data['course_detail'] = {
        "title": wait.until(EC.presence_of_element_located((By.ID, "DERIVED_CRSECAT_DESCR200"))).text.strip(),
        "career": wait.until(EC.presence_of_element_located((By.ID, "SSR_CRSE_OFF_VW_ACAD_CAREER$0"))).text.strip(),
        "units": wait.until(EC.presence_of_element_located((By.ID, "DERIVED_CRSECAT_UNITS_RANGE$0"))).text.strip(),
        "grading_basis": wait.until(EC.presence_of_element_located((By.ID, "SSR_CRSE_OFF_VW_GRADING_BASIS$0"))).text.strip(),
        "course_components": wait.until(EC.presence_of_element_located((By.ID, "DERIVED_CRSECAT_DESCR$0"))).text.strip(),
        "campus": wait.until(EC.presence_of_element_located((By.ID, "CAMPUS_TBL_DESCR$0"))).text.strip(),
        "academic_group": wait.until(EC.presence_of_element_located((By.ID, "ACAD_GROUP_TBL_DESCR$0"))).text.strip(),
        "academic_organization": wait.until(EC.presence_of_element_located((By.ID, "ACAD_ORG_TBL_DESCR$0"))).text.strip(),
        "description": wait.until(EC.presence_of_element_located((By.ID, "SSR_CRSE_OFF_VW_DESCRLONG$0"))).text.strip()
    }
    logging.info("Course details scraped successfully")
    
except Exception as e:
    logging.error(f"Error scraping course details: {e}")

# scrape Section Information
sections = []
try:
    # click View class sections button
    viewClassSectionsButtonXpath = '//input[@id="DERIVED_SAA_CRS_SSR_PB_GO"]'
    viewClassSectionsButton = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, viewClassSectionsButtonXpath))
    )
    viewClassSectionsButton.click()
    element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//span[@id="DERIVED_SAA_CRS_DESCR200"]'))
    )
    logging.info("viewClassSections successfully")
    # click view all sections of it exists

    viewAllSections()
    logging.info("view all sections successfully")
    section_rows =  driver.find_elements(By.XPATH, '//table[@id="ACE_CLASS_TBL_VW5$0"]/tbody//tr')
    actualSectionsNum = int(driver.find_element(By.XPATH, '//span[@class="PSGRIDCOUNTER"]').text.split("of ")[-1])
    logging.info("Total sections: " + str(actualSectionsNum))

    numRows = len(section_rows)
    for i in range(0, numRows - 4, 4):
        section = {}
        if i//4 >= actualSectionsNum:
            logging.info("Scraping of all " + str(actualSectionsNum) + " sections complete")
            break
        try:
            section['section'] = driver.find_element(By.XPATH, '//*[@id="trCLASS$' + str(i//4) + '_row1"]/th').text
            sectionDataTable = driver.find_element(By.XPATH, '//table[@id="CLASS_MTGPAT$scroll$' + str(i//4) + '"]/tbody/tr/td/table/tbody')

            section['day'] = sectionDataTable.find_element(By.XPATH, "./tr[2]/th[1]").text.strip()
            section['start'] = sectionDataTable.find_element(By.XPATH, ".//td[1]").text.strip()
            section['end'] = sectionDataTable.find_element(By.XPATH, ".//td[2]").text.strip()
            section['room'] = sectionDataTable.find_element(By.XPATH, ".//td[3]").text.strip()
            section['instructor'] = sectionDataTable.find_element(By.XPATH, ".//td[4]").text.strip()
            section['dates'] = sectionDataTable.find_element(By.XPATH, ".//td[5]").text.strip()

            sections.append(section)
        
        except Exception as e:
            logging.error(f"Error scraping section information: {e}")
    
    # Add sections to course data
    course_data['sections'] = sections
    logging.info("Sections scraped successfully")
    
except Exception as e:
    logging.error(f"Error scraping sections: {e}")

driver.quit()
logging.info("Browser closed")

# Convert to JSON and print the result
course_data_json = json.dumps(course_data, indent=4)
print(course_data_json)

# for now, save to a file
with open('course_data.json', 'w') as json_file:
    json.dump(course_data, json_file, indent=4)
    logging.info("Data saved to course_data.json")