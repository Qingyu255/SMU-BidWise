// Import necessary libraries
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://qwlcflxsmsozzgdmcmco.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bGNmbHhzbXNvenpnZG1jbWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MzU5NjMsImV4cCI6MjA0MTUxMTk2M30.ANJBVw0uCw4wqsXXpbJbdXm4S6L8KXPbdF8KpNFBvn0');

// Function to extract numeric part from section code for sorting
function extractNumericPart(section: string): number {
  const match = section.match(/(\d+)/);
  return match ? parseFloat(match[0]) : 0;
}

// Function to get section details by course_code
async function getSectionDetails(course_code: string) {
  // Step 1: Find the course_id using course_code from the course_info table
  const { data: courseInfo, error: courseInfoError } = await supabase
    .from('course_info')
    .select('id')
    .eq('course_code', course_code)
    .single(); // .single() because we expect one result

  if (courseInfoError) {
    console.error('Error fetching course_id:', courseInfoError.message);
    return [];
  }

  const course_id = courseInfo?.id;

  if (!course_id) {
    console.error('Course ID not found for course_code:', course_code);
    return [];
  }

  // Step 2: Use the course_id to get section details from the sections table
  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('section, day, start_time, end_time,instructor')
    .eq('course_id', course_id);

  if (sectionsError) {
    console.error('Error fetching section details:', sectionsError.message);
    return [];
  }

  // Sort sections by section code
  sections.sort((a, b) => {
    const numA = extractNumericPart(a.section);
    const numB = extractNumericPart(b.section);
    // Handle alphanumeric sorting: first compare numbers, then letters if needed
    return numA - numB || a.section.localeCompare(b.section);
  });

  return sections;
}

// Page component
export default async function Page({ params }: { params: { course_code: string } }) {
  const { course_code } = params;
  const sections = await getSectionDetails(course_code);

  return (
    <>
      <div>Course Code: {course_code.toUpperCase()}</div>
      <span>This page should contain other info like maybe a timetable depiction of available sections, section details, availability, etc.</span>

      <div>
        <h2>Available Sections</h2>
        <ul>
          {sections.map((section, index) => (
            <li key={index}>
              <strong>Section:</strong> {section.section}, <strong>Day:</strong> {section.day}, <strong>Start Time:</strong> {section.start_time}, <strong>End Time:</strong> {section.end_time},  <strong>Professor:</strong> {section.instructor}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
