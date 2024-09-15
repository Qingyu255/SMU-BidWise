<<<<<<< HEAD
"use client";
import { useState, useEffect } from 'react'; 
import { createClient } from '@supabase/supabase-js';
import ProfessorButtons from './ProfessorButtons'; 
import Timetable from './Timetable'; // Import Timetable component

const supabase = createClient('https://qwlcflxsmsozzgdmcmco.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3bGNmbHhzbXNvenpnZG1jbWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MzU5NjMsImV4cCI6MjA0MTUxMTk2M30.ANJBVw0uCw4wqsXXpbJbdXm4S6L8KXPbdF8KpNFBvn0');
=======
// Import necessary libraries
import createClient  from '@/utils/supabase/server';
>>>>>>> origin/main

async function getSectionDetails(course_code: string) {
<<<<<<< HEAD
=======
  // initialise supabase client
  const supabase = createClient();

  // Step 1: Find the course_id using course_code from the course_info table
>>>>>>> origin/main
  const { data: courseInfo, error: courseInfoError } = await supabase
    .from('course_info')
    .select('id')
    .eq('course_code', course_code)
    .single();

  if (courseInfoError) {
    console.error('Error fetching course_id:', courseInfoError.message);
    return { sections: [], professors: [] };
  }

  const course_id = courseInfo?.id;

  if (!course_id) {
    console.error('Course ID not found for course_code:', course_code);
    return { sections: [], professors: [] };
  }

  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('section, day, start_time, end_time, instructor,venue')
    .eq('course_id', course_id);

  if (sectionsError) {
    console.error('Error fetching section details:', sectionsError.message);
    return { sections: [], professors: [] };
  }

  const professors = Array.from(new Set(sections.map(section => section.instructor)));

  return { sections, professors };
}

export default function Page({ params }: { params: { course_code: string } }) {
  const { course_code } = params;
  const [sections, setSections] = useState<any[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);

  const updateTimetable = async (professor: string) => {
    console.log(`Fetching sections for professor: ${professor}`);
    const { sections } = await getSectionDetails(course_code);
    const filteredSections = sections.filter(section => section.instructor === professor);
    
    console.log('Filtered sections:', filteredSections);
  
    setSelectedProfessor(professor);
    setSections(filteredSections); // Update state with filtered sections
  };
  
  useEffect(() => {
    (async () => {
      console.log('Fetching sections and professors for course_code:', course_code);
      const { sections, professors } = await getSectionDetails(course_code);
      setSections(sections);
      setProfessors(professors);
      console.log('Professors:', professors);
    })();
  }, [course_code]);

  return (
    <>
      <div>Course Code: {course_code.toUpperCase()}</div>
      <span>This page should contain other info like maybe a timetable depiction of available sections, section details, availability, etc.</span>
<<<<<<< HEAD
      
      <ProfessorButtons professors={professors} onProfessorClick={updateTimetable} />
      
      {selectedProfessor && (
  <>
    <div>Selected Professor: {selectedProfessor}</div>
    <Timetable
      professorClasses={sections} // Make sure sections contain the filtered data
      onClassSelect={(classItem: any) => console.log('Class selected:', classItem)}
    />
  </>
)}
=======

      <div>
        <h2>Available Sections: - Shows both 23-24 T2 and 24-25T1 - TODO: add filter for term</h2>
        <ul>
          {sections.map((section, index) => (
            <li key={index}>
              <strong>Section:</strong> {section.section}, <strong>Day:</strong> {section.day}, <strong>Start Time:</strong> {section.start_time}, <strong>End Time:</strong> {section.end_time},  <strong>Professor:</strong> {section.instructor}
            </li>
          ))}
        </ul>
      </div>
>>>>>>> origin/main
    </>
  );
}  