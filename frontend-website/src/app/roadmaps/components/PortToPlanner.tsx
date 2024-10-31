"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Semester,
  enrollments,
  sem,
} from '@/types'; // Adjust the import path as needed
import createClient from '@/utils/supabase/client';
import { UUID } from 'crypto';

type CourseInfo = {
  course_code: string;
  title: string;
};
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

type PortToPlannerProps = {
  id: string; // _clerk_user_id
};

type TaskRoadmap = {
  [key: string]: unknown;
  courseId: string;
  columnId: string;
  content: string;
  _clerk_user_id: string;
};

const PortToPlanner: React.FC<PortToPlannerProps> = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient()
  const { user } = useUser();
  const { toast } = useToast();

const handleAddToPlanner = async () => {
    setLoading(true);
    setMessage(null);

    try {
        // 1. Fetch Enrollments for the User
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('course_id, semester_id')
          .eq('_clerk_user_id', id);
  
        if (enrollError) {
          throw new Error(`Error fetching enrollments: ${enrollError.message}`);
        }
  
        if (!enrollments || enrollments.length === 0) {
          throw new Error('No enrollments found for this user.');
        }
  
        // Extract unique semester_ids and course_ids
        const semesterIds = Array.from(new Set(enrollments.map((e) => e.semester_id)));
        const courseIds = Array.from(new Set(enrollments.map((e) => e.course_id)));
  
        console.log('semIds', semesterIds);
        console.log('cids', courseIds);
  
        // 2. Fetch Semester Details
        const { data: semesters, error: semError } = await supabase
          .from('semesters')
          .select('id, sem_alias') // Include 'id' to map correctly
          .in('id', semesterIds);
  
        if (semError) {
          throw new Error(`Error fetching semesters: ${semError.message}`);
        }
  
        if (!semesters || semesters.length === 0) {
          throw new Error('No semester details found.');
        }
  
        // Create a mapping from semester_id (id) to sem_alias for quick lookup
        const semesterMap: { [key: string]: string } = {};
        (semesters as { id: string; sem_alias: string }[]).forEach((sem) => {
          semesterMap[sem.id] = sem.sem_alias;
        });
  
        console.log('Semester Map:', semesterMap);
  
        // 3. Fetch Course Details
        const { data: courses, error: courseError } = await supabase
          .from('course_info')
          .select('id, course_code, title') // Include 'id' for mapping
          .in('id', courseIds);
  
        if (courseError) {
          throw new Error(`Error fetching course information: ${courseError.message}`);
        }
  
        if (!courses || courses.length === 0) {
          throw new Error('No course information found.');
        }
  
        // Create a mapping from course_id (id) to course details for quick lookup
        const courseMap: { [key: string]: CourseInfo } = {};
        (courses as { id: string; course_code: string; title: string }[]).forEach((course) => {
          courseMap[course.id] = {
            course_code: course.course_code,
            title: course.title,
          };
        });
  
        console.log('Course Map:', courseMap);
  
        // 4. Delete Existing Tasks in tasks_roadmap
        const { error: deleteError } = await supabase
          .from('tasks_roadmap')
          .delete()
          .eq('_clerk_user_id', user?.id ?? '');
  
        if (deleteError) {
          throw new Error(`Error deleting existing tasks: ${deleteError.message}`);
        }
  
        // 5. Prepare New Tasks to Insert
        const tasksToInsert: TaskRoadmap[] = (enrollments as { semester_id: string; course_id: string }[]).map((enrollment) => {
          const semesterAlias = semesterMap[enrollment.semester_id];
          const courseDetails = courseMap[enrollment.course_id];
  
          return {
            courseId: enrollment.course_id as string,
            columnId: semesterAlias || 'Unknown Semester', // Fallback in case of missing sem_alias
            content: courseDetails ? courseDetails.title : 'Unknown Course',
            _clerk_user_id: user?.id || '',
          };
        });
  
        console.log('Tasks to insert', tasksToInsert);
  
        // 6. Insert New Tasks into tasks_roadmap
        const { error: insertError } = await supabase
          .from('tasks_roadmap')
          .insert(tasksToInsert);
  
        if (insertError) {
          throw new Error(`Error inserting new tasks: ${insertError.message}`);
        }
  
        toast({ description: 'Modules successfully added to your planner!' });
      } catch (error: any) {
        console.error(error);
        toast(error.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div>
        <Button onClick={handleAddToPlanner} disabled={loading}>
          {loading ? 'Adding...' : 'Add to Planner'}
        </Button>
        {message && (
          <p className={`mt-2 ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    );
  };
  
  export default PortToPlanner;