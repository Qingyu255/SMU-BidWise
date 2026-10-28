import os
import json
import time
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from supabase import create_client, Client
import logging
from dotenv import load_dotenv
from datetime import datetime
from pathlib import Path

load_dotenv('../.env.local')

SUPABASE_URL = os.getenv('SUPABASE_URL')

# deprecated usage of anon key as I added RLS policies so that only authenticated users can insert/upsert to our tables, this script hence will need to use service role key
# SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# UPDATED: using service role key that bypasses rls policy:
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(threadName)s - %(message)s')
logger = logging.getLogger()

def convert_date_format(date_str):
    """convert date from 'DD/MM/YYYY' to 'YYYY-MM-DD'"""
    try:
        return datetime.strptime(date_str, "%d/%m/%Y").strftime("%Y-%m-%d")
    except (TypeError, ValueError):
        logger.error(f"Invalid date format: {date_str}")
        return None


def get_section_id(section_info):
    """
    Helper function to get the section ID based on multiple fields: 
    venue, instructor, start_date, end_date, and class_number.
    """
    try:
        # Build the query to match all fields
        response = supabase.table("sections").select("id")\
            .eq("venue", section_info["venue"])\
            .eq("instructor", section_info["instructor"])\
            .eq("start_date", section_info["start_date"])\
            .eq("end_date", section_info["end_date"])\
            .eq("class_number", section_info["class_number"])\
            .execute()

        if response.data and len(response.data) > 0:
            return response.data[0]["id"]
        else:
            logger.error(f"No matching section found for provided details: {section_info}")
            return None
    except Exception as e:
        logger.error(f"Error fetching section_id: {e}")
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
    """upserts course section data into the Supabase DB or updates it if it already exists."""
    try:
        # Check if the section with the same section_code, course_id, and term_id already exists
        existing_section = supabase.table("sections").select("id")\
            .eq("section", section_info['section'])\
            .eq("term", section_info['term'])\
            .eq("course_id", section_info['course_id'])\
            .eq("type", section_info['type'])\
            .eq("class_number", section_info['class_number'])\
            .eq("day", section_info['day'])\
            .eq("start_time", section_info['start_time'])\
            .execute()

        if existing_section.data:
            logger.warning(f"Section already exists for section: {section_info['section']}, course_id: {section_info['course_id']}, and term {section_info['term']}, and type {section_info['type']}, and class_number {section_info['class_number']} and day, and start_time. Skipping upsert.")
            # Optionally, you can update the section instead of skipping if needed
            # supabase.table("sections").update(section_info).eq("id", existing_section.data[0]['id']).execute()
        else:
            # upsert the new section if it doesn't already exist
            response = supabase.table("sections").upsert(section_info).execute()
            if response.data:
                logger.info(f"SUCCESS: upserted course section for section: {section_info['section']}, course_id: {section_info['course_id']} in term {section_info['term']}")
            else:
                logger.error(f"Failed to upsert section: {response}")
    except Exception as e:
        logger.error(f"Error upserting section: {e}")

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
    """upserts course area assignment data."""
    try:
        response = supabase.table("course_area_assignments").upsert({"course_id": course_id, "area_id": area_id}).execute()
        if response.data:
            logger.info(f"SUCCESS: Upserted course_area_assignment for course_id: {course_id} and area_id: {area_id}")
        else:
            logger.error(f"Failed to upsert course area assignment: {response}")
    except Exception as e:
        logger.error(f"Error upserting course area assignment: {e}")

def upsert_availability(availability_info):
    """upserts availability data for sections into the database."""
    try:
        response = supabase.table("availability").upsert(availability_info).execute()
        if response.data:
            logger.info(f"SUCCESS: upserted availability for section_id: {availability_info['section_id']}")
        else:
            logger.error(f"Failed to upsert availability: {response}")
    except Exception as e:
        logger.error(f"Error upserting availability: {e}")

def parse_args():
    parser = argparse.ArgumentParser(
        description="Load scraped BOSS JSON files into Supabase, optionally watching for new files."
    )
    parser.add_argument(
        "--directory",
        default="scrapedData/2610",
        help="Directory containing scraped JSON files.",
    )
    parser.add_argument(
        "--poll-seconds",
        type=float,
        default=1.0,
        help="Seconds between directory scans in watch mode.",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Process current JSON files once and exit.",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=os.cpu_count() or 1,
        help="Number of JSON files to load concurrently. Defaults to all CPU cores.",
    )
    parser.add_argument(
        "--state-file",
        help=(
            "JSON file used to persist visited file paths across restarts. "
            "Defaults to <directory>/.visited.json."
        ),
    )
    parser.add_argument(
        "--no-state-file",
        action="store_true",
        help="Track visited files only in memory until Ctrl-C.",
    )
    return parser.parse_args()


def resolve_state_file(directory, state_file, no_state_file):
    if no_state_file:
        return None
    if state_file:
        return state_file
    return str(Path(directory) / ".visited.json")


def file_identity(file_path):
    stat = file_path.stat()
    return {
        "path": str(file_path.resolve()),
        "mtime_ns": stat.st_mtime_ns,
        "size": stat.st_size,
    }


def visited_key(identity):
    return f"{identity['path']}|{identity['mtime_ns']}|{identity['size']}"


def load_visited_state(state_file):
    if not state_file:
        return set()

    state_path = Path(state_file)
    if not state_path.exists():
        return set()

    try:
        with state_path.open("r", encoding="utf-8") as file:
            data = json.load(file)
        return set(data.get("visited", []))
    except Exception as e:
        logger.error(f"Error loading visited state file {state_path}: {e}")
        return set()


