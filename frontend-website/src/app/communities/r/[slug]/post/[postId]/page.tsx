'use client'
import createClient from "@/utils/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { FC, useEffect, useState } from "react";
import EditorOutput from "@/components/communities/EditorOutput";
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { ExtendedPost } from "../../../../../../../types";
import UpDownVote from "@/components/communities/UpDownVote";
import CommentsSection from "@/components/communities/CommentsSection";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Spinner } from "@nextui-org/react";

// Define your data interfaces with strict typing
interface PostData {
    id: string;
    title: string;
    content: string;
    created_at: string;
    subreddit_id: string;
    author_clerk: string;
}

interface SubredditData {
    id: string;
    name: string;
}

interface AuthorData {
    clerk_user_id: string;
    name: string | null;
}

interface VoteData {
    post_id: string;
    type: number;
    user_clerk: string;
}

interface PageProps {
    params: {
        postId: string;
    }
}

const Page: FC<PageProps> = ({ params }) => {
    const { postId } = params;
    // Type the Supabase client
    const supabase = createClient();
    const { user } = useUser();

    const [postData, setPostData] = useState<ExtendedPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSinglePostData = async (postId: string): Promise<ExtendedPost> => {
        // Type the database queries
        const { data: post, error: postError } = await supabase
            .from('post')
            .select('id, title, content, created_at, subreddit_id, author_clerk')
            .eq('id', postId)
            .single();

        if (postError || !post) {
            throw new Error(postError?.message || "Post not found");
        }

        const { data: subreddit, error: subredditError } = await supabase
            .from('subreddit')
            .select('id, name')
            .eq('id', post.subreddit_id as string)
            .single();

        if (subredditError || !subreddit) {
            throw new Error(subredditError?.message || "Subreddit not found");
        }

        const { data: author, error: authorError } = await supabase
            .from('user')
            .select('clerk_user_id, name')
            .eq('clerk_user_id', post.author_clerk as string)
            .single();

        if (authorError || !author) {
            throw new Error(authorError?.message || "Author not found");
        }

        // Fetch votes for the post
        const { data: votesData, error: votesError } = await supabase
            .from('vote')
            .select('post_id, type, user_clerk')
            .eq('post_id', postId);

        if (votesError) {
            throw new Error(votesError.message);
        }

        // Fetch comments for the post
        const { data: commentsData, error: commentsError } = await supabase
            .from('comment')
            .select('post_id, text')
            .eq('post_id', postId);

        if (commentsError) {
            throw new Error(commentsError.message);
        }
        // Ensure the votes are of type VoteData[]
        const votes: VoteData[] = (votesData || []).map(vote => ({
            post_id: vote.post_id as string,
            type: vote.type as number,
            user_clerk: vote.user_clerk as string,
        }));

        const comments = (commentsData || []).map(comment => ({
            post_id: comment.post_id as string,
            text: comment.text as string,
        }));

        // Create ExtendedPost object with proper typing
        const extendedPost: ExtendedPost = {
            id: post.id as string,
            title: post.title as string,
            content: post.content as string,
            created_at: post.created_at as string,
            subreddit_id: post.subreddit_id as string,
            author_clerk: post.author_clerk as string,
            author_name: author.name as string ?? 'Unknown',
            votes: votes || [],// Include votes in ExtendedPost,
            comments: comments || [], // Include comments in ExtendedPost[],
            subreddit_name: subreddit.name as string,
        };

        return extendedPost;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const post = await fetchSinglePostData(postId);
                setPostData(post);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [postId]);

    if (loading) return <div><Spinner/></div>;
    if (error) return <div>Error: {error}</div>;
    if (!postData) return <div>No post found</div>;

    return (
        <Card>
            {/* Post Content */}
            <CardContent className='px-6 py-4'>
                <div className='flex justify-between'>
                    <div className='w-0 flex-1'>
                        <div className='max-h-40 mt-1 text-xs text-gray-500'>
                            <Link
                                className='underline text-zinc-900 dark:text-gray-300 text-sm underline-offset-2'
                                href={`/communities/r/${postData.subreddit_name}`}>
                                r/{postData.subreddit_name}
                            </Link>
                            <span className='px-1'>•</span>
                            <span>Posted by u/{postData.author_name}</span>
                        </div>
                        <CardTitle className='text-lg font-semibold py-2 leading-6'>
                            {postData.title}
                        </CardTitle>
                        <div className='relative text-sm max-h-40 w-full overflow-clip'>
                            <EditorOutput content={postData.content} />
                        </div>
                    </div>
                    <UpDownVote postId={postData.id} initialVotes={postData.votes} />
                </div>
            </CardContent>
    
            {/* Comment Count Section */}
            <div className='bg-gray-50 dark:bg-zinc-900 z-20 text-sm px-4 py-4 sm:px-6'>
                <div className='w-fit flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' /> {postData.comments.length} comments
                </div>
            </div>
    
            {/* Comments Section */}
            <div className='px-6 py-4'>
                <CommentsSection postId={postData.id} />
            </div>
        </Card>
    );
    
}

export default Page;