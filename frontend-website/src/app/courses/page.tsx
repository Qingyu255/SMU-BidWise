import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { Spinner } from '@nextui-org/react';
import { courseInfo } from '@/types';
import SearchBar from './components/SearchBar';
import { PageToggle } from './components/PageToggle';
import { Separator } from '@/components/ui/separator';
import ErrorPopUp from '@/components/ErrorPopUp';
import CourseSummaryCard from './components/CourseSummaryCard';

export default async function Page({ searchParams }: { 
    searchParams?: {
        query?: string;
        page?: string;
    };
}) {
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    const limit: number = 10; // Number of items per page
    const from = (currentPage - 1) * limit;
    const to = from + limit - 1;

    const supabase = createClient();

    // get total pages for pagination
    const { count } = await supabase.from('course_info').select(
        '*', { count: 'exact', head: true }
    )
    .or(
        `course_code.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%
    `);

    let totalPages = 1;
    if (count) {
        totalPages = Math.ceil(count / limit);
    }

    const { data , error } = await supabase.from<string, string>("course_info").select(`
        course_code, 
        title,
        career,
        units,
        grading_basis,
        description,
        enrolment_requirements
    `).or(
      `course_code.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`
    ).range(from, to); // Pagination support

    if(error) {
        console.error('Error fetching course_info data: ' + error);
        return <ErrorPopUp errorMessage={"Error fetching course information: " + error}/>;
    }
    console.log(data);
    return (
        <div>
            <SearchBar/>
            <div className='flex justify-end py-1'>
                <span className='text-gray-400 font-semibold text-sm py-1 sm:py-2'>{count} courses found</span>
            </div>
            <Separator/>
            <div className='py-2 sm:py-4'>
                {data?.map((courseInfo: any, index) => (
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
                {/* {JSON.stringify(data)} */}
            </div>
            
            <PageToggle currentPage={currentPage} totalPages={totalPages} />
        </div>
    )
}
