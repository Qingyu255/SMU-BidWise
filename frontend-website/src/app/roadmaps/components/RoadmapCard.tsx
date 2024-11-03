"use client"
import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RoadmapCardProps } from '@/types'
import Link from 'next/link'
import Likes from './Likes'
import PortToPlanner from './PortToPlanner'





const RoadmapCard: React.FC<RoadmapCardProps> = ({ name, major, graduation_year, courses_summary, current_job, verified_seniors, advice, _clerk_user_id, likes }) => {
  
  return (
    <Card>
        <CardHeader>
            <CardTitle className='text-xl'>{ name } •	<span className='font-light'>{major}</span> {verified_seniors === 'VERIFIED' ? <Badge className='rounded-full' variant="secondary">verified</Badge> : ''}
            </CardTitle>
            <CardDescription>
              Year of Graduation: {graduation_year}
              <br></br>
              Current Job: {current_job}
            </CardDescription>
            
        </CardHeader>
        <CardContent>
          { advice.length > 250 ? `${advice.substring(0,250)}...` : advice } 
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Link href={"roadmaps/" + name}>
          <Button>
              View Roadmap
          </Button>
            </Link>
            <Likes likes={likes} id={_clerk_user_id}/>
            <PortToPlanner id={_clerk_user_id}/>
        </CardFooter>
    </Card>
  )
}

export default RoadmapCard