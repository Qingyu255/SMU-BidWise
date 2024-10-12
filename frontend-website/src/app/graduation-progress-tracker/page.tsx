import React from 'react';
import PlannerCheckList from './components/PlannerCheckList';
import createClient from '@/utils/supabase/server';

// note that this is a server page
export default async function Page() {

  const fetchCourseOptions = async (): Promise<string[]> => {
    const supabase = createClient();
    try {
      const { data: courseData, error: courseError } = await supabase
        .from("course_info")
        .select("course_code, title"); // Fetch both course_code and title
  
      if (courseError) {
        throw courseError;
      }

      const coursesList = courseData.map((item: { course_code: string, title: string }) => (`${item.course_code} - ${item.title}`));
  
      return coursesList;
  
    } catch (error) {
      console.error("Error fetching fetchCourseOptions from course_info table: ", error);
      return [];
    }
  };

  const courseOptions: string[] = await fetchCourseOptions();

  // TODO for this page: allow for cloud saving
  return (
    <>
      <PlannerCheckList courseOptions={courseOptions}/>
    </>
  );
};

