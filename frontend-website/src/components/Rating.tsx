"use client"
import React, { useState, useEffect } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, SquarePen, Square } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { useSupabaseClient } from '@/utils/supabase/authenticated/client';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

type RatingProps = {
    courseId: string,
    ratingName: string,
    fillColour: string,
    ratingDescription: string,
    isRatingAllowed?: boolean
}

export default function Rating({ courseId, ratingName, fillColour, ratingDescription, isRatingAllowed }: RatingProps) {
    const { user } = useUser();
    const supabase = useSupabaseClient();
    const [userRating, setUserRating] = useState<number>(0);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [userContributions, setUserContributions] = useState<number>(0);
    const router = useRouter();
    const { toast } = useToast();

    const fetchRatingData = async () => {
        const { data: avgData, error: avgError } = await supabase.rpc('get_average_rating', {
            _course_id: courseId,
            _rating_name: ratingName,
        });

        if (avgError) {
            console.error("Error fetching average rating:", avgError.message);
        } else {
            // console.log("average rating: for" + courseId, avgData);
            setAverageRating(avgData);
        }

        const { data: countData, error: countError } = await supabase.rpc('get_user_contributions', {
            _course_id: courseId,
            _rating_name: ratingName,
        });

        if (countError) {
            console.error("Error fetching user contributions:", countError.message);
        } else {
            // console.log("user contributions: ", countData);
            setUserContributions(countData);
        }
    };

    useEffect(() => {
        fetchRatingData();
    }, [courseId, ratingName, supabase]);
    
    const handleSubmitRating = async () => {
        const { error } = await supabase.rpc('upsert_rating_contribution', {
            _clerk_user_id: user?.id,
            _course_id: courseId,
            _rating_name: ratingName,
            _rating_value: userRating,
        });

        if (error) {
            toast({
                title: 'Submission Failed',
            })
            console.error("Error submitting rating:", error.message);
        } else {
            toast({
                title: 'Thank you for contributing!',
            })
            await fetchRatingData();
            router.refresh();
        }
    };

    return (
        <div id={`${ratingName.toLowerCase()}rating`} className='inline-block'>
            <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold my-2">{ratingName} Rating:</p>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-5 h-5 text-gray-600 cursor-pointer opacity-60" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{ratingDescription}</p>
                            <p className='mt-1 opacity-60'>{userContributions} users contributed to this rating.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <div key={averageRating} className='flex flex-row border-2 border-r-0 border-black dark:border-white w-fit'>
                {Array(5).fill('_').map((_, index) => (
                    <div 
                        key={index}
                        className={`border-r-2 border-black dark:border-white w-[25px] h-[25px]`}
                        style={{ backgroundColor: index < (averageRating) ? fillColour : 'transparent' }}
                    >
                    </div>
                ))}
            </div>
            {isRatingAllowed && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="secondary" className="mt-2 px-1">
                            <SquarePen className='h-4 w-4 mr-1'/>
                            <span className='text-[11px] font-medium'>Rate</span>
                            
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <SignedIn>
                            <div className='text-center'>
                                <h3 className="text-center font-semibold mb-2">Select {ratingName} rating</h3>
                                <div className="flex space-x-2 justify-center">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Square
                                    key={index}
                                    className={`cursor-pointer ${index < (userRating ?? 0) ? `text-black` : 'text-gray-300'} rounded-sm`}
                                    style={{ backgroundColor: index < (userRating ?? 0) ? fillColour : 'transparent' }}
                                    onClick={() => setUserRating(index + 1)}
                                    />
                                ))}
                                </div>
                                <PopoverClose asChild>
                                    <Button variant="outline" className='mt-2' onClick={handleSubmitRating}>
                                        Rate
                                    </Button>
                                </PopoverClose>
                            </div>
                        </SignedIn>
                        <SignedOut>
                            <div className='text-center'>
                                <div className="text-center font-semibold mb-2">Please sign in to contribute rating!</div>
                                <div>
                                    <SignInButton>
                                        <Button className='w-fit'>
                                            Sign In
                                        </Button>
                                    </SignInButton>
                                </div>
                            </div>
                        </SignedOut>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}
