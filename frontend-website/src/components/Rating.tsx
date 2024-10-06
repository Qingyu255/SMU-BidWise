import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from 'lucide-react';


type RatingProps = {
    ratingName: string,
    ratingOutOfFive: number,
    fillColour: string,
    ratingDescription: string,
    userContributions: number 
}

export default function Rating({ ratingName, ratingOutOfFive, fillColour, ratingDescription, userContributions }: RatingProps) {
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
            <div className='flex flex-row border-2 border-r-0 border-black dark:border-white w-fit'>
            {Array(5).fill('_').map((_, index) => (
                <div 
                    key={index}
                    className={`border-r-2 border-black dark:border-white w-[25px] h-[25px]`}
                    style={{ backgroundColor: index < ratingOutOfFive ? fillColour : 'transparent' }}
                >
                </div>
            ))}
            </div>
        </div>
    )
}
