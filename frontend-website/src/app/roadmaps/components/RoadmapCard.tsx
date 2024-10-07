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





const RoadmapCard: React.FC<RoadmapCardProps> = ({ title, description, onClick }) => {
  return (
    <Card>
        <CardHeader>
            <CardTitle>{ title }</CardTitle>
            
        </CardHeader>
        <CardContent>
          { description }
            
        </CardContent>
        <CardFooter>
            <Button onClick={onClick}>View Roadmap</Button>
        </CardFooter>
    </Card>
  )
}

export default RoadmapCard