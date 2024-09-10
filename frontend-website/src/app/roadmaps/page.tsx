
import React, { useEffect } from 'react';
import { createClient } from '@/utils/supabase/server';
// import { seniorsAttributes } from '@/types';



export default async function Page() {
    
    const supabase = createClient();
    const { data: seniors, error: seniorsError } = await supabase.from<string, string>("seniors").select();

    if(seniorsError) {
        console.log('Error fetching seniors: ', seniorsError);
    }

    const { data: semesters, error: semestersError } = await supabase.from<string, string>("semesters").select();

    if(semestersError) {
        console.log('Error fetching semesters: ', semestersError);
    }
    const { data: enrollments, error: enrollmentsError } = await supabase.from<string, string>("enrollments").select();

    if(enrollmentsError) {
        console.log('Error fetching enrollments: ', enrollmentsError);
    }
    const { data: courses, error: coursesError } = await supabase.from<string, string>("courses").select();

    if(coursesError) {
        console.log('Error fetching courses: ', coursesError);
    }
    
        

    

    return (
        <>
            
            <div>
                Hello, this is senior roadmap.
            </div>

            {JSON.stringify(semesters)}<br/><br/>
            {JSON.stringify(seniors)}<br/><br/>
            {JSON.stringify(enrollments)}<br/><br/>
            {JSON.stringify(courses)}<br/><br/>
            
        </>
        
    )
}
