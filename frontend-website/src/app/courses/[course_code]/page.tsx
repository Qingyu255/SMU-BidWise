// Import necessary libraries
import createClient  from '@/utils/supabase/server';

// Function to extract numeric part from section code for sorting
function extractNumericPart(section: string): number {
  const match = section.match(/(\d+)/);
  return match ? parseFloat(match[0]) : 0;
}

// Function to get section details by course_code
async function getSectionDetails(course_code: string) {
  // initialise supabase client
  const supabase = createClient();

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
