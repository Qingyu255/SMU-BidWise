import React from "react";
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button'; // Adjust this path as needed based on your file structure
import { Squirrel } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

export default function Page() {
    return (
        <>
            {/* <h1 className='font-bold text-3xl md:text-4xl'>Join Communities</h1>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'></div>
 */}
            <Card className='flex flex-col p-5 my-3'>
                <div className='flex justify-left'>
                    <Squirrel/>
                    <CardTitle className='text-center my-auto px-2'>Feature in development...</CardTitle>
                </div>
            </Card>
            {/* subreddit info */}
            <div className='overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
                <div className='bg-emerald-100 px-6 py-4'>
                    <p className='font-bold'>Welcome to SMUBidwise Community Threads</p>
                </div>
                <div className='-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6'>
                    <div className='flex justify-between gap-x-4 py-3'>
                        <p className='text-zinc-500'>
                            Join and interact with communities related to your course or mods! 
                        </p>
                    </div>

                </div>

                <div className="text-center">
                    <Link
                        className={buttonVariants({
                            className: 'w-11/12 mt-4 mb-6',
                        })}
                        href={`/communities`}>
                        Create A Community
                    </Link>
                </div>
            </div>

            </> 
            )
}

