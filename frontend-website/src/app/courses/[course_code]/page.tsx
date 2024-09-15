"use client";
import { useState, useEffect } from 'react'; 
import { createClient } from '@supabase/supabase-js';
import ProfessorButtons from './ProfessorButtons'; 
import Timetable from './Timetable'; // Import Timetable component
import { getLatestTerm } from '@/utils/supabase/supabaseRpcFunctions';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default function Page({ params }: { params: { course_code: string }}) {

  const { course_code } = params;
  const [sections, setSections] = useState<any[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);
  const [latestTerm, setLatestTerm] = useState<string>(""); // this is normal name eg, 2024-25 Term 1
  const [latestTermId, setLatestTermId] = useState<string>(""); // this is uuid

  const getLatestTerm = async () => {
    const { data: latestTerm, error: latestTermError } = await supabase
      .rpc('get_latest_term') // call the custom rpc supabase sql function
      .single();
  
    if (latestTermError) {
      console.error('Error fetching latest term:', latestTermError.message);
      return null;
    }
    return latestTerm;
  }

  async function getSectionDetails(course_code: string, termId: string) {
    // Step 1: Find the course_id using course_code from the course_info table
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
      .eq('course_id', course_id)
      .eq("term", termId);
  
    if (sectionsError) {
      console.error('Error fetching section details:', sectionsError.message);
      return { sections: [], professors: [] };
    }
  
    const professors = Array.from(new Set(sections.map(section => section.instructor)));
  
    return { sections, professors };
  }

  const updateTimetable = async (professor: string) => {
    console.log(`Fetching sections for professor: ${professor}`);
    const { sections } = await getSectionDetails(course_code, latestTermId);
    const filteredSections = sections.filter(section => section.instructor === professor);
    
    console.log('Filtered sections:', filteredSections);
  
    setSelectedProfessor(professor);
    setSections(filteredSections); // Update state with filtered sections
  };
  
  useEffect(() => {
    (async () => {
      const latestTermObj: any = await getLatestTerm();
      const latestTermStr = latestTermObj.term;
      const latestTermIdStr = latestTermObj.id;
      setLatestTerm(latestTermStr)
      setLatestTermId(latestTermIdStr) // right now we are only showing the latest undergrad terms 

      console.log('Fetching sections and professors for course_code:' + course_code + "for latest term: " + latestTermStr);
      const { sections, professors } = await getSectionDetails(course_code, latestTermIdStr);
      setSections(sections);
      setProfessors(professors);
      console.log('Professors:', professors);
    })();
  }, [course_code]);
  

  return (
    <>
      <div>Course Code: {course_code.toUpperCase()}</div>
      {/* <span>This page should contain other info like maybe a timetable depiction of available sections, section details, availability, etc.</span> */}
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
      <div>
        <h2>Available Sections for latest term - {latestTerm}:</h2>
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
