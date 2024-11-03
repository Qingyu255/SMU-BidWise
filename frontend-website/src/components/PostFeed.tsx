'use client'
import { FC, useRef, useState, useEffect } from "react";
import { ExtendedPost } from "../../types";
import createClient from "@/utils/supabase/client";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { useUser } from "@clerk/clerk-react";
import { QueryFunction } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Post from "./Post";
import UpDownVote from "./UpDownVote";

interface PostFeedProps {
    subredditName: string;
    subredditId: string;
    loadMorePosts: () => void;
    isFetchingNextPage?: boolean; 
}

const PostFeed: FC<PostFeedProps> = ({ loadMorePosts, isFetchingNextPage, subredditId, subredditName }) => {
    const [posts, setPosts] = useState<ExtendedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMorePosts, setHasMorePosts] = useState(true); // New state to track if more posts are available
    const supabase = createClient();

    // Load initial posts when the component mounts
    useEffect(() => {
        const loadInitialPosts = async () => {
            setLoading(true);
            const { data: initialPosts, error } = await supabase
                .from('post')
                .select(`
                    id,
                    title,
                    content,
                    created_at,
                    subreddit_id,
                    author_clerk
                `)
                .eq('subreddit_id', subredditId)
                .order('created_at', { ascending: false })
                .range(0, INFINITE_SCROLL_PAGINATION_RESULTS - 1);

            if (error) {
                console.error('Error loading initial posts:', error);
                setLoading(false);
                return;
            }

            const authorIds = initialPosts.map(post => post.author_clerk);
            const { data: authors } = await supabase
                .from('user')
                .select('clerk_user_id, name')
                .in('clerk_user_id', authorIds);

            const postIds = initialPosts.map(post => post.id);
            const { data: votes } = await supabase
                .from('vote')
                .select('post_id, user_clerk, type')
                .in('post_id', postIds);

            const { data: comments } = await supabase
                .from('comment')
                .select('post_id, text')
                .in('post_id', postIds);

            const extendedPosts = initialPosts.map(post => {
                const author = authors?.find(user => user.clerk_user_id === post.author_clerk);
                const postVotes = votes?.filter(vote => vote.post_id === post.id) || [];
                const postComments = comments?.filter(comment => comment.post_id === post.id) || [];

                return {
                    ...post,
                    author_name: author ? author.name : 'Unknown',
                    votes: postVotes,
                    comments: postComments,
                } as ExtendedPost;
            });

            setPosts(extendedPosts);
            setLoading(false);
            setHasMorePosts(initialPosts.length === INFINITE_SCROLL_PAGINATION_RESULTS); // Check if there are more posts
        };

        loadInitialPosts();
    }, [subredditId, supabase]);

    const handleLoadMorePosts = async () => {
        const start = posts.length;
        const { data: newPosts, error } = await supabase
            .from('post')
            .select(`
                id,
                title,
                content,
                created_at,
                subreddit_id,
                author_clerk
            `)
            .eq('subreddit_id', subredditId)
            .order('created_at', { ascending: false })
            .range(start, start + INFINITE_SCROLL_PAGINATION_RESULTS - 1);

        if (error) {
            console.error('Error loading more posts:', error);
            return;
        }
        if (newPosts.length === 0) {
            setHasMorePosts(false); // No more posts to load
            return;
        }

        const authorIds = newPosts.map(post => post.author_clerk);
        const { data: authors } = await supabase
            .from('user')
            .select('clerk_user_id, name')
            .in('clerk_user_id', authorIds);

        const postIds = newPosts.map(post => post.id);
        const { data: votes } = await supabase
            .from('vote')
            .select('post_id, user_clerk, type')
            .in('post_id', postIds);

        const { data: comments } = await supabase
            .from('comment')
            .select('post_id, text')
            .in('post_id', postIds);

        const extendedPosts = newPosts.map(post => {
            const author = authors?.find(user => user.clerk_user_id === post.author_clerk);
            const postVotes = votes?.filter(vote => vote.post_id === post.id) || [];
            const postComments = comments?.filter(comment => comment.post_id === post.id) || [];

            return {
                ...post,
                author_name: author ? author.name : 'Unknown',
                votes: postVotes,
                comments: postComments,
            } as ExtendedPost;
        });

        setPosts(prevPosts => [...prevPosts, ...extendedPosts]);
    };

    return (
        <>
            {loading ? (
                <div className='flex justify-center'>
                    <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
                </div>
            ) : (
                <ul className='flex flex-col col-span-2 space-y-6'>
                    {posts.map((post) => (
                        <li key={post.id}>
                            <Post
                                post={post}
                                subredditName={subredditName}
                                commentAmt={post.comments.length}
                                votesAmt={post.votes.length} // Assuming you want to show the count of votes
                                currentVote={undefined} // Set the currentVote appropriately if needed
                            />
                        </li>
                    ))}

                      {/* Load more posts button */}
                    <li className='flex justify-center'>
                        {hasMorePosts ? (
                            <button onClick={handleLoadMorePosts} disabled={isFetchingNextPage}>
                                {isFetchingNextPage ? <Loader2 className='animate-spin' /> : 'Load More'}
                            </button>
                        ) : (
                            <button className='text-gray-500 cursor-not-allowed' disabled>
                                No More Posts to Share =(
                            </button>
                        )}
                        </li>
                    
                </ul>
            )}
        </>
    );
};

export default PostFeed;
