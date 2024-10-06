"use client"
import Timeline from '@/components/roadmap/Timeline';
import Roadmaps from './components/Roadmaps';
import { useEffect, useState } from 'react';
import createClient from '@/utils/supabase/client';
import { SeniorName, SeniorRoadmap } from '@/types';
import HeadingCard from '@/components/roadmap/HeadingCard';


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



const [showRoadmap, setShowRoadmap] = useState(false)
const [timelinePayload, setTimelinePayload] = useState('')



const handleClick = (seniorName: string) => {
  setShowRoadmap(true)
  setTimelinePayload(seniorName)
  window.scrollTo({ top: 0});
}

const handleBack = () => {
  setShowRoadmap(false)
}

  return (
    <div>
      { showRoadmap ? 
        <div className='flex flex-col overflow-hidden' style={{ width: '100%', height: '100%'}}>
          <div className='mb-2'>
            <HeadingCard handleClick={handleBack}/>
          </div>
          <div className='w-11/12 container h-screen self-center flex-grow-0'>
            
            <Timeline seniorName={timelinePayload}/>
          </div>
        </div>

      :<Roadmaps seniorRoadmaps={seniorRoadmaps} onClick={handleClick}/>}
    </div>
  )

}