"use client"
import HeadingCard from '@/components/roadmap/HeadingCard'
import React, { useEffect, useState } from 'react'
import Timeline from '../components/Timeline'
import createClient from '@/utils/supabase/client'
import { HeadingCardProps, RoadmapInfo } from '@/types'
import { Spinner } from '@nextui-org/react'

const Page = ({ params }: { params : {name: string}}) => {
    let { name } = params
    name = name.replaceAll("%20", " ")
    const [loading, setLoading] = useState<boolean>(true);
    const supabase = createClient();

    const [headingCardInfo, setHeadingCardInfo] = useState<RoadmapInfo[]>([]);
    useEffect(() => {
      const fetchRoadmapInfo = async () => {
        try {
            const { data } = await supabase
            .from('roadmap_info')
            .select('*')
            .eq('name', name);
            const formattedData: RoadmapInfo[] = data ? data.map((item: any) => ({
            name: item.name,
            major: item.major,
            graduation_year: item.graduation_year,
            courses_summary: item.courses_summary,
            current_job: item.current_job,
            advice: item.advice,
            _clerk_user_id: item._clerk_user_id,
            })) : [];
            setHeadingCardInfo(formattedData);
        } catch(error) {
            console.log('Error fetching roadmap info', error); 
        } finally {
            setLoading(false)
        }
        
        
      };
  
      fetchRoadmapInfo();
      
    }, [supabase])


  return (
    <>
    {loading 
    ? (
        <div className='py-5 flex items-center justify-center'>
                  <Spinner color="default"/>
              </div>
    ) 
    : (
    <div className='flex flex-col overflow-hidden' style={{ width: '100%', height: '90vh'}}>
        <div className='mb-2'>
          {headingCardInfo.length > 0 && <HeadingCard headingCardInfo={headingCardInfo[0]}/>}
        </div>
        <div className='container self-center flex-grow-1' style={{ height: 'inherit' }}>
          
          <Timeline seniorName={headingCardInfo.length > 0 ? headingCardInfo[0].name : ''}/>
        </div>
      </div>
    )}
    </>
    
  )
}

export default Page