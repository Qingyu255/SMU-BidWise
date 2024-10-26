"use client"
import Timeline from '@/app/roadmaps/components/Timeline'
import React from 'react'
import RoadmapCard from './RoadmapCard'
import { RoadmapsProps } from '@/types'



const Roadmaps: React.FC<RoadmapsProps> = ({ roadmapInfo }) => {
    


    
    return (
        <div className='flex flex-col gap-3'>
            {roadmapInfo.map((roadmap) => (
                        <RoadmapCard key={roadmap.name} 
                        name={roadmap.name}
                        major={roadmap.major} 
                        graduation_year={roadmap.graduation_year} 
                        courses_summary={roadmap.courses_summary} 
                        current_job={roadmap.current_job} 
                        advice={roadmap.advice} 
                        />
                    ))}
            
        </div>
       
    )
}


export default Roadmaps