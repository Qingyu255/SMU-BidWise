'use client'
import React, { useEffect, useState } from "react";
import MiniCreatePost from "@/components/communities/MiniCreatePost";
import { Button } from "@/components/ui/button";
import createClient from '@/utils/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { unslugify } from "@/utils/slugify";

interface PageProps {
    params: {
        slug: string;
    };
}

const Page: React.FC<PageProps> = ({ params }) => {
    const subredditName = unslugify(params.slug)
    const { user } = useUser();
    const [subredditId, setSubredditId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: subredditData, error: srError } = await supabase
                .from("subreddit")
                .select("id")
                .eq('name', subredditName)
                .single();

            if (srError || !subredditData) {
                return notFound();
            }

            setSubredditId(subredditData.id as string);
            setLoading(false);
        };

        fetchData();
    }, [subredditName]);

    if (loading) return <p>Loading...</p>;

    // Handle cancel action
    const handleCancel = () => {
        // Logic to handle cancellation (e.g., navigating away, clearing form, etc.)
        // For example, you could redirect the user back to the subreddit:
        window.history.back(); // This goes back to the previous page
    };

    return (
        <div className='flex flex-col items-start gap-6'>
            {/* heading */}
            <div className='border-b border-gray-200 pb-5'>
                <div className='-ml-2 -mt-2 flex flex-wrap items-baseline'>
                    <h3 className='ml-2 mt-2 text-base font-semibold leading-6'>
                        Create Post
                    </h3>
                    <p className='ml-2 mt-1 truncate text-sm text-gray-500'>
                        in r/{subredditName}
                    </p>
                </div>
            </div>

            {/* Editor component (commented out if needed) */}
            <Editor subredditId={subredditId as string} subredditName={subredditName} />


            <div className='w-full flex justify-end gap-4'>
                <Button type='button' className='w-full bg-gray-200 text-gray-700 hover:bg-gray-300' onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type='submit' className='w-full' form='subreddit-post-form'>
                    Post
                </Button>
            </div>
        </div>
    );
};

export default Page;
