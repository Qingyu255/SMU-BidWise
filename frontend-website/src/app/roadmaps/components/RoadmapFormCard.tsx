"use client"
import React from 'react'
import { Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Button } from "@/components/ui/button"

import Link from 'next/link'


const RoadmapFormCard = () => {
  return (
<Alert className='mb-5'>
<Terminal className="h-4 w-4" />
    <div className='flex flex-row justify-between items-center'>
        <div>
            
            <h1 className="text-lg font-bold">Add your senior roadmap!</h1>
            <AlertDescription>
                Be a part of the community by giving your juniors some advice.
            </AlertDescription>
        </div>
        <div>
            <Button>
                <Link href="roadmaps/form">Add Roadmap</Link>
            </Button>
        </div>
    </div>
  
</Alert>
  )
}

export default RoadmapFormCard