"use client"
import Timeline from '@/components/roadmap/Timeline'
import React from 'react'
import RoadmapCard from './RoadmapCard'
import { RoadmapsProps } from '@/types'



const Roadmaps: React.FC<RoadmapsProps> = ({ seniorRoadmaps, onClick }) => {
    


    
    return (
        <div className='flex flex-col gap-3'>
            {seniorRoadmaps.map((senior) => (
                        <RoadmapCard key={senior.name} title={senior.title} description={senior.description} onClick={() => onClick(senior.name)}/>
                    ))}
        </div>
       
    )
}


export default Roadmaps