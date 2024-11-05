import React from "react"
import createClient from "@/utils/supabase/server"
import SubredditStateWrapper from "@/components/communities/SubredditStateWrapper";
import { format } from 'date-fns'
import SubscriptionCount from "@/components/communities/SubscriptionCount";
import CreatePostButton from "@/components/communities/CreatePostButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { unslugify } from "@/utils/slugify";

const Layout = async (
    { children, params: { slug } }:
    {
        children: React.ReactNode,
        params: { slug: string }
    }
) => {
    const subredditName = unslugify(slug);
    const supabase = createClient();

    // Query the database with the original, unslugified name
    const { data: subredditData, error: subredditError } = await supabase
        .from("subreddit")
        .select("id, name, creator_clerk, created_at")
        .eq('name', subredditName) // Using unslugified name for database lookup
        .single();

    if (subredditError) {
        throw new Error(subredditError.message);
    }

    const subredditId = subredditData.id;
    const subredditCreatedDateTime = subredditData.created_at;
    const creatorId = subredditData.creator_clerk;

    // Fetch creator name
    const { data: creatorData, error: cError } = await supabase
        .from("user")
        .select("name")
        .eq('clerk_user_id', creatorId)
        .single();

    if (cError) {
        throw new Error(cError.message);
    }

    const creatorName = creatorData.name;

    return (
        <div className="sm:container max-w-7x1 mx-auto h-full pt-12">
            <div>
                <div className='flex items-center mb-4'>
                    <Link href="/communities" className="flex items-center text-blue-600 hover:underline">
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        <span>Return to Main Feed</span>
                    </Link>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
                    <ul className='flex flex-col col-span-2 space-y-6'>{children}</ul>

                    {/* Info Sidebar */}
                    <div className='hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
                        <div className='px-6 py-4'>
                            <p className='font-semibold py-3'>About r/{subredditName}</p>
                        </div>

                        <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
                            <div className='flex justify-between gap-x-4 py-3'>
                                <dt className='text-gray-500'>Created</dt>
                                <dd className='text-gray-700'>
                                    <time dateTime={subredditCreatedDateTime}>
                                        {format(new Date(subredditCreatedDateTime), 'MMMM d, yyyy')}
                                    </time>
                                </dd>
                            </div>

                            <div className='flex justify-between gap-x-4 py-3'>
                                <dt className='text-gray-500'>Members</dt>
                                <dd className='flex items-start gap-x-2'>
                                    <SubscriptionCount subredditId={subredditId} />
                                </dd>
                            </div>

                            <div className='flex justify-between gap-x-4 py-3'>
                                <dt className='text-gray-500'>Created by: {creatorName}</dt>
                            </div>

                            <SubredditStateWrapper
                                subredditId={subredditId}
                                subredditName={subredditName}
                                slug={slug}
                            />

                            <CreatePostButton slug={subredditName} />
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
