import React from "react"
import Link from "next/link";
import createClient from "@/utils/supabase/server"
import SubredditStateWrapper from "@/components/SubredditStateWrapper";
import { format } from 'date-fns'
import { buttonVariants } from "@/components/ui/button";

const Layout = async (
    { children,
        params: { slug }, }:
        {
            children: React.ReactNode
            params: { slug: String }
        }) => {

    const subredditName = slug
    const supabase = createClient(); // Initialize Supabase client
    // Get subreddit data
    const { data: subredditData, error: subredditError } = await supabase
        .from("subreddit")
        .select("id, name, creator_clerk, created_at") // Fetch both id and name
        .eq('name', subredditName) // Query by name instead of ID
        .single(); // Expect a single result

    // Check for errors when fetching subreddit details
    if (subredditError) {
        throw new Error(subredditError.message); // Handle error
    }

    const subredditId = subredditData.id;
    const subredditCreatedDateTime = subredditData.created_at
    const creatorId = subredditData.creator_clerk;

    // get creator name
    const { data: creatorData, error: cError } = await supabase
        .from("user")
        .select("name") // Fetch both id and name
        .eq('clerk_user_id', creatorId) // Query by name instead of ID
        .single(); // Expect a single result

    // Check for errors when fetching subreddit details
    if (cError) {
        throw new Error(cError.message); // Handle error
    }
    //created by: 
    const creatorName = creatorData.name;

    // count of members subscribed
    const { count, error: countError } = await supabase
        .from("subscriptions")
        .select("clerk_user_id", { count: 'exact' }) // Use 'exact' to get the precise count
        .eq("subreddit_id", subredditId) // Filter by subreddit_id

    // Check for errors
    if (countError) {
        throw new Error(countError.message); // Handle error
    }
    const subscriptionCount = count || 0;

    return (<div className="sm:container max-w-7x1 mx-auto h-full pt-12">
        <div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
                <ul className='flex flex-col col-span-2 space-y-6'>{children}</ul>

                {/* info side bar */}
                <div className='hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
                    <div className='px-6 py-4'>
                        <p className='font-semibold py-3'>About r/{subredditName}</p>
                    </div>

                    <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                        <div className='flex justify-between gap-x-4 py-3'>
                            <dt className='text-gray-500'>Created</dt>
                            <dd className='text-gray-700'>
                                <time dateTime={subredditCreatedDateTime}>
                                    {format(subredditCreatedDateTime, 'MMMM d, yyyy')}
                                </time>
                            </dd>
                        </div>

                        <div className='flex justify-between gap-x-4 py-3'>
                            <dt className='text-gray-500'>Members</dt>
                            <dd className='flex items-start gap-x-2'>
                                <div className='text-gray-900'>{subscriptionCount}</div>
                            </dd>
                        </div>
                        <div className='flex justify-between gap-x-4 py-3'>
                            <dt className='text-gray-500'>Created by: {creatorName}</dt>
                        </div>

                        <SubredditStateWrapper
                            subredditId={subredditId}
                            subredditName={subredditName.toString()}
                            slug={slug.toString()}
                        />
                        {/* Create post link */}
                        <Link
                            className={buttonVariants({
                                variant: 'outline',
                                className: 'w-full mb-6',
                            })}
                            href={`/r/${slug}/submit`}>
                            Create Post
                        </Link>
                    </dl>
                </div>
            </div>
        </div>
    </div >
    )
}

export default Layout