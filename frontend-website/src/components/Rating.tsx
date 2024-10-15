"use client"
import React, { useState, useEffect } from 'react'
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
    const [loading, setLoading] = useState<boolean>(true);
    const { toast } = useToast();

    const fetchRatingData = async () => {
        try {
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
        } finally {
            setLoading(false);
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
        }
    };

    return (
        <div id={`${ratingName.toLowerCase()}rating`} className='inline-block pr-2'>
            <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold my-2">{ratingName}:</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Info className="w-5 h-5 text-gray-600 cursor-pointer opacity-60" />
                        </PopoverTrigger>
                        <PopoverContent>
                            <p className='text-xs'>{ratingDescription}</p>
                            <p className='text-xs mt-1 opacity-60'>{userContributions} users contributed to this rating.</p>
                        </PopoverContent>
                    </Popover>
            </div>
            <div className="relative w-fit">
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
            {(!loading && userContributions === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 text-center">
                    <span className=" opacity-50 text-xs">No ratings yet</span>
                </div>
            )}
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
                                <div>
                                    {(ratingName.toLowerCase() === "workload") && (
                                        <div className='flex justify-between'>
                                            <span className='opacity-60 text-xs'>{`1 - Very Manageable`}</span>
                                            <span className='opacity-60 text-xs'>{`5 - Heavy Workload`}</span>
                                        </div>
                                    )}
                                    {(ratingName.toLowerCase() === "practicality") && (
                                        <div className='flex justify-between'>
                                            <span className='opacity-60 text-xs'>{`1 - Very Impractical`}</span>
                                            <span className='opacity-60 text-xs'>{`5 - Very Useful`}</span>
                                        </div>
                                    )}
                                    {(ratingName.toLowerCase() === "interesting") && (
                                        <div className='flex justify-between'>
                                            <span className='opacity-60 text-xs'>{`1 - Very Boring`}</span>
                                            <span className='opacity-60 text-xs'>{`5 - Very Interesting`}</span>
                                        </div>
                                    )}
                                </div>
                                <PopoverClose asChild>
                                    <Button variant="outline" className='mt-2' onClick={handleSubmitRating}>
                                        Rate
                                    </Button>
                                </PopoverClose>
                                <div className='text-xs text-left opacity-60 pt-2'>Ratings are anonymous</div>
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
