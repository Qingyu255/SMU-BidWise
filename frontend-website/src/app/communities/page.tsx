'use client'
import React, { useEffect } from "react";
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button'; // Adjust this path as needed based on your file structure
import createClient from '@/utils/supabase/client';
import { useUser } from "@clerk/clerk-react";


export default function Page() {

    const { user, isLoaded, isSignedIn } = useUser(); // Extract user data and loading states
    const supabase = createClient()

    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            fetchUserData();
        }
    }, [isLoaded, isSignedIn, user]);


    const setupChannel = async () => {
        const channel = supabase.channel('schema-db-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user'
            }, (payload) => console.log('User table change:', payload))
        return channel;
    }
    

    // Find user in the database
    const fetchUserData = async () => {
        try {
            const { data: userData, error: userError } = await supabase
                .from("user")
                .select("clerk_user_id")
                .eq('clerk_user_id', user.id)
                .limit(1);

            if (userError) throw new Error(userError.message);
            // If not found, insert data
            if (userData.length === 0) {
                const { error: insertUserError } = await supabase
                    .from("user")
                    .insert([{ clerk_user_id: user.id, name: user.firstName, email: user.primaryEmailAddress }]);

                if (insertUserError) {
                    return new Response("Error inserting User", { status: 404 });
                }

                console.log("User added");
            }

        } catch (error) {
            console.log('Error fetching or inserting user data')
        }
    }

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
                        href={`/communities/r/create`}>
                        Create A Community
                    </Link>
                </div>
            </div>

        </>
    )
}

