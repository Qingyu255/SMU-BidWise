'use client';

import { FC, useEffect, useState } from 'react';
import createClient from '@/utils/supabase/client';
import { useUser } from '@clerk/clerk-react';
import PostComment from './PostComment'; // Import the PostComment component
import CreateComment from './CreateComment'; // Import the CreateComment component

// Define the types needed for comments and users
type User = {
    id: string;
    name: string | null;
    image: string | null;
    username: string;
};

type Comment = {
    id: string;
    text: string;
    createdAt: string; // Use the correct format based on your database
    author: User; // The author object
    replyToId?: string; // Optional for replies
};

type ExtendedComment = Comment & {
    votes: { user_clerk: string; type: number }[]; // Adjust based on your vote structure
    replies: ExtendedComment[]; // Add replies property
};

interface CommentSectionProps {
    postId: string; // The ID of the post for which comments are being fetched
}

const CommentSection: FC<CommentSectionProps> = ({ postId }) => {
    const { user } = useUser(); // Get the current user from Clerk
    const [comments, setComments] = useState<ExtendedComment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('comment')
            .select(`
                id,
                text,
                created_at,
                author_clerk,
                reply_to_id,
                author: user!author_clerk ( clerk_user_id, username, name, image ), 
                votes: commentvotes ( user_clerk, type )` // Adjust based on your schema
            )
            .eq('post_id', postId) // Fetch comments for the specified post
            .order('created_at', { ascending: false }); // Order by creation date
    
        if (error) {
            setError(error.message);
        } else {
            const commentsMap = new Map<string, ExtendedComment>();
            data.forEach((comment: any) => {
                const extendedComment: ExtendedComment = {
                    id: comment.id,
                    text: comment.text,
                    createdAt: comment.created_at,
                    author: comment.author,
                    replyToId: comment.reply_to_id,
                    votes: comment.votes || [],
                    replies: [], // Initialize replies as an empty array
                };
                commentsMap.set(extendedComment.id, extendedComment);
            });
    
            // Nest replies under their parent comment
            const extendedComments = Array.from(commentsMap.values()).map(comment => ({
                ...comment,
                replies: Array.from(commentsMap.values()).filter(reply => reply.replyToId === comment.id),
            })).filter(comment => !comment.replyToId); // Only return top-level comments
    
            setComments(extendedComments);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    if (loading) return <p>Loading comments...</p>;
    if (error) return <p>Error loading comments: {error}</p>;

    return (
        <div className='flex flex-col gap-y-4 mt-4 px-4'> {/* Added padding on left and right */}
            {/* Comments Section */}
            <div className='flex flex-col gap-y-6'>
                <hr className='w-full h-px my-4' />
    
                {comments.map((comment) => (
                    <div key={comment.id} className='mb-2'>
                        <PostComment
                            comment={comment}
                            votesAmt={comment.votes.length} // Total votes count for the comment
                            currentVote={comment.votes.find(vote => vote.user_clerk === user?.id)} // Current user's vote
                            postId={postId}
                        />
                    </div>
                ))}
            </div>
    
            {/* Create Comment Section */}
            <hr className='w-full h-px my-6' />
            <CreateComment postId={postId} />
        </div>
    );
    
    
};

export default CommentSection;
