"use client";
import { useState, useEffect } from 'react'; 
import createClient  from '@/utils/supabase/client';
import ProfessorSelection from './components/ProfessorSelection'; 
import { getLatestTerm } from '@/utils/supabase/supabaseRpcFunctions';
import NoResultCard from '@/components/NoResultCard';
import { CourseInfo, CourseInfoProps } from './components/CourseInfo';
import { Card, CardDescription } from '@/components/ui/card';
import { CourseInfoSkeleton } from './components/CourseInfoSkeleton';
import { SectionInformationTable } from './components/SectionInformationTable';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter } from 'next/navigation';
import TimetableGeneric from '../../../components/timetable/TimetableGeneric';
import { useTimetable } from '../../../components/timetableProvider';

const supabase = createClient();

export default function Page({ params }: { params: { course_code: string }}) {
  const { course_code } = params;
  const [courseId, setCourseId] = useState<string>();
  const [sections, setSections] = useState<any[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);
  const [latestTerm, setLatestTerm] = useState<string>(""); // this is normal name eg, 2024-25 Term 1
  const [latestTermId, setLatestTermId] = useState<string>(""); // this is uuid
  const [courseInfo, setCourseInfo] = useState<CourseInfoProps>();
  const [courseAreas, setCourseAreas] = useState<string[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { selectedClasses, addClass, removeClass } = useTimetable();

  async function getCourseInfoByCourseCode(course_code: string) {
    try {
      const { data, error }: any = await supabase.rpc('get_course_info_by_course_code', { input_course_code: course_code });
      
      if (error) {
        console.error('Error fetching course info:', error.message);
        return [];
      }
      return data[0];

    } catch (error) {
      console.error("error in fetching of rpc: getCourseInfoByCourseCode - " + error);
      return [];
    }
  }

  async function getCourseAreasByCourseId(courseId: string) {
    try {
      const { data, error }: any = await supabase.rpc('get_course_areas_by_course_id', { input_course_id: courseId });
      
      if (error) {
        console.error('Error fetching course areas:', error.message);
        return [];
      }
      const res = [...new Set(data.map((item: { area_name: string }) => item.area_name))];
      console.log(res);
      return res;

    } catch (error) {
      console.error("error in fetching of rpc: getCourseAreasByCourseId - " + error);
      return [];
    }
  }

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
  
    const course_id: any = courseInfo?.id;
    setCourseId(course_id);
    if (!course_id) {
      console.error('Course ID not found for course_code:', course_code);
      return { sections: [], professors: [] };
    }
  
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      // .select('id, section, day, start_time, end_time, instructor, venue')
      .select(`
        id,
        section,
        day,
        start_time,
        end_time,
        instructor,
        venue,
        availability (
          total_seats,
          current_enrolled,
          reserved_seats,
          available_seats
        )
      `)
      .eq('course_id', course_id)
      .eq("term", termId);
  
    if (sectionsError) {
      console.error('Error fetching section details:', sectionsError.message);
      return { sections: [], professors: [] };
    }
    console.log('Fetched sections:', sections); 
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

  const handleClassSelect = (classItem: any) => {
    console.log("Class selected:", classItem);
    const isSelected = selectedClasses.has(classItem.id);
    if (isSelected) {
      removeClass(classItem);
    } else {
      classItem["courseCode"] = course_code;
      addClass(classItem);
    }
  }
  
  useEffect(() => {
    (async () => {
      try {
        const latestTermObj: any = await getLatestTerm();
        const latestTermStr = latestTermObj.term;
        const latestTermIdStr = latestTermObj.id;
        setLatestTerm(latestTermStr);
        setLatestTermId(latestTermIdStr);

        // console.log(`Fetching data for course_code: ${course_code}`);
        const courseInfo: any = await getCourseInfoByCourseCode(course_code);
        setCourseInfo(courseInfo);

        // console.log('Fetching sections and professors for course_code: ' + course_code + " for latest term: " + latestTermStr);
        const { sections, professors }: any = await getSectionDetails(course_code, latestTermIdStr);
        setSections(sections);
        setProfessors(professors);
        // console.log('Professors:', professors);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [course_code]);

  useEffect(() => {
    (async () => {
      try {
        console.log(courseId)
        const courseAreas: any = await getCourseAreasByCourseId(courseId || "");
        setCourseAreas(courseAreas);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    })();
  }, [courseId]);

  return (
    <>
      {loading ? (
        <CourseInfoSkeleton/>
      ) : (
        <div>
          <Breadcrumb className='pb-2'>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className='cursor-pointer' onClick={() => router.push("/courses")}>Courses</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{course_code}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {courseInfo && (
            <div>
              <CourseInfo courseInfo={courseInfo} courseAreas={courseAreas}/>
              {(professors && professors.length > 0) && (
                <div className='py-2'>
                  <ProfessorSelection professors={professors} onProfessorClick={updateTimetable} />
                  {selectedProfessor ? (
                    <>
                      <TimetableGeneric classes={sections} onClassSelect={handleClassSelect}/>
                    </>
                  ): (
                    <Card className='rounded-lg mt-2'>
                      <CardDescription className='py-6 lg:py-10 text-center'>Select a professor to view their sections</CardDescription>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
          
          {((!sections || sections.length === 0)) ? (
            <NoResultCard searchCategory={"sections for " + latestTerm}/>
          ) : (
            <div className='py-2'>
              <SectionInformationTable sections={sections} latestTerm={latestTerm} singleProfOnly={selectedProfessor !== null && selectedProfessor !== ""}/>
            </div>
          )}
        </div>
      )}
    </>
  );
}
