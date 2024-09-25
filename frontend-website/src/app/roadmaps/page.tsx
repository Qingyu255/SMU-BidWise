"use client"
import Timeline from '@/components/roadmap/Timeline';
import Roadmaps from './components/Roadmaps';
import { useState } from 'react';

export default function Page() {



const seniorRoadmaps = [
  {
      name: 'Senior2',
      title: 'Information Systems Graduate',
      description: 'Kylene graduated in 2024'
  },
  // {
  //     name: 'Ryan',
  //     title: 'Law Graduate',
  //     description: 'Kylene graduated in 2025'
  // }
]


const [showRoadmap, setShowRoadmap] = useState(false)
const [timelinePayload, setTimelinePayload] = useState('')



const handleClick = (seniorName: string) => {
  setShowRoadmap(true)
  setTimelinePayload(seniorName)
}

  return (
    <div>
      { showRoadmap ? 
        <div className='flex flex-col overflow-hidden' style={{ width: '100%', height: '100%'}}>
          <div className='container w-10/12 h-screen self-center flex-grow-0'>
            <Timeline seniorName={timelinePayload}/>
          </div>
        </div>

      :<Roadmaps seniorRoadmaps={seniorRoadmaps} onClick={handleClick}/>}
    </div>
  )




}





  // return (
  //   // <div className='w-full h-full'>
  //      <div className='flex flex-col overflow-hidden' style={{ width: '100%', height: '100%'}}>
  //         <div className='container w-10/12 h-screen self-center flex-grow-0'>
  //           <Timeline seniorName='Senior3'/>
  //         </div>
            
          

  //       </div>
  //   // </div>
    
  // );