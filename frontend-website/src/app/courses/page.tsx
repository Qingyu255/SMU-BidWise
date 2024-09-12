import React, { Suspense } from 'react';
import SearchBar from './components/SearchBar';
import { Courses } from './components/Courses';
import CourseSummaryCardSkeleton from './components/CourseSummaryCardSkeleton';

export default async function Page({ searchParams }: { 
    searchParams?: {
        query?: string;
        page?: string;
    };
}) {
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    return (
        <div>
            <SearchBar/>
            <Suspense fallback={<CourseSummaryCardSkeleton/>}>
                <Courses query={query} page={currentPage}/>  
            </Suspense>
        </div>
    )
}
