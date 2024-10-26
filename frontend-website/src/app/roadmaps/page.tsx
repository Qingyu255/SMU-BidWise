"use client"
import Timeline from '@/app/roadmaps/components/Timeline';
import Roadmaps from './components/Roadmaps';
import { useEffect, useState } from 'react';
import createClient from '@/utils/supabase/client';
import { RoadmapInfo, SeniorName, SeniorRoadmap } from '@/types';
import HeadingCard from '@/components/roadmap/HeadingCard';
import RoadmapFormCard from './components/RoadmapFormCard';
import { useTheme } from 'next-themes';


export default function Page() {

  const supabase = createClient()

  const [seniorNames, setSeniorNames] = useState<SeniorName[]>([]);

  useEffect(() => {
    const fetchSeniorNames = async () => {
      const { data, error } = await supabase
        .from<string, any>('seniors')
        .select('name');

      if (error) {
        console.log('Error fetching seniors:', error);
      } else if (data) {
        setSeniorNames(data);
      }
    };

    fetchSeniorNames();
  }, [supabase]);



  const [roadmapInfo, setRoadmapInfo] = useState<RoadmapInfo[]>([]);
  useEffect(() => {
    const fetchRoadmapInfo = async () => {
      const { data, error } = await supabase
        .from('roadmap_info')
        .select('*');

        if (error) {
          console.log('Error fetching roadmap info', error);
        } else if (data) {
          const formattedData: RoadmapInfo[] = data.map((item: any) => ({
            name: item.name,
            major: item.major,
            graduation_year: item.graduation_year,
            courses_summary: item.courses_summary,
            current_job: item.current_job,
            advice: item.advice,
            _clerk_user_id: item._clerk_user_id,
          }));
          setRoadmapInfo(formattedData);
          console.log(roadmapInfo);
        }
    };

    fetchRoadmapInfo();
    
  }, [supabase])
  

const [timelinePayload, setTimelinePayload] = useState('')
const [headingCardInfo, setHeadingCardInfo] = useState<RoadmapInfo>({
  name: '',
  major: '',
  graduation_year: 0,
  courses_summary: '',
  current_job: '',
  advice: '',
  _clerk_user_id: ''
})


  return (
    <div>

      <>
      <RoadmapFormCard/>
      <Roadmaps roadmapInfo={roadmapInfo}/>
      </>
      
    </div>
  )

}