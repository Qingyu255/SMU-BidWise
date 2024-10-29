"use client"
import Timeline from '@/app/roadmaps/components/Timeline'
import React, { useEffect, useRef, useState } from 'react'
import RoadmapCard from './RoadmapCard'
import { RoadmapInfo, RoadmapsProps } from '@/types'
import createClient from '@/utils/supabase/client'
import PageToggle from '@/app/courses/components/PageToggle'




const Roadmaps: React.FC<RoadmapsProps> = ({ page, degree, verified_seniors }: {
    page: number,
    degree: string,
    verified_seniors: string,
}) => {

    const supabase = createClient()
    const [roadmapInfo, setRoadmapInfo] = useState<RoadmapInfo[]>([]);
    const currentPage = page || 1;
    const limit: number = 1;
    const from = (currentPage - 1) * limit;
    const to = from + limit - 1
    const totalPages = useRef(1);

    useEffect(() => {
      const fetchRoadmapInfo = async () => {
            let query = supabase
                .from('roadmap_info')
                .select('*', { count: 'exact' })
                .range(from, to);

            if (degree) {
                query = query.eq('degree', degree);
            }

            
            if(verified_seniors == 'VERIFIED') {
                query = query.eq('verified_seniors', verified_seniors);
            }
                
            

            const { data, error, count } = await query;
        
        console.log('data', data)
        if (count) {
            totalPages.current = Math.ceil(count / limit);
        }

        if (error) {
        console.log('Error fetching roadmap info', error);
        } else if (data) {
        const formattedData: RoadmapInfo[] = data.map((item: any) => ({
            name: item.name,
            degree: item.degree,
            graduation_year: item.graduation_year,
            courses_summary: item.courses_summary,
            current_job: item.current_job,
            advice: item.advice,
            verified_seniors: item.verified_seniors,
            _clerk_user_id: item._clerk_user_id,
        }));
        setRoadmapInfo(formattedData);
        console.log(roadmapInfo);
        }
      };
  
      fetchRoadmapInfo();
      
    }, [supabase, degree, verified_seniors, currentPage])
    

    
    return (
        <div className='flex flex-col gap-3'>
            {roadmapInfo.map((roadmap) => (
                        <RoadmapCard key={roadmap.name} 
                        name={roadmap.name}
                        major={roadmap.degree} 
                        graduation_year={roadmap.graduation_year} 
                        courses_summary={roadmap.courses_summary} 
                        current_job={roadmap.current_job} 
                        verified_seniors={roadmap.verified_seniors}
                        advice={roadmap.advice} 
                        />
                    ))}
            <PageToggle currentPage={currentPage} totalPages={totalPages.current} />

            
        </div>
       
    )
}


export default Roadmaps