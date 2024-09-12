import React from 'react';
import createClient  from '@/utils/supabase/server';
import CourseSummaryCard from './CourseSummaryCard';
import ErrorPopUp from '@/components/ErrorPopUp';
import { CourseSummaryCardProps } from './CourseSummaryCard';
import PageToggle from './PageToggle';
import { Separator } from '@/components/ui/separator';

export async function Courses({ query, page }: { query: string, page: number }) {
    const supabase = createClient();

    const currentPage = page || 1;
    const limit: number = 10; // Number of items per page
    const from = (currentPage - 1) * limit;
    const to = from + limit - 1;

    const { data: courses, count, error } = await supabase
        .from("course_info")
        .select(
            `
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

    let totalPages = 1;
    if (count) {
        totalPages = Math.ceil(count / limit);
    }

    if(error) {
        console.error('Error fetching course_info data: ' + error);
        return <ErrorPopUp errorMessage={"Error fetching course information: " + error}/>;
    }

    // handle no courses found
    if (!courses || courses.length == 0) {
        return <ErrorPopUp errorMessage="No courses found" />;
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
