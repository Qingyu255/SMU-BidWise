'use client';

import { formatTimeToNow } from '@/utils/utils';
import { FC, useState } from 'react';
import CommentVote from './CommentVote';
import { UserAvatar } from '../UserAvatar';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import createClient from '@/utils/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

// Define the types needed for comments and users
type User = {
    id: string;
    name: string | null;
    image: string | null;
};

type Comment = {
    id: string;
    text: string;
    createdAt: string; // Use the correct format based on your database
    author: User; // The author object
    replyToId?: string; // Optional for replies
};

type ExtendedComment = Comment & {
    votes: { user_clerk: string; type: number }[];
    replies: ExtendedComment[]; // Added replies property
};

interface PostCommentProps {
    comment: ExtendedComment;
    votesAmt: number; // Total votes count for the comment
    currentVote: { user_clerk: string; type: number } | undefined; // The current user's vote
    postId: string;
}

const PostComment: FC<PostCommentProps> = ({
    comment,
    votesAmt,
    currentVote,
    postId,
}) => {
    const { user } = useUser(); // Get the current user from Clerk
    const [isReplying, setIsReplying] = useState<boolean>(false);
    const [input, setInput] = useState<string>(`@${comment.author.name} `); // Pre-fill with the author's name
    const router = useRouter();
    const supabase = createClient();

    const handlePostComment = async () => {
        if (!user) return; // Ensure user is logged in

        const payload = {
            postId: postId,
            text: input,
            replyToId: comment.replyToId ?? comment.id, // Default to the current comment if replying
            author_clerk: user.id, // Get the user ID from Clerk
        };

        try {
            const { error } = await supabase
                .from('comment') // Adjust the table name if necessary
                .insert([{
                    post_id: payload.postId,
                    text: payload.text,
                    reply_to_id: payload.replyToId,
                    author_clerk: payload.author_clerk,
                }]);

            if (error) {
                throw new Error(error.message);
            }

            console.log('Comment posted successfully');
            setInput(''); // Clear the input after posting
            setIsReplying(false); // Close the reply input
            router.refresh(); // Refresh to see the new comment
        } catch (err) {
            console.error('Error posting comment:', err);
        }
    };

    return (
        <div className='flex flex-col mb-4'>
            <div className='flex items-center'>
                <UserAvatar
                    image={comment.author.image}
                    name={comment.author.name}
                    className='h-6 w-6'
                />
                <div className='ml-2 flex items-center gap-x-2'>
                    <p className='text-sm font-medium text-gray-900'>u/{comment.author.name}</p>
                    <p className='max-h-40 truncate text-xs text-zinc-500'>
                        {formatTimeToNow(new Date(comment.createdAt))}
                    </p>
                </div>
            </div>
    
            <p className='text-sm text-zinc-900 mt-2'>{comment.text}</p>
    
            <div className='flex gap-2 items-center mt-2'>
                <CommentVote
                    commentId={comment.id}
                    initialVotes={comment.votes}
                />
                <Button
                    onClick={() => {
                        if (!user) return router.push('/sign-in');
                        setIsReplying(true);
                    }}
                    variant='ghost'
                    size='sm'>
                    <MessageSquare className='h-4 w-4 mr-1.5' /> Reply
                </Button>
            </div>
    
            {isReplying && (
                <div className='grid w-full gap-1.5 mt-2'>
                    <Label htmlFor='reply'>Your reply</Label>
                    <div className='mt-2'>
                        <Textarea
                            autoFocus
                            id='reply'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={1}
                            placeholder='What are your thoughts?'
                            onFocus={(e) =>
                                e.currentTarget.setSelectionRange(
                                    e.currentTarget.value.length,
                                    e.currentTarget.value.length
                                )
                            }
                        />
                        <div className='mt-2 flex justify-end gap-2'>
                            <Button
                                variant='ghost'
                                onClick={() => setIsReplying(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handlePostComment}>
                                Post
                            </Button>
                        </div>
                    </div>
                </div>
            )}
    
            {comment.replies && comment.replies.length > 0 && (
                <div className='ml-4 mt-2'>
                    {comment.replies.map((reply: ExtendedComment) => (
                        <PostComment
                            key={reply.id}
                            comment={reply}
                            votesAmt={reply.votes.length}
                            currentVote={reply.votes.find(vote => vote.user_clerk === user?.id)}
                            postId={postId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostComment;
    
