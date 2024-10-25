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
  
// Define arrays of degrees and job descriptions
const degrees = [
  'Bachelor of Business Management',
  'Bachelor of Accountancy',
  'Bachelor of Science (Economics)',
  'Bachelor of Laws',
  'Bachelor of Information Systems',
  'Bachelor of Science (Computer Science)',
  // Add more degrees if needed
];

const jobDescriptions = [
  'is now working as a Financial Analyst at a leading investment bank.',
  'secured a position as an Accountant at a Big Four firm.',
  'is employed as an Economist at a government agency.',
  'started practicing as a Corporate Lawyer in a top law firm.',
  'is a Systems Analyst at a multinational tech company.',
  'became a Software Engineer at a prominent tech startup.',
  // Add more job descriptions if needed
];

// Initialize the seniorRoadmaps array
const seniorRoadmaps: SeniorRoadmap[] = [];

// Check if seniorNames array is not empty

  seniorNames.forEach((senior, index) => {
    // Randomly select a degree and job description
    const degree = degrees[Math.floor(Math.random() * degrees.length)];
    const jobDescription = jobDescriptions[Math.floor(Math.random() * jobDescriptions.length)];

    // Alternatively, assign degrees and jobs sequentially:
    // const degree = degrees[index % degrees.length];
    // const jobDescription = jobDescriptions[index % jobDescriptions.length];

    // Push the senior's roadmap into the array
    seniorRoadmaps.push({
      name: senior.name,
      title: degree,
      description: `${senior.name} ${jobDescription}`,
    });
  });

  // roadmapInfo.forEach((roadmap) => {

  //   seniorRoadmaps.push({
  //     name: roadmap.name,
  //     title: degree,
  //     description: `${senior.name} ${jobDescription}`,
  //   });
  // });



const [showRoadmap, setShowRoadmap] = useState(false)
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



const handleClick = (name: string, roadmap:RoadmapInfo) => {
  // console.log(roadmapInfo)
  setShowRoadmap(true)
  setTimelinePayload(name)
  setHeadingCardInfo(roadmap)
  window.scrollTo({ top: 0});
}

const handleBack = () => {
  setShowRoadmap(false)
}

// const handleFormClick = () => {

// }

  return (
    <div>
      { showRoadmap ? 
        <div className='flex flex-col overflow-hidden' style={{ width: '100%', height: '90vh'}}>
          <div className='mb-2'>
            <HeadingCard handleClick={handleBack} headingCardInfo={headingCardInfo}/>
          </div>
          <div className='container self-center flex-grow-1' style={{ height: 'inherit' }}>
            
            <Timeline seniorName={timelinePayload}/>
          </div>
        </div>

      :
      <>
      <RoadmapFormCard/>
      <Roadmaps roadmapInfo={roadmapInfo} onClick={handleClick}/>
      </>
      }
    </div>
  )

}