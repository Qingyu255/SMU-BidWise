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

import { Button } from "@/components/ui/button"
import { RoadmapCardProps } from '@/types'





const RoadmapCard: React.FC<RoadmapCardProps> = ({ name, major, graduation_year, courses_summary, current_job, advice, onClick }) => {
  return (
    <Card>
        <CardHeader>
            <CardTitle>{ name }</CardTitle>
            
        </CardHeader>
        <CardContent>
          { advice }
            
        </CardContent>
        <CardFooter>
            <Button onClick={onClick}>View Roadmap</Button>
        </CardFooter>
    </Card>
  )
}

export default RoadmapCard