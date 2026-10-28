import argparse
import csv
import json
import os
from pathlib import Path

from supabase import create_client


DEFAULT_TERM_CODE = "2610"
DEFAULT_START_TIME = "19:00:00"
DEFAULT_PAGE_SIZE = 1000


def load_env_file(env_path):
    """Small .env loader so this script does not require python-dotenv."""
    if not env_path or not env_path.exists():
        return

    with env_path.open("r", encoding="utf-8") as file:
        for raw_line in file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


def load_env(explicit_env_file=None):
    candidates = []
    if explicit_env_file:
        candidates.append(Path(explicit_env_file))

    script_dir = Path(__file__).resolve().parent
    candidates.extend(
        [
            script_dir / ".env",
            script_dir / ".env.local",
            script_dir.parent / ".env",
            script_dir.parent / ".env.local",
        ]
    )

    for env_path in candidates:
        load_env_file(env_path)


def get_supabase_client():
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url:
        raise RuntimeError("SUPABASE_URL is missing from the environment.")
    if not supabase_key:
        raise RuntimeError(
            "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is missing from the environment."
        )

    return create_client(supabase_url, supabase_key)


def normalize_start_time(value):
    value = str(value).strip()
    if value.isdigit() and len(value) == 4:
        return f"{value[:2]}:{value[2:]}:00"
    if value.count(":") == 1:
        return f"{value}:00"
    return value


def count_sections_for_term(supabase, term_id):
    response = (
        supabase.table("sections")
        .select("id", count="exact")
        .eq("term", term_id)
        .limit(1)
        .execute()
    )
    return response.count or 0


def fetch_term(supabase, term_code, term_name=None):
    response = (
        supabase.table("terms")
        .select("id, term, term_code")
        .eq("term_code", term_code)
        .execute()
    )

    if not response.data:
        raise RuntimeError(f"No term found with term_code={term_code}.")

    terms = response.data
    if term_name:
        matches = [
            term
            for term in terms
            if term_name.lower() in str(term.get("term", "")).lower()
        ]
        if not matches:
            available = ", ".join(str(term.get("term")) for term in terms)
            raise RuntimeError(
                f"No term matching {term_name!r} found for term_code={term_code}. "
                f"Available terms: {available}"
            )
        terms = matches

    scored_terms = [
        {**term, "section_count": count_sections_for_term(supabase, term["id"])}
        for term in terms
    ]
    scored_terms.sort(
        key=lambda term: (
            term["section_count"],
            "term 1" in str(term.get("term", "")).lower(),
            "term" in str(term.get("term", "")).lower(),
        ),
        reverse=True,
    )

    return scored_terms[0]


def fetch_sections_page(supabase, term_id, start_time, offset, page_size):
    return (
        supabase.table("sections")
        .select(
            "id, section, type, day, start_time, end_time, venue, instructor, "
            "start_date, end_date, class_number, "
            "course_info:course_id(course_code, title, career, units), "
            "availability(total_seats, current_enrolled, reserved_seats, available_seats)"
        )
        .eq("term", term_id)
        .gte("start_time", start_time)
        .order("start_time")
        .order("day")
        .order("course_id")
        .range(offset, offset + page_size - 1)
        .execute()
    )


def fetch_night_classes(supabase, term_id, start_time, page_size):
    rows = []
    offset = 0

    while True:
        response = fetch_sections_page(supabase, term_id, start_time, offset, page_size)
        page = response.data or []
        rows.extend(page)

        if len(page) < page_size:
            return rows

        offset += page_size


def flatten_row(row, term):
    course = row.get("course_info") or {}
    availability_rows = row.get("availability") or []
    if isinstance(availability_rows, list):
        availability = availability_rows[0] if availability_rows else {}
    else:
        availability = availability_rows

    return {
        "term_code": term.get("term_code"),
        "term": term.get("term"),
        "course_code": course.get("course_code"),
        "title": course.get("title"),
        "section": row.get("section"),
        "type": row.get("type"),
        "class_number": row.get("class_number"),
        "day": row.get("day"),
        "start_time": row.get("start_time"),
        "end_time": row.get("end_time"),
        "venue": row.get("venue"),
        "instructor": row.get("instructor"),
        "start_date": row.get("start_date"),
        "end_date": row.get("end_date"),
        "total_seats": availability.get("total_seats"),
        "current_enrolled": availability.get("current_enrolled"),
        "reserved_seats": availability.get("reserved_seats"),
        "available_seats": availability.get("available_seats"),
    }


def print_table(rows):
    if not rows:
        print("No night classes found.")
        return

    headers = [
        "course_code",
        "section",
        "class_number",
        "day",
        "start_time",
        "end_time",
        "venue",
        "instructor",
        "title",
    ]
    widths = {
        header: min(
            max(len(header), *(len(str(row.get(header) or "")) for row in rows)),
            36,
        )
        for header in headers
    }

    print(" | ".join(header.ljust(widths[header]) for header in headers))
    print("-+-".join("-" * widths[header] for header in headers))
    for row in rows:
        values = []
        for header in headers:
            value = str(row.get(header) or "")
            if len(value) > widths[header]:
                value = value[: widths[header] - 3] + "..."
            values.append(value.ljust(widths[header]))
        print(" | ".join(values))


def write_json(rows, output_path):
    with output_path.open("w", encoding="utf-8") as file:
        json.dump(rows, file, indent=2)


def write_csv(rows, output_path):
    fieldnames = [
        "term_code",
        "term",
        "course_code",
        "title",
        "section",
        "type",
        "class_number",
        "day",
        "start_time",
        "end_time",
        "venue",
        "instructor",
        "start_date",
        "end_date",
        "total_seats",
        "current_enrolled",
        "reserved_seats",
        "available_seats",
    ]
    with output_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Query Supabase for BOSS classes starting from 19:00 onwards."
    )
    parser.add_argument("--term-code", default=DEFAULT_TERM_CODE)
    parser.add_argument("--start-time", default=DEFAULT_START_TIME)
    parser.add_argument(
        "--term-name",
        help="Optional term name filter, for example 'Term 1' when a term code has multiple rows.",
    )
    parser.add_argument("--env-file", help="Path to .env or .env.local file.")
    parser.add_argument(
        "--output",
        help="Optional output file. Use .json or .csv extension.",
    )
    parser.add_argument("--page-size", type=int, default=DEFAULT_PAGE_SIZE)
    return parser.parse_args()


def main():
    args = parse_args()
    load_env(args.env_file)

    supabase = get_supabase_client()
    start_time = normalize_start_time(args.start_time)
    term = fetch_term(supabase, args.term_code, args.term_name)
    rows = [
        flatten_row(row, term)
        for row in fetch_night_classes(
            supabase=supabase,
            term_id=term["id"],
            start_time=start_time,
            page_size=args.page_size,
        )
    ]

    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        if output_path.suffix.lower() == ".json":
            write_json(rows, output_path)
        elif output_path.suffix.lower() == ".csv":
            write_csv(rows, output_path)
        else:
            raise RuntimeError("--output must end with .json or .csv")
        print(f"Wrote {len(rows)} night classes to {output_path}")
    else:
        print(f"Term: {term['term']} ({term['term_code']})")
        print(f"Classes starting from {start_time}: {len(rows)}")
        print_table(rows)


if __name__ == "__main__":
    main()
