import React from 'react';
import { CloudUpload } from 'lucide-react';
import {
    SignedIn,
    SignedOut,
    SignInButton
  } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function InfoCard() {
    return (
        <>
            <SignedOut>
                <Card className="mx-auto">
                    <CardHeader className='pb-2'>
                        <div className="flex items-center space-x-2">
                            <CloudUpload className="w-4 h-4" />
                            <CardTitle>Save Your Timetable on the Cloud</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-col md:flex-row md:justify-between'>
                            <div>
                                <CardDescription>
                                    Sign in to enable cloud saving and access your timetable across devices.
                                </CardDescription>
                                <CardDescription className="mb-1">
                                    Your timetable will only be saved locally on your browser if you&apos;re not signed in.
                                </CardDescription>
                            </div>
                            <SignInButton>
                                <Button className='w-fit'>
                                    Sign In
                                </Button>
                            </SignInButton>
                        </div>
                    </CardContent>
                </Card>
            </SignedOut>
            <SignedIn>
                <div className="flex items-center space-x-2">
                    <CloudUpload className="w-4 h-4"/>
                    <CardDescription>Changes saved automatically</CardDescription>
                </div>
            </SignedIn>
        </>
    );
}
