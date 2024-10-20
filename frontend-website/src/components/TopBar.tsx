"use client"
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/ModeToggle";
import { getLatestTerm, TermObjType } from '@/utils/supabase/supabaseRpcFunctions';

export default function TopBar() {
    const pathName = usePathname();
    const [latestTerm, setLatestTerm] = useState<string>(""); // this is normal name eg, 2024-25 Term 1

    let pageName;
    if (pathName) {
        pageName = pathName.split("/")[1];
        switch(pageName) {
            case "timetable":
                pageName = "My Timetable"
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
                pageName = ""
          }
    }
    useEffect(() => {
        const fetchLatestTerm = async () => {
            try {
                const latestTermObj: TermObjType | null = await getLatestTerm();
                const latestTermStr = latestTermObj?.term ?? "";
                setLatestTerm(latestTermStr);
            } catch (error) {
                console.error('Error fetching latest term in Top Bar:', error);
                setLatestTerm("2024-25 Term 2"); // fallback to hardcoded
            }
        }
        fetchLatestTerm();
    }, [])
    return (
    <div className='pl-[40px] lg:px-0 w-full flex justify-between items-center py-4'>
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
            <Badge id='term' className='font-bold'>{latestTerm}</Badge>
            <ModeToggle/>
        </div>
    
    </div>
    )
}
