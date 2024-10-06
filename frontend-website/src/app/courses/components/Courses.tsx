import React from 'react';
import createClient  from '@/utils/supabase/server';
import CourseSummaryCard from './CourseSummaryCard';
import ErrorPopUp from '@/components/ErrorPopUp';
import { CourseSummaryCardProps } from './CourseSummaryCard';
import PageToggle from './PageToggle';
import { Separator } from '@/components/ui/separator';
import NoResultCard from '@/components/NoResultCard';

export async function Courses({ query, page, career, grading_basis, units, area }: { 
    query: string, 
    page: number,
    career?: string,
    grading_basis?: string,
    units?: string,
    area?: string 
}) {

    const supabase = createClient();
    const currentPage = page || 1;
    const limit: number = 10; // Number of items per page
    const from = (currentPage - 1) * limit;
    const to = from + limit - 1;

    //// server side rendering code below: (need use supabase server client):
    let filterQuery = supabase
    .from("course_info")
    .select(
        `
        id,
        course_code,
        title,
        career,
        units,
        description,
        enrolment_requirements
        `, { count: 'exact' } // Fetch total count of records
    )
    .or(`course_code.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
    .range(from, to); // Pagination support

    if (career) {
        filterQuery = filterQuery.eq('career', career)
    };
    if (grading_basis) {
        filterQuery = filterQuery.eq('grading_basis', grading_basis)
    };
    if (units) {
        filterQuery = filterQuery.eq('units', units)
    };

    if (area) {
        // below is a subquery due to our not so great database design

        // Fetch the course_ids (UUIDs) from the `course_areas` table where `area_name` matches
        const { data: areaCourses, error: areaError } = await supabase
            .from('course_areas')
            .select('course_id')
            .eq('area_name', area);
    
        if (areaError) {
            console.error('Error fetching area courses: ' + areaError);
            return;
        }
    
        // Extract the list of course_ids (UUIDs)
        const courseIds = areaCourses.map(course => course.course_id);
    
        // Use these course_ids to filter the `course_info` table
        filterQuery = filterQuery.in('id', courseIds); // `id` is the UUID in `course_info`
    }

    const { data: courses, count, error } = await filterQuery.range(from, to);


    let totalPages = 1;
    if (count) {
        totalPages = Math.ceil(count / limit);
    }

    if(error) {
        console.error('Error fetching course_info data: ', error);
        return <ErrorPopUp errorMessage={"Error fetching course information: "+ error.message}/>;
    }

    // handle no courses found
    if (!courses || courses.length == 0) {
        return (
            <NoResultCard searchCategory='courses'/>
        );
    }

    return (
        <div>
            <div className='flex justify-end py-1'>
                <span className='text-gray-400 font-semibold text-sm py-1 sm:py-2'>{count} courses found</span>
            </div>
            <Separator/>
            <div className='py-2 sm:py-4'>
                {courses?.map((courseInfo: any, index) => (
                    <CourseSummaryCard
                        key={index}
                        course_id = {courseInfo.id}
                        course_code={courseInfo.course_code}
                        title={courseInfo.title}
                        career={courseInfo.career}
                        description={courseInfo.description}
                        enrolment_requirements={courseInfo.enrolment_requirements}
                        units={courseInfo.units}
                    />
                ))}
            </div>
            <PageToggle currentPage={currentPage} totalPages={totalPages} />
        </div>
    )
}
