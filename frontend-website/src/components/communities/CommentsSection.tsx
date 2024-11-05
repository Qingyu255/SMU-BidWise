'use client';

import { FC, useEffect, useState } from 'react';
import createClient from '@/utils/supabase/client';
import { useUser } from '@clerk/clerk-react';
import PostComment from './PostComment'; // Import the PostComment component
import CreateComment from './CreateComment'; // Import the CreateComment component

type User = {
    id: string;
    name: string | null;
    image: string | null;
    username: string;
};

type Comment = {
    id: string;
    text: string;
    createdAt: string;
    author: User;
    replyToId?: string;
};

type ExtendedComment = Comment & {
    votes: { user_clerk: string; type: number }[];
    replies: ExtendedComment[];
};

interface CommentSectionProps {
    postId: string;
}

const CommentSection: FC<CommentSectionProps> = ({ postId }) => {
    const { user } = useUser();
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
                votes: commentvotes ( user_clerk, type )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

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
                    replies: [],
                };
                commentsMap.set(extendedComment.id, extendedComment);
            });

            const extendedComments = Array.from(commentsMap.values()).map(comment => ({
                ...comment,
                replies: Array.from(commentsMap.values()).filter(reply => reply.replyToId === comment.id),
            })).filter(comment => !comment.replyToId);

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
        <div className="flex flex-col gap-y-4 mt-4 px-4">
            {/* Create Comment Section */}
            <CreateComment postId={postId} />
            <hr className="w-full h-px my-4" />
    
            {/* Comments Section */}
            <div className="flex flex-col gap-y-6">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="mb-2">
                            <PostComment
                                comment={comment}
                                votesAmt={comment.votes.length}
                                currentVote={comment.votes.find(vote => vote.user_clerk === user?.id)}
                                postId={postId}
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 italic mt-4">
                        *cricket noises* <br />
                        No comments yet...
                    </p>
                )}
            </div>
        </div>
    );
    
};

export default CommentSection;