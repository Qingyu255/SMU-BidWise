import React from 'react';
import { Button } from './ui/button';
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs';

export default function TopBar() {
  return (
    <div className='pl-[40px] sm:px-0 w-full flex justify-between items-center my-4'>
        {/* TODO: Make term dynamic*/}
        <span id='term' className='font-bold'>2024-25 Term 1</span>
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
            <span>-- feature here --</span>
        </div>
    </div>
  )
}
