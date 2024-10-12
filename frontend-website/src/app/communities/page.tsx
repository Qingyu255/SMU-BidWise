// import React from 'react'

// export default function page() {
//     return (
//         <div>
//             Hello communities (threads? / discussions)
//         </div>
//     )
// }

import React from "react";
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button'; // Adjust this path as needed based on your file structure

// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator"
// import Link from "next/link";
// import { format } from "date-fns"
//how to import new components? 


export default function Page() {
    return (
        <>
            {/* <h1 className='font-bold text-3xl md:text-4xl'>Join Communities</h1>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'></div>
 */}

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
                        href={`/communities/create`}>
                        Create A Community
                    </Link>
                </div>
            </div>
            </> 
            )
}
