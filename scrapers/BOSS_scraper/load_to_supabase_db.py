import os
import json
from supabase import create_client, Client
import logging
from dotenv import load_dotenv
from datetime import datetime

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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
        response = supabase.table("course_info").upsert(course_info).execute()
        if response.data:
            logger.info(f"SUCCESS: Upserted course_info for course_code: {course_info['course_code']}")
        else:
            logger.error(f"Failed to upsert course_info: {response}")
    except Exception as e:
        logger.error(f"Error upserting course_info: {e}")

def upsert_term(term):
    """Upserts term data into the Supabase DB."""
    try:
        response = supabase.table("terms").upsert(term).execute()
        if response.data:
            logger.info(f"SUCCESS: Upserted/Found term: {term['term']}")
        else:
            logger.error(f"Failed to upsert term: {response}")
    except Exception as e:
        logger.error(f"Error upserting term: {e}")

def upsert_course_section(section_info):
    """Inserts course section data into the Supabase DB or updates it if it already exists."""
    try:
        # Check if the section with the same section_code, course_id, and term_id already exists
        existing_section = supabase.table("sections").select("id")\
            .eq("section", section_info['section'])\
            .eq("term", section_info['term'])\
            .eq("course_id", section_info['course_id']).execute()

        if existing_section.data:
            logger.warning(f"Section already exists for section: {section_info['section']}, course_id: {section_info['course_id']}, and term {section_info['term']}. Skipping insert.")
            # Optionally, you can update the section instead of skipping if needed
            # supabase.table("sections").update(section_info).eq("id", existing_section.data[0]['id']).execute()
        else:
            # Insert the new section if it doesn't already exist
            response = supabase.table("sections").upsert(section_info).execute()
            if response.data:
                logger.info(f"SUCCESS: upserted course section for section: {section_info['section']}, course_id: {section_info['course_id']} in term {section_info['term']}")
            else:
                logger.error(f"Failed to upsert section: {response}")
    except Exception as e:
        logger.error(f"Error inserting section: {e}")

def upsert_course_area(course_id, area_name):
    """Upserts course area into the database."""
    try:
        response = supabase.table("course_areas").upsert({"course_id": course_id, "area_name": area_name}).execute()
        if response.data:
            logger.info(f"SUCCESS: Upserted course area: {area_name}")
        else:
            logger.error(f"Failed to upsert course area: {response}")
    except Exception as e:
        logger.error(f"Error upserting course area: {e}")

def upsert_course_area_assignment(course_id, area_id):
    """Inserts course area assignment data."""
    try:
        response = supabase.table("course_area_assignments").upsert({"course_id": course_id, "area_id": area_id}).execute()
        if response.data:
            logger.info(f"SUCCESS: Upserted course_area_assignment for course_id: {course_id} and area_id: {area_id}")
        else:
            logger.error(f"Failed to upsert course area assignment: {response}")
    except Exception as e:
        logger.error(f"Error upserting course area assignment: {e}")

def upsert_availability(availability_info):
    """Inserts availability data for sections into the database."""
    try:
        response = supabase.table("availability").upsert(availability_info).execute()
        if response.data:
            logger.info(f"SUCCESS: upserted availability for section_id: {availability_info['section_id']}")
        else:
            logger.error(f"Failed to upsert availability: {response}")
    except Exception as e:
        logger.error(f"Error upserting availability: {e}")

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
                        # Check if "enrolment_requirements" exists before inserting
                        "enrolment_requirements": data["course_detail"].get("enrolment_requirements", "Not Available")
                    }
                    # upsert_course_info(course_info)

                    # Process term
                    term_info = {
                        "term": data.get("term")
                    }
                    # upsert_term(term_info)

                    # Get course_id and term_id for section insertion
                    course_code = data.get("course_code")
                    term_name = data.get("term")
                    course_id = supabase.table("course_info").select("id").eq("course_code", course_code).execute().data[0]["id"]
                    term_id = supabase.table("terms").select("id").eq("term", term_name).execute().data[0]["id"]

                    # Process section_info if it exists
                    if "section_info" in data:
                        section_info = {
                            "course_id": course_id,
                            "term": term_id,
                            "section": data["section_info"].get("section"),
                            "day": data["section_info"].get("day"),
                            "start_time": data["section_info"].get("start_time"),
                            "end_time": data["section_info"].get("end_time"),
                            "venue": data["section_info"].get("venue"),
                            "instructor": data["section_info"].get("instructor"),
                            "start_date": convert_date_format(data["section_info"].get("start_date")),
                            "end_date": convert_date_format(data["section_info"].get("end_date")),
                            "class_number": data["class_number"]
                        }
                        upsert_course_section(section_info)

                        # Insert availability if available
                        if "availability" in data["section_info"]:
                            availability_info = {
                                "section_id": supabase.table("sections").select("id").eq("section", data["section_info"]["section"]).execute().data[0]["id"],
                                "total_seats": data["section_info"]["availability"].get("total"),
                                "current_enrolled": data["section_info"]["availability"].get("current_enrolled"),
                                "reserved_seats": data["section_info"]["availability"].get("reserved"),
                                "available_seats": data["section_info"]["availability"].get("available_seats")
                            }
                            upsert_availability(availability_info)
                    # Process course_areas if they exist
                    if "course_areas" in data["section_info"]:
                        for area_name in data["section_info"]["course_areas"]:
                            course_id = supabase.table("course_info").select("id").eq("course_code", course_code).execute().data[0]["id"]
                            upsert_course_area(course_id, area_name)
                            # area_id = supabase.table("course_areas").select("id").eq("area_name", area_name).execute().data[0]["id"]
                            # upsert_course_area_assignment(course_id, area_id)
                        
                    else:
                        logger.warning(f"No section_info found in file: {filename}. Skipping section insertion.")

                    

            except Exception as e:
                logger.error(f"Error processing file {filename}: {e}")
        else:
            logger.warning(f"Skipped non-JSON file: {filename}")

# Directory containing JSON files
directory_path = "scrapedData/2410"

# Start processing
process_json_files(directory_path)
