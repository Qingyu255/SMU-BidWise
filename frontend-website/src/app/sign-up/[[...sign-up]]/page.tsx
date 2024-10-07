import React from 'react';
import { SignUp } from '@clerk/nextjs';
import { poppins } from '@/utils/fonts';
import Image from 'next/image';

export default function page() {
    return (
        <div className='flex flex-col items-center justify-center py-10 md:px-20'>
            <div className='flex flex-col items-center text-center mb-10'>
                <div className='flex items-center'>
                    <Image
                        className='ml-1 inline'
                        src="/icon.png"
                        alt="logo"
                        width={35}
                        height={35}
                    />
                    <div className={`mx-1 text-lg md:text-xl font-semibold text-foreground ${poppins.className}`}>SMU BIDWISE</div>
                </div>
                <div className='mt-4 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight'>
                    Seamless Course Planning
                </div>
                <p className='mt-2 text-sm md:text-base lg:text-lg'>
                    Take control of your module bidding like never before
                </p>
            </div>
            <SignUp />
        </div>
    );
}
