import React from 'react';
import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import { poppins } from '@/utils/fonts';

export default function SignInPage() {
    return (
        <div className='flex flex-col items-center justify-center py-10 md:px-20'>
            <div className='flex items-center mb-5'>
                <Image
                    className='ml-1 inline'
                    src="/icon.png"
                    alt="logo"
                    width={35}
                    height={35}
                />
                <div className={`mx-1 text-lg md:text-xl font-semibold text-foreground ${poppins.className}`}>SMU BIDWISE</div>
            </div>
            <SignIn />
        </div>
    );
}
