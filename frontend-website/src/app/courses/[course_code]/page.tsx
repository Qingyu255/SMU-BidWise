"use client";
import { useState, useEffect } from 'react'; 
import createClient  from '@/utils/supabase/client';
import ProfessorSelection from './components/ProfessorSelection'; 
import { getLatestTerm } from '@/utils/supabase/supabaseRpcFunctions';
import NoResultCard from '@/components/NoResultCard';
import { CourseInfo, CourseInfoProps } from './components/CourseInfo';
import { Card, CardDescription, CardFooter } from '@/components/ui/card';
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
import { useTimetable } from '../../../components/providers/timetableProvider';
import { useToast } from "@/hooks/use-toast";

const supabase = createClient();

export default function Page({ params }: { params: { course_code: string }}) {
  const { course_code } = params;
  const [courseUUID, setCourseUUID] = useState<string>("");
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
  const { toast } = useToast();

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
      // console.log(res);
      return res;

    } catch (error) {
      console.error("error in fetching of rpc: getCourseAreasByCourseId - " + error);
      return [];
    }
  }

  async function getSectionDetails(course_id: string, termId: string) {
  
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
    // console.log('Fetched sections:', sections); 
    const professors = Array.from(new Set(sections.map(section => section.instructor)));
  
    return { sections, professors };
  }

  const updateTimetable = async (professor: string) => {
    if (professor === "") {
      // fetch all sections
      const { sections, professors }: any = await getSectionDetails(courseUUID, latestTermId);
      setSections(sections);
      setSelectedProfessor(professor);
      return;
    }
  
    const { sections } = await getSectionDetails(courseUUID, latestTermId);
    const filteredSections = sections.filter(section => section.instructor === professor);
    
    setSelectedProfessor(professor);
    setSections(filteredSections);
  };

  const handleClassSelect = (classItem: any) => {
    console.log("Class selected:", classItem);
    const isSelected = selectedClasses.has(classItem.id);
    if (isSelected) {
      removeClass(classItem);
      toast({
        title: `Removed ${course_code} - ${classItem.section} from Timetable`,
      });
    } else {
      classItem["courseCode"] = course_code;
      addClass(classItem);
      toast({
        title: `Added ${course_code} - ${classItem.section} to Timetable`,
      });
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
        const courseAreas: any = await getCourseAreasByCourseId(courseInfo.id);
        setCourseUUID(courseInfo.id);
        setCourseAreas(courseAreas);
        setCourseInfo(courseInfo);

        // console.log('Fetching sections and professors for course_code: ' + course_code + " for latest term: " + latestTermStr);
        const { sections, professors }: any = await getSectionDetails(courseInfo.id, latestTermIdStr);
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
                    <div>
                      <p className='text-gray-400 text-sm py-2'>Showing all sections:</p>
                      <TimetableGeneric classes={sections} onClassSelect={handleClassSelect}/>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {((!sections || sections.length === 0)) ? (
            <NoResultCard searchCategory={"sections for " + latestTerm}/>
          ) : (
            <div className='py-2'>
              <SectionInformationTable courseCode={course_code} sections={sections} latestTerm={latestTerm} singleProfOnly={selectedProfessor !== null && selectedProfessor !== ""}/>
            </div>
          )}
        </div>
      )}
    </>
  );
}
