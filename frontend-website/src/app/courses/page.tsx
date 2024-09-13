import React, { Suspense } from 'react';
import createClient  from '@/utils/supabase/server';
import SearchBar from './components/SearchBar';
import { Courses } from './components/Courses';
import CourseSummaryCardSkeleton from './components/CourseSummaryCardSkeleton';
import Filters from './components/Filters';
import { FilterOptions } from './components/Filters';
  
  const fetchFilterOptions = async (): Promise<FilterOptions> => {
      const supabase = createClient();
      try {
        const { data: careerData, error: careerError } = await supabase
            .from("course_info")
            .select("career")
        if (careerError) {
            throw careerError;
        }
        const distinctCareers = [...new Set(careerData
            .map((item: { career: string }) => item.career))]
            .filter((item => (item !== "Course Career")));

        const { data: gradingData, error: gradingError } = await supabase
            .from("course_info")
            .select("grading_basis")
            .order("grading_basis");
        if (gradingError) {
            throw gradingError;
        }
        const distinctGradingBasis = [...new Set(gradingData
            .map((item: { grading_basis: string }) => item.grading_basis))]
            .filter((item => (item !== "Not Printed")));

        const { data: unitsData, error: unitsError } = await supabase
            .from("course_info")
            .select("units")
            .order("units");
        if (unitsError) {
            throw unitsError;
        }
        const distinctUnits = [...new Set(unitsData
            .map((item: { units: string }) => item.units))];

        const { data: areaData, error: areaError } = await supabase
            .from("course_areas")
            .select("area_name")
            .order("area_name");
        if (areaError) {
            throw areaError;
        }
        const distinctAreas = [...new Set(areaData
            .map((item: { area_name: string }) => item.area_name))];

        return {
            careerArr: distinctCareers,
            grading_basisArr: distinctGradingBasis,
            unitsArr: distinctUnits,
            areaArr: distinctAreas
        };
      
      } catch (error) {
          console.error("Error fetching filter options: ", error);
          return { careerArr: [], grading_basisArr: [], unitsArr: [], areaArr: [] };
      }
  }

export default async function Page({ searchParams }: { 
    searchParams?: {
        query?: string;
        page?: string;
        career?: string;
        area?: string;
        grading_basis?: string;
        units?: string;
    };
}) {
    const { careerArr, grading_basisArr, unitsArr, areaArr } = await fetchFilterOptions();
    const query = searchParams?.query || '';
    const page = Number(searchParams?.page) || 1;
    const career = searchParams?.career || '';
    const area = searchParams?.area || '';
    const grading_basis = searchParams?.grading_basis || '';
    const units = searchParams?.units || '';

    return (
        <div>
            <SearchBar/>
            <Filters careerArr={careerArr} grading_basisArr={grading_basisArr} unitsArr={unitsArr} areaArr={areaArr}/>
            <Suspense fallback={<CourseSummaryCardSkeleton/>}>
                <Courses query={query} page={page} career={career} grading_basis={grading_basis} units={units} area={area}/>  
            </Suspense>
        </div>
    )
}