def save_visited_state(state_file, visited):
    if not state_file:
        return

    state_path = Path(state_file)
    state_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = state_path.with_suffix(state_path.suffix + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as file:
        json.dump({"visited": sorted(visited)}, file, indent=2)
    tmp_path.replace(state_path)


def load_json_when_ready(file_path, attempts=8, delay_seconds=0.25):
    last_error = None
    previous_signature = None

    for _ in range(attempts):
        try:
            stat = file_path.stat()
            signature = (stat.st_size, stat.st_mtime_ns)
            with file_path.open("r", encoding="utf-8") as file:
                data = json.load(file)

            # Avoid reading a file while the scraper is still writing it.
            time.sleep(delay_seconds)
            stat_after = file_path.stat()
            if signature == (stat_after.st_size, stat_after.st_mtime_ns):
                return data
            previous_signature = signature
        except (json.JSONDecodeError, OSError) as e:
            last_error = e
            previous_signature = None

        time.sleep(delay_seconds)

    raise RuntimeError(
        f"File was not ready for JSON loading after {attempts} attempts "
        f"(last_signature={previous_signature}, last_error={last_error})"
    )


def process_json_file(file_path):
    """Processes one scraped JSON file and upserts data into Supabase."""
    data = load_json_when_ready(file_path)
    logger.info(f"Processing file: {file_path.name}")

    course_detail = data.get("course_detail", {})
    course_info = {
        "course_code": data.get("course_code"),
        "title": course_detail.get("title"),
        "career": course_detail.get("career"),
        "units": course_detail.get("units"),
        "grading_basis": course_detail.get("grading_basis"),
        "description": course_detail.get("description"),
        "enrolment_requirements": course_detail.get("enrolment_requirements", "Not Available")
    }
    upsert_course_info(course_info)

    term_info = {
        "term": data.get("term"),
        "term_code": data.get("term_code")
    }
    upsert_term(term_info)

    course_code = data.get("course_code")
    term_name = data.get("term")
    course_response = supabase.table("course_info").select("id").eq("course_code", course_code).execute()
    term_response = supabase.table("terms").select("id").eq("term", term_name).execute()
    course_id = course_response.data[0]["id"]
    term_id = term_response.data[0]["id"]

    section_data = data.get("section_info")
    if not section_data:
        logger.warning(f"No section_info found in file: {file_path.name}. Skipping section upsertion.")
        return

    section_info = {
        "course_id": course_id,
        "term": term_id,
        "section": section_data.get("section"),
        "type": section_data.get("type"),
        "day": section_data.get("day"),
        "start_time": section_data.get("start_time"),
        "end_time": section_data.get("end_time"),
        "venue": section_data.get("venue"),
        "instructor": section_data.get("instructor"),
        "start_date": convert_date_format(section_data.get("start_date")),
        "end_date": convert_date_format(section_data.get("end_date")),
        "class_number": data["class_number"]
    }
    upsert_course_section(section_info)

    if "availability" in section_data:
        availability_info = {
            "section_id": get_section_id(section_info),
            "total_seats": section_data["availability"].get("total"),
            "current_enrolled": section_data["availability"].get("current_enrolled"),
            "reserved_seats": section_data["availability"].get("reserved"),
            "available_seats": section_data["availability"].get("available_seats")
        }
        upsert_availability(availability_info)

    for area_name in section_data.get("course_areas", []):
        upsert_course_area(course_id, area_name)


def iter_json_files(directory, state_file=None):
    directory_path = Path(directory)
    if not directory_path.exists():
        directory_path.mkdir(parents=True, exist_ok=True)
    state_path = Path(state_file).resolve() if state_file else None
    return [
        file_path
        for file_path in sorted(directory_path.glob("*.json"))
        if state_path is None or file_path.resolve() != state_path
    ]


def process_json_files(directory, visited=None, state_file=None, workers=1):
    """Processes all unvisited JSON files in a directory."""
    visited = visited if visited is not None else set()
    pending_files = []

    for file_path in iter_json_files(directory, state_file):
        try:
            identity = file_identity(file_path)
            key = visited_key(identity)
            if key in visited:
                continue
            pending_files.append((file_path, key))
        except Exception as e:
            logger.error(f"Error reading file metadata for {file_path.name}: {e}")

    if not pending_files:
        return 0

    worker_count = max(1, min(workers, len(pending_files)))
    processed_count = 0

    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        future_to_file = {
            executor.submit(process_json_file, file_path): (file_path, original_key)
            for file_path, original_key in pending_files
        }

        for future in as_completed(future_to_file):
            file_path, original_key = future_to_file[future]
            try:
                future.result()
                visited.add(original_key)
                visited.add(visited_key(file_identity(file_path)))
                save_visited_state(state_file, visited)
                processed_count += 1
                logger.info(f"Finished processing file: {file_path.name}")
            except Exception as e:
                logger.error(f"Error processing file {file_path.name}: {e}")

    return processed_count


def watch_json_files(directory, poll_seconds, state_file=None, workers=1):
    visited = load_visited_state(state_file)
    logger.info(
        f"Watching {directory} for JSON files with {workers} worker(s). "
        f"State file: {state_file or 'in-memory only'}. "
        f"Already visited: {len(visited)}. Press Ctrl-C to stop."
    )

    try:
        while True:
            processed_count = process_json_files(directory, visited, state_file, workers)
            if processed_count:
                logger.info(f"Processed {processed_count} new JSON file(s).")
            time.sleep(poll_seconds)
    except KeyboardInterrupt:
        save_visited_state(state_file, visited)
        logger.info("Stopped watching for JSON files.")


def main():
    args = parse_args()
    state_file = resolve_state_file(args.directory, args.state_file, args.no_state_file)
    visited = load_visited_state(state_file)
    if args.once:
        processed_count = process_json_files(args.directory, visited, state_file, args.workers)
        logger.info(f"Processed {processed_count} JSON file(s).")
    else:
        watch_json_files(args.directory, args.poll_seconds, state_file, args.workers)


if __name__ == "__main__":
    main()
