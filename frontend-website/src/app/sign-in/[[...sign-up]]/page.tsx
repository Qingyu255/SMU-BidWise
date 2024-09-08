import React from 'react';
import { SignIn } from '@clerk/nextjs';

export default function page() {
    return (
        <div className='py-10 px-10 md:px-20'>
            <div className='flex flex-col mb-10'>
                <span>--SMU BidWise logo here--</span>
                <h1 className='text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight'>
                    TODO: Insert relevant text
                </h1>
            </div>
            <div className='h-full flex justify-center'>
                <SignIn/>
            </div>
        </div>
    )
}
