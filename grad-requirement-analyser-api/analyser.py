import re
import json
import fitz  # PyMuPDF
import sys
import pytesseract
from pdf2image import convert_from_path
import pdfplumber

# Function to parse the PDF and extract relevant sections for major requirements using PDFPlumber
# This helps in maintaining a more consistent extraction of tables and text structures.
def extract_major_requirements_with_pdfplumber(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page_number, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"\nPage {page_number + 1}:\n" + page_text

    # Normalize non-breaking spaces and other formatting characters
    text = text.replace("\u00a0", " ").replace("|", "").replace("\n", "\n")
    text = re.sub(r"\d+Information Systems", "Information Systems", text)  # Remove leading numbers from headings
    text = re.sub(r"\d+\s*(?=Requirements|Major|Electives|Core Curriculum|Course Area Requirements)", "", text)  # Remove leading numbers from general section titles

    # Debug: Print the entire extracted text to understand its structure
    print("Extracted Text with PDFPlumber (Debug):\n", text, "\n...")  # Print the entire extracted text for inspection

    return text

# Function to extract requirements details and major content from the entire text
def extract_requirements_details(text):
    requirements = {}
    cleared_modules = []
    required_modules = []
    course_areas = {}

    # Split the text into lines to better handle formatting issues
    lines = text.splitlines()
    current_block = []
    current_section = None

    for idx, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Debug: Print each line being processed
        print(f"Processing Line {idx + 1}: {line}")

        # Identify new sections or blocks based on known keywords
        if re.match(r"(Overall Requirements|Information Systems Major|IS Project Experience|BSc\(IS\) Core Curriculum|BSc\(IS\) Free Electives|BSc\(IS\) Additional Grad Requirements|Unused Courses|Major Core Requirements|Elective Requirements|Residency Requirement|Course Area Requirements)", line):
            # Process the previous block before starting a new one
            if current_section and current_block:
                process_block(current_section, current_block, requirements, cleared_modules, required_modules, course_areas)
                current_block = []
            current_section = line
        else:
            # Add lines to the current block
            current_block.append(line)

    # Process the last block if any
    if current_section and current_block:
        process_block(current_section, current_block, requirements, cleared_modules, required_modules, course_areas)

    # Debug: Print extracted requirements and modules
    print("Extracted Requirements (Debug):\n", requirements, "\n")
    print("Cleared Modules (Debug):\n", cleared_modules, "\n")
    print("Required Modules (Debug):\n", required_modules, "\n")
    print("Course Areas (Debug):\n", course_areas, "\n")

    return requirements, cleared_modules, required_modules, course_areas

# Function to process a block of text and extract relevant details
def process_block(section, block, requirements, cleared_modules, required_modules, course_areas):
    block_text = " ".join(block)

    # Clean up block text to improve extraction reliability
    block_text = re.sub(r"\s+", " ", block_text)
    block_text = re.sub(r"\d{1,2}[.]\s*", "", block_text)  # Remove any numbering artifacts

    # Extract CU or GPA requirements
    if "CUs" in block_text or "Units" in block_text or "GPA" in block_text:
        match = re.search(r"(Satisfied|Not Satisfied)\s*(?P<requirement>[^:]+):\s*(?P<values>[\d\.]+\s*/\s*[\d\.]+(?:\s*/\s*[\d\.]+)?)", block_text)
        if match:
            status = match.group(1)
            requirement = match.group('requirement').strip()
            values = match.group('values')
            value_parts = values.split("/")
            if len(value_parts) == 3:
                required, earned, outstanding = map(str.strip, value_parts)
                requirements[requirement] = {
                    'status': status,
                    'required': float(required),
                    'earned': float(earned),
                    'outstanding': float(outstanding)
                }
            elif len(value_parts) == 2:
                minimum, earned = map(str.strip, value_parts)
                requirements[requirement] = {
                    'status': status,
                    'minimum': float(minimum),
                    'earned': float(earned)
                }

    # Extract course area details with nested structure handling
    if "Course Area Requirements" in section or "Major Core Requirements" in section:
        course_area_pattern = re.compile(r"(?P<course_area>\w+(?: \w+)*)\s+CUs\s*\(Required/Earned/Outstanding\):\s*(?P<required>\d+\.\d+) / (?P<earned>\d+\.\d+) / (?P<outstanding>\d+\.\d+)")
        matches = course_area_pattern.finditer(block_text)
        for match in matches:
            course_area = match.group('course_area').strip()
            required = float(match.group('required'))
            earned = float(match.group('earned'))
            outstanding = float(match.group('outstanding'))
            course_areas[course_area] = {
                'required': required,
                'earned': earned,
                'outstanding': outstanding
            }

    # Extract module details with improved logic for module parsing
    module_pattern = re.compile(r"^([A-Za-z]{2,4}\s*\d{3,4})\s+(?P<module_name>.+?)\s+(?P<units>[\d\.]+)\s+(?P<when>[\d\-]+ Term \d+)\s+(?P<grade>[A-Z\+\-]+|[-])$", re.MULTILINE)
    module_matches = module_pattern.finditer(block_text)
    for match in module_matches:
        module_name = match.group('module_name').strip()
        grade = match.group('grade')

        if grade not in ['-', 'IP', 'E'] and grade:
            # Cleared modules
            cleared_modules.append(module_name)
        elif grade == 'IP':
            # In Progress modules
            required_modules.append(module_name)

# Main function to parse the PDF and summarize requirements for each major
def main(pdf_path):
    # if len(sys.argv) != 2:
    #     print("Usage: python analyser.py <path_to_pdf>")
    #     sys.exit(1)

    # pdf_path = sys.argv[1]
    text = extract_major_requirements_with_pdfplumber(pdf_path)
    requirements, cleared_modules, required_modules, course_areas = extract_requirements_details(text)
    output = {
        'requirements': requirements,
        'cleared_modules': cleared_modules,
        'required_modules': required_modules,
        'course_areas': course_areas
    }

    # Output the findings in JSON format
    print(json.dumps(output, indent=4))


if __name__ == "__main__":
    # Replace with the path to your PDF file
    pdf_path = "./report/My Academic Requirements.pdf"
    main(pdf_path)
