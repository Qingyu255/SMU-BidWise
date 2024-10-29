"use client"
import Timeline from '@/app/roadmaps/components/Timeline';
import Roadmaps from './components/Roadmaps';
import { useEffect, useState } from 'react';
import createClient from '@/utils/supabase/client';
import { DegreeData, verifiedSeniorsData } from '@/types';
import HeadingCard from '@/components/roadmap/HeadingCard';
import RoadmapFormCard from './components/RoadmapFormCard';
import { useTheme } from 'next-themes';
import RoadmapFilters, { RoadmapFilterOptions } from './components/RoadmapFilter';


const fetchRoadmapFilterOptions = async (): Promise<RoadmapFilterOptions> => {
  const supabase = createClient();
  try {
  const { data: degreeData, error: degreeError } = await supabase
      .from("roadmap_info")
      .select("degree");
  if (degreeError) {
      throw degreeError;
  }
  const distinctDegrees = Array.from(new Set((degreeData as DegreeData[])
      .map((item: { degree: string }) => item.degree)));
  console.log('distinctD', distinctDegrees)
  
  const { data: verifiedSeniorsData, error: verifiedSeniorsError } = await supabase
  .from("roadmap_info")
  .select("verified_seniors");
  if (verifiedSeniorsError) {
      throw verifiedSeniorsError;
  }
  const distinctVerifiedSeniors = Array.from(new Set((verifiedSeniorsData as { verified_seniors: string }[])
        .map((item) => item.verified_seniors)));
  console.log('distinctVS', distinctVerifiedSeniors)
  

  return {
      degreeArr: distinctDegrees,
      verifiedSeniorsArr: distinctVerifiedSeniors,
  };
  
  } catch (error) {
      console.error("Error fetching filter options: ", error);
      return { degreeArr: [], verifiedSeniorsArr: [], };
  }
}

export default function Page({ searchParams }: {
  searchParams?: {
    page?: string;
    degree?: string;
    verified_seniors?: string;
  };
}) {
  const [filterOptions, setFilterOptions] = useState<RoadmapFilterOptions>({ degreeArr: [], verifiedSeniorsArr: [] });
  const page = Number(searchParams?.page) || 1;
  const degree = searchParams?.degree || '';
  const verified_seniors = searchParams?.verified_seniors?.toUpperCase() || 'FALSE';
  
  useEffect(() => {
    const fetchData = async () => {
      const options = await fetchRoadmapFilterOptions();
      setFilterOptions(options);
    };
    fetchData();
    
  }, []);

  return (
    <div>
      <>
      <RoadmapFilters degreeArr={filterOptions.degreeArr} verifiedSeniorsArr={filterOptions.verifiedSeniorsArr}/>
        <RoadmapFormCard />
        <Roadmaps page={page} degree={degree} verified_seniors={verified_seniors}/>
      </>
    </div>
  );
}