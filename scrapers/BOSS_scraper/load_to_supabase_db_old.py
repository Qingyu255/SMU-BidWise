import os
import json
from supabase import create_client, Client
import logging
from dotenv import load_dotenv
from datetime import datetime


# Load environment variables
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configure logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

def convert_date_format(date_str):
    """convert date from 'DD/MM/YYYY' to 'YYYY-MM-DD'"""
    try:
        return datetime.strptime(date_str, "%d/%m/%Y").strftime("%Y-%m-%d")
    except ValueError:
        logger.error(f"Invalid date format: {date_str}")
        return None

def upsert_course_info(course_info):
    """Upserts course_info data into the Supabase DB."""
    try:
        response = supabase.table("course_info").upsert(course_info, on_conflict=["course_code"]).execute()
        if response.data:
            logger.info(f"Upserted course_info for course_code: {course_info['course_code']}")
        else:
            logger.error(f"Failed to upsert course_info: {response}")
    except Exception as e:
        logger.error(f"Error upserting course_info: {e}")

def upsert_term(term_name):
    """Upserts term data into the Supabase DB and returns the term ID."""
    try:
        # Upsert the term (without using select in the same call)
        response = supabase.table("terms").upsert({"term_name": term_name}, on_conflict=["term_name"]).execute()
        if response.data:
            logger.info(f"Upserted/Found term: {term_name}")
            # Now query to get the term_id based on term_name
            select_response = supabase.table("terms").select("id").eq("term_name", term_name).execute()
            if select_response.data:
                term_id = select_response.data[0]["id"]
                logger.info(f"Retrieved term ID for term: {term_name} -> {term_id}")
                return term_id
        else:
            logger.error(f"Failed to upsert term: {response}")
    except Exception as e:
        logger.error(f"Error upserting term: {e}")
    return None

def insert_course_section(section_info):
    """Inserts course section data into the Supabase DB."""
    try:
        # Get the course_id from the course_info table based on course_code
        course_code = section_info.get("course_code")
        course_response = supabase.table("course_info").select("id").eq("course_code", course_code).execute()
        
        if course_response.data:
            course_id = course_response.data[0]["id"]
            logger.info(f"Retrieved course ID for course_code: {course_code} -> {course_id}")
            
            # Now insert the section, using the correct course_id
            section_data = {
                "course_id": course_id,  # Correct UUID for course
                "term_id": section_info.get("term_id"),  # Should already be a valid term UUID
                "section_code": section_info.get("section_code"),
                "day": section_info.get("day"),
                "start_time": section_info.get("start_time"),
                "end_time": section_info.get("end_time"),
                "venue": section_info.get("venue"),
                "instructor": section_info.get("instructor"),
                "start_date": convert_date_format(section_info.get("start_date")),
                "end_date": convert_date_format(section_info.get("end_date"))
            }

            # Insert section into the database
            response = supabase.table("sections").insert(section_data).execute()
            if response.data:
                logger.info(f"Inserted course section for section: {section_info['section']} in term {section_info['term']}")
            else:
                logger.error(f"Failed to insert section: {response}")
        else:
            logger.error(f"Course ID not found for course_code: {course_code}")
    except Exception as e:
        logger.error(f"Error inserting section: {e}")


def process_json_files(directory):
    """Processes all JSON files in a directory and inserts/upserts data."""
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            file_path = os.path.join(directory, filename)
            try:
                with open(file_path, 'r') as file:
                    data = json.load(file)
                    logger.info(f"Processing file: {filename}")

                    # Process course_info
                    course_info = {
                        "course_code": data.get("course_code"),
                        "title": data["course_detail"].get("title"),
                        "career": data["course_detail"].get("career"),
                        "units": data["course_detail"].get("units"),
                        "grading_basis": data["course_detail"].get("grading_basis"),
                        "description": data["course_detail"].get("description"),
                        "enrolment_requirements": data["course_detail"].get("enrolment_requirements", "Not Available")
                    }
                    upsert_course_info(course_info)

                    # Process term
                    term_name = data.get("term")
                    if term_name:
                        term_id = upsert_term(term_name)

                        # Process section_info if it exists
                        if "section_info" in data and term_id:
                            section_info = {
                                "course_code": data.get("course_code"),
                                "course_id": course_info["course_code"],  # Using course_code as the unique identifier
                                "term_id": term_id,  # Use the returned term_id from upserting term
                                "section_code": data["section_info"].get("section"),
                                "day": data["section_info"].get("day"),
                                "start_time": data["section_info"].get("start_time"),
                                "end_time": data["section_info"].get("end_time"),
                                "venue": data["section_info"].get("venue"),
                                "instructor": data["section_info"].get("instructor"),
                                "start_date": data["section_info"].get("start_date"),
                                "end_date": data["section_info"].get("end_date")
                            }
                            insert_course_section(section_info)
                        else:
                            logger.warning(f"No section_info found in file: {filename}. Skipping section insertion.")
                    else:
                        logger.error(f"No term information found in {filename}, skipping processing.")
            except Exception as e:
                logger.error(f"Error processing file {filename}: {e}")
        else:
            logger.warning(f"Skipped non-JSON file: {filename}")

# Directory containing JSON files
directory_path = "scrapedData/2410"

# Start processing
process_json_files(directory_path)