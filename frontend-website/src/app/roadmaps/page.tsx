"use client"
import Timeline from '@/app/roadmaps/components/Timeline';
import Roadmaps from './components/Roadmaps';
import { useEffect, useState } from 'react';
import createClient from '@/utils/supabase/client';
import { RoadmapInfo, SeniorName, SeniorRoadmap } from '@/types';
import HeadingCard from '@/components/roadmap/HeadingCard';
import RoadmapFormCard from './components/RoadmapFormCard';
import { useTheme } from 'next-themes';


export default function Page({ searchParams }: {
  searchParams?: {
    page?: string;
  }
}) {


  const page = Number(searchParams?.page) || 1;



// const [headingCardInfo, setHeadingCardInfo] = useState<RoadmapInfo>({
//   name: '',
//   major: '',
//   graduation_year: 0,
//   courses_summary: '',
//   current_job: '',
//   advice: '',
//   _clerk_user_id: ''
// })


  return (
    <div>

      <>
      <RoadmapFormCard/>
      <Roadmaps page={page}/>
      </>
      
    </div>
  )

}