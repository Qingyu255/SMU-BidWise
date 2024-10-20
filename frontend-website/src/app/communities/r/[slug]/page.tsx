import { FC } from "react";
import createClient from '@/utils/supabase/server';
import { useUser } from '@clerk/clerk-react';
import { notFound } from 'next/navigation';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/comms_config";
import MiniCreatePost from "@/components/MiniCreatePost";

interface PageProps {
    params: {
        slug: string
    }
}

const page = async ({ params }: PageProps) => {
    const { slug } = params
    const supabase = createClient()

    const { user } = useUser();
    const userClerkId = user?.id

    const transformedUser = user
    ? {
        id: user.id,
        firstName: user.firstName,
        profileImageUrl: user.imageUrl,
      }
    : null;

    const { data: subreddit, error: subredditError } = await supabase
        .from('subreddit')
        .select('*') // Or specify columns you need
        .eq('name', slug)
        .single();

    if (subredditError || !subreddit) {
        return notFound(); // Handle not found case
    }

    // Step 2: Fetch related posts
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*, author(*), votes(*), comments(*), subreddit(*)') // Adjust this as per your schema
        .eq('subreddit_id', subreddit.id)
        .order('createdAt', { ascending: false })
        .limit(INFINITE_SCROLL_PAGINATION_RESULTS); // Adjust the pagination if necessary

    if (postsError) {
        console.error("Error fetching posts:", postsError);
        return new Response("Error fetching posts", { status: 500 });
    }

    // Combine subreddit and posts data to return
    return (<>
        <h1 className='font-bold text-3xl md:text-4xl h-14'>
            r/{subreddit.name}
        </h1>
        <MiniCreatePost user={transformedUser} />
        <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />
    </>);
}

export default page