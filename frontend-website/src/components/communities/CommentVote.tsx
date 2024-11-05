import { useEffect, useState } from 'react';
import createClient from "@/utils/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentVoteProps {
    commentId: string;
    initialVotes: { user_clerk: string; type: number }[];
}

const CommentVote = ({ commentId, initialVotes = [] }: CommentVoteProps) => {
    const { user } = useUser();
    const supabase = createClient();
    const [votes, setVotes] = useState<{ user_clerk: string; type: number }[]>(initialVotes);

    // Determine if user has voted and retrieve their vote type
    const userVote = votes.find(vote => vote.user_clerk === user?.id)?.type;

    // Calculate the total votes; ensure no NaN by setting a default value of 0
    const totalVotes = votes.reduce((acc, vote) => acc + vote.type, 0) || 0;

    useEffect(() => {
        // Set up a real-time channel specific to this comment's votes
        const channel = supabase.channel(`commentvotes-${commentId}-changes`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'commentvotes',
                filter: `comment_id=eq.${commentId}`
            }, (payload) => {
                console.log(`CommentVotes for ${commentId} changed:`, payload);
                const newVote = payload.new as { user_clerk: string; type: number };

                // Update local state with the new vote
                setVotes(prevVotes => {
                    const updatedVotes = prevVotes.filter(vote => vote.user_clerk !== newVote.user_clerk);
                    return [...updatedVotes, newVote];
                });
            })
            .subscribe();

        // Clean up subscription on component unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, commentId]);

    const handleVote = async (type: number) => {
        if (!user) return;

        const userId = user.id;
        const existingVote = votes.find(vote => vote.user_clerk === userId);

        if (existingVote) {
            const newType = existingVote.type === type ? 0 : type;
            const { error } = await supabase
                .from('commentvotes')
                .update({ type: newType })
                .match({ comment_id: commentId, user_clerk: userId });

            if (error) {
                console.error('Error updating vote:', error);
            } else {
                setVotes(prevVotes =>
                    prevVotes.map(vote =>
                        vote.user_clerk === userId ? { ...vote, type: newType } : vote
                    )
                );
            }
        } else {
            const { error } = await supabase
                .from('commentvotes')
                .insert([{ comment_id: commentId, type, user_clerk: userId }]);

            if (error) {
                console.error('Error adding vote:', error);
            } else {
                setVotes(prevVotes => [...prevVotes, { user_clerk: userId, type }]);
            }
        }
    };

    return (
        <div className="flex items-center">
            <button
                onClick={() => handleVote(1)}
                disabled={!user}
                className={cn("flex items-center justify-center w-10 h-10 transition-all duration-200 bg-transparent outline-none", {
                    'cursor-pointer': user,
                    'cursor-default': !user
                })}
                aria-label="Upvote"
            >
                <ArrowBigUp
                    className={cn('h-5 w-5 text-zinc-700 hover:bg-gray-100 dark:hover:bg-gray-400 rounded-md', {
                        'text-emerald-500 fill-emerald-500': userVote === 1,
                    })}
                />
            </button>
            <span className="mx-2 text-gray-700">{totalVotes}</span>
            <button
                onClick={() => handleVote(-1)}
                disabled={!user}
                className={cn("flex items-center justify-center w-10 h-10 transition-all duration-200 bg-transparent outline-none", {
                    'cursor-pointer': user,
                    'cursor-default': !user
                })}
                aria-label="Downvote"
            >
                <ArrowBigDown
                    className={cn('h-5 w-5 text-zinc-700 hover:bg-gray-100 dark:hover:bg-gray-400 rounded-md', {
                        'text-red-500 fill-red-500': userVote === -1,
                    })}
                />
            </button>
        </div>
    );
};

export default CommentVote;
