"use client";
import { useState, useEffect } from 'react'; 
import createClient  from '@/utils/supabase/client';
import ProfessorSelection from './components/ProfessorSelection'; 
import { getTerms, getLatestTerm, TermObjType } from '@/utils/supabase/supabaseRpcFunctions';
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
import TermSelection from './components/TermSelection';
import { Spinner } from '@nextui-org/react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ExamInformationTable } from './components/ExamInformationTable';
import { convertUtcToSGT } from '@/utils/dateUtils';

const supabase = createClient();

export default function Page({ params }: { params: { course_code: string }}) {
  const { course_code } = params;
  const [courseUUID, setCourseUUID] = useState<string>("");
  const [sections, setSections] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null);
  const [allTerms, setAllTerms] = useState<TermObjType[]>([]);
  const [latestTerm, setLatestTerm] = useState<string>(""); // this is normal name eg, 2024-25 Term 1
  const [selectedTermName, setSelectedTermName] = useState<string>(""); // will remain as empty string until user selects term different term besides the default selected latest term
  const [selectedTermId, setSelectedTermId] = useState<string>(""); // will remain as empty string until user selects term different term besides the default selected latest term
  const [latestTermId, setLatestTermId] = useState<string>(""); // this is uuid
  const [courseInfo, setCourseInfo] = useState<CourseInfoProps>();
  const [courseAreas, setCourseAreas] = useState<string[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetchingSections, setIsFetchingSections] = useState<boolean>(false);

  const router = useRouter();
  const { selectedClasses, addClass, removeClass } = useTimetable();
  const { toast } = useToast();

  async function getTerms() {
    try {
      const { data, error }: any = await supabase.rpc('get_terms');
      
      if (error) {
        console.error('Error fetching course info:', error.message);
        return [];
      }
      return data;

    } catch (error) {
      console.error("error in fetching of rpc: getCourseInfoByCourseCode - " + error);
      return [];
    }
  }

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
        updated_at,
        availability (
          total_seats,
          current_enrolled,
          reserved_seats,
          available_seats
        )
      `)
      .eq('course_id', course_id)
      .eq("term", termId)
      .neq("type", "EXAM");
  
    if (sectionsError) {
      console.error('Error fetching section details:', sectionsError.message);
      return { sections: [], professors: [] };
    }
    // console.log('Fetched sections:', sections); 
    const professors = Array.from(new Set(sections.map(section => section.instructor)));
  
    return { sections, professors };
  }

  async function getExamDetails(course_id: string, termId: string) {
  
    const { data: exams, error: examError } = await supabase
      .from('sections')
      // .select('id, section, day, start_time, end_time, instructor, venue')
      .select(`
        id,
        section,
        day,
        start_date,
        end_date,
        start_time,
        end_time,
        venue
      `)
      .eq('course_id', course_id)
      .eq("term", termId)
      .eq("type", "EXAM");
  
    if (examError) {
      console.error('Error fetching section details:', examError.message);
      return { exams: [] };
    }
    return { exams };
  }

  const updateTimetable = async (professor: string) => {
    if (professor === "") {
      // fetch all sections
      const { sections, professors }: any = await getSectionDetails(courseUUID, (selectedTermId ? selectedTermId : latestTermId));
      setSections(sections);
      setSelectedProfessor(professor);
      return;
    }
    
    //  honestly shouldnt be fetching here again: can be optimised in the future
    const { sections } = await getSectionDetails(courseUUID, (selectedTermId ? selectedTermId : latestTermId));
    const filteredSections = sections.filter(section => section.instructor === professor);
    
    setSelectedProfessor(professor);
    setSections(filteredSections);
  };

  const handleClassSelect = (classItem: any) => {

    const isSelected = selectedClasses.has(classItem.id);
    if (isSelected) {
      removeClass(classItem, false);
      toast({
        title: `Removed ${course_code} - ${classItem.section} from Timetable`,
      });
    } else {
      // we want to add all sections with the same section code eg. G9 this is important for sections split into multiple timings
      sections.forEach(sectionObj => {
        if (sectionObj.section === classItem.section) {
          let deepCopiedSectionObj = JSON.parse(JSON.stringify(sectionObj));
          deepCopiedSectionObj["courseCode"] = course_code;
          deepCopiedSectionObj["courseTitle"] = courseInfo?.title;
          addClass(deepCopiedSectionObj);
        }
      })
      toast({
        title: `Added ${course_code} - ${classItem.section} to Timetable`,
      });
    }
  }

  const handleTermSelectionChange = (selectedTermName: string, selectedTermId: string) => {
    setSelectedProfessor("");
    setSelectedTermId(selectedTermId); // this will trigger below use effect to query new sections for term
    setSelectedTermName(selectedTermName);
  }
  
  useEffect(() => {
    // for initial load
    const fetchPageData = async () => {
      try {
        const terms: TermObjType[] = await getTerms();
        setAllTerms(terms);

        const latestTermObj: TermObjType | null = await getLatestTerm();
        const latestTermStr = latestTermObj?.term ?? "";
        const latestTermIdStr = latestTermObj?.id ?? "";
        setLatestTerm(latestTermStr);
        setLatestTermId(latestTermIdStr);

        // console.log(`Fetching data for course_code: ${course_code}`);
        const courseInfo: any = await getCourseInfoByCourseCode(course_code);
        const courseAreas: any = await getCourseAreasByCourseId(courseInfo.id);
        setCourseUUID(courseInfo.id);
        setCourseAreas(courseAreas);
        setCourseInfo(courseInfo);

        // if user toggle selected term, we will query sections for that term instead of latest (latest of queried on first load)
        const { sections, professors }: any = await getSectionDetails(courseInfo.id, (selectedTermId ? selectedTermId : latestTermIdStr)); 
        setSections(sections);
        setProfessors(professors);
        const { exams }: any = await getExamDetails(courseInfo.id, (selectedTermId ? selectedTermId : latestTermIdStr)); 
        setExams(exams);
        // console.log('Professors:', professors);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [course_code]);

  useEffect(() => {
    // for subsequent selections in term selected
    const fetchSectionsDataForSelctedTerm = async () => {
      if (!courseUUID || !latestTerm) {
        // fetching of course data not complete (eg. we dont want this to run on first load)
        return;
      }
      try {
        setIsFetchingSections(true);
        // if user toggle selected term, we will query sections for that term instead of latest (latest of queried on first load)
        const { sections, professors }: any = await getSectionDetails(courseUUID, (selectedTermId ? selectedTermId : latestTerm)); 
        setSections(sections);
        setProfessors(professors);
        // getExamDetails
        const { exams }: any = await getExamDetails(courseUUID, (selectedTermId ? selectedTermId : latestTerm)); 
        setExams(exams);
        // console.log('Professors:', professors);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsFetchingSections(false);
      }
    }
    fetchSectionsDataForSelctedTerm();
  }, [selectedTermId]);

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
              <CourseInfo courseInfo={courseInfo} courseAreas={courseAreas} updated_at={convertUtcToSGT(sections[0].updated_at)}/>
              {(professors && professors.length > 0) && (
                <div className='py-2'>
                  <div className='sm:flex sm:gap-5'>
                    {/* key forces rerender of component */}
                    <ProfessorSelection key={selectedProfessor} professors={professors} onProfessorClick={updateTimetable} />
                    <TermSelection termObjects={allTerms} termSelected={(selectedTermName ? selectedTermName : latestTerm)} onTermSelect={handleTermSelectionChange}/>
                  </div>
                  <div>
                    {selectedProfessor && (
                      <p className='text-gray-400 text-sm py-2'>Showing all sections:</p>
                    )}
                    <TimetableGeneric classes={sections} onClassSelect={handleClassSelect} allowAddRemoveSections={selectedTermName === "" || (selectedTermName == latestTerm)}/>                  </div>
                </div>
              )}
            </div>
          )}
          
          {((!sections || sections.length === 0)) ? (
            <div>
              {(!isFetchingSections)? (
                <div>
                  <TermSelection termObjects={allTerms} termSelected={(selectedTermName ? selectedTermName : latestTerm)} onTermSelect={handleTermSelectionChange}/>
                  <NoResultCard searchCategory={"sections for " + (selectedTermName ? selectedTermName : latestTerm)}/>
                </div>
              ): (
                <div className='py-5 flex items-center justify-center'>
                    <Spinner color="default"/>
                </div>
              )}
            </div>
          ) : (
            <div className='py-2'>
              <Tabs defaultValue="sectionInformation">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sectionInformation">Section Information</TabsTrigger>
                  <TabsTrigger value="examInformation">Exam Information</TabsTrigger>
                </TabsList>
                <TabsContent value="sectionInformation">
                  <SectionInformationTable courseCode={course_code} sections={sections} termName={(selectedTermName ? selectedTermName : latestTerm)} onClassSelect={handleClassSelect} singleProfOnly={selectedProfessor !== null && selectedProfessor !== ""} allowAddRemoveSections={selectedTermName === "" || (selectedTermName == latestTerm)}/>
                </TabsContent>
                <TabsContent value="examInformation">
                  <ExamInformationTable courseCode={course_code} exams={exams} termName={(selectedTermName ? selectedTermName : latestTerm)}/>
                </TabsContent>
                </Tabs>
            </div>
          )}
        </div>
      )}
    </>
  );
}
