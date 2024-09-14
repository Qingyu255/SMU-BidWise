"use client"
import React from 'react';
import { Button } from './ui/button';
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/ModeToggle"

export default function TopBar() {
    const pathName = usePathname();
    let pageName;
    if (pathName) {
        pageName = pathName.split("/")[1];
        switch(pageName) {
            case "timetable":
                pageName = "Timetable"
                break;
            case "courses":
                pageName = "Courses"
                break;
            case "bid-analytics":
                pageName = "Bid Price Analytics"
                break;
            case "roadmaps":
                pageName = "Senior Roadmaps"
                break;
            case "graduation-progress-tracker":
                pageName = "Graduation Progress Tracker"
                break;
            case "communities":
                pageName = "Community Threads"
                break;
            default:
                pageName = "Home"
          }
    }
    return (
    <div className='pl-[40px] sm:px-0 w-full flex justify-between items-center py-4'>
        {/* TODO: Make term dynamic*/}
        <div>
            {/* <SignedOut>
                <SignInButton>
                    <Button className='w-min-[220px]'>
                        Sign In
                    </Button>
                </SignInButton>
                </SignedOut>
                <SignedIn>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex gap-2'>
                    <UserButton 
                        appearance={{
                        elements: {
                            userButtonBox: {
                            flexDirection: "row-reverse",
                            },
                        },
                        }}
                        showName
                    />
                    </div>
                </div>
            </SignedIn> */}
            <span className='font-bold text-lg sm:text-xl md:text-2xl'>{pageName}</span>
        </div>
        <div className='flex items-center gap-2'>
            <Badge id='term' className='font-bold'>2024-25 Term 1</Badge>
            <ModeToggle/>
        </div>
    
    </div>
    )
}
