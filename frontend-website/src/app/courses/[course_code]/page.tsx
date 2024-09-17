"use client";
import { useState, useEffect } from 'react'; 
import createClient  from '@/utils/supabase/client';
import ProfessorButtons from './ProfessorButtons'; 
import Timetable from './Timetable'; // Import Timetable component
import { getLatestTerm } from '@/utils/supabase/supabaseRpcFunctions';
import NoResultCard from '@/components/NoResultCard';
import { Spinner } from '@nextui-org/react';
import { TimetableProvider } from './TimetableContext';

const supabase = createClient();

export default function Page({ params }: { params: { course_code: string }}) {
  const { course_code } = params;
  const [sections, setSections] = useState<any[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);
  const [latestTerm, setLatestTerm] = useState<string>(""); // this is normal name eg, 2024-25 Term 1
  const [latestTermId, setLatestTermId] = useState<string>(""); // this is uuid
  const [loading, setLoading] = useState<boolean>(true);

  async function getSectionDetails(course_code: string, termId: string) {
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
      .select('section, day, start_time, end_time, instructor, venue')
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
    if (professor === "") {
      const { sections, professors }: any = await getSectionDetails(course_code, latestTermId);
      setSections(sections);
      setSelectedProfessor(professor);
      return;
    }
  
    const { sections } = await getSectionDetails(course_code, latestTermId);
    const filteredSections = sections.filter(section => section.instructor === professor);
    
    setSelectedProfessor(professor);
    setSections(filteredSections);
  };
  
  useEffect(() => {
    (async () => {
      try {
        const latestTermObj: any = await getLatestTerm();
        const latestTermStr = latestTermObj.term;
        const latestTermIdStr = latestTermObj.id;
        setLatestTerm(latestTermStr);
        setLatestTermId(latestTermIdStr);

        console.log('Fetching sections and professors for course_code:' + course_code + " for latest term: " + latestTermStr);
        const { sections, professors }: any = await getSectionDetails(course_code, latestTermIdStr);
        setSections(sections);
        setProfessors(professors);
        console.log('Professors:', professors);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [course_code]);

  return (
    <TimetableProvider>
      {loading ? (
        <div className='w-100 h-100 flex justify-center items-center'>
          <Spinner color='default'/>
        </div>
      ) : (
        <div>
          <div>Course Code: {course_code.toUpperCase()}</div>
          {selectedProfessor && (
            <>
              <div>Selected Professor: {selectedProfessor}</div>
              <Timetable
                professorClasses={sections} // Make sure sections contain the filtered data
                onClassSelect={(classItem: any) => console.log('Class selected:', classItem)}
              />
            </>
          )}
          {((!sections || sections.length === 0)) ? (
            <NoResultCard searchCategory={"sections for " + latestTerm}/>
          ) : (
            <div>
              <ProfessorButtons professors={professors} onProfessorClick={updateTimetable} />
              <h2>Available Sections for latest term - {latestTerm}:</h2>
              <ul>
                {sections.map((section, index) => (
                  <li key={index}>
                    <strong>Section:</strong> {section.section}, <strong>Day:</strong> {section.day}, <strong>Start Time:</strong> {section.start_time}, <strong>End Time:</strong> {section.end_time},  <strong>Professor:</strong> {section.instructor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </TimetableProvider>
  );
}
