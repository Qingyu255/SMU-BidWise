'use client';
import { useEffect, useState } from 'react';
import createClient from "@/utils/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpDownVoteProps {
    postId: string;
    initialVotes: { user_clerk: string; type: number }[];
}

const UpDownVote = ({ postId, initialVotes = [] }: UpDownVoteProps) => {
    const { user } = useUser();
    const supabase = createClient();
    const [votes, setVotes] = useState(initialVotes);

    // Determine if user has voted and retrieve their vote type
    const userVote = votes.find(vote => vote.user_clerk === user?.id)?.type;

    // Calculate the total votes
    const totalVotes = votes.reduce((acc, vote) => acc + vote.type, 0);

    useEffect(() => {
        // Set up channel for real-time updates
        const channel = supabase.channel('schema-vote-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'vote'
            }, (payload) => {
                console.log('Votes changed:', payload);
                // Optional: Update local state for real-time updates
            })
            .subscribe();

        // Clean up subscription on component unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const handleVote = async (type: number) => {
        if (!user) return;
    
        const userId = user.id;
        const existingVote = votes.find(vote => vote.user_clerk === userId);
    
        if (existingVote) {
            if (existingVote.type === type) {
                // Nullify vote by setting it to 0 if clicking the same type
                const { error } = await supabase
                    .from('vote')
                    .update({ type: 0 })
                    .match({ post_id: postId, user_clerk: userId });
    
                if (error) {
                    console.error('Error nullifying vote:', error);
                } else {
                    // Update local state to reflect vote removal
                    setVotes(prevVotes =>
                        prevVotes.map(vote =>
                            vote.user_clerk === userId ? { ...vote, type: 0 } : vote
                        )
                    );
                }
            } else {
                // Change the vote type
                const { error } = await supabase
                    .from('vote')
                    .update({ type })
                    .match({ post_id: postId, user_clerk: userId });
    
                if (error) {
                    console.error('Error updating vote:', error);
                } else {
                    // Update local state to reflect the new vote type
                    setVotes(prevVotes =>
                        prevVotes.map(vote =>
                            vote.user_clerk === userId ? { ...vote, type } : vote
                        )
                    );
                }
            }
        } else {
            // Add a new vote
            const { error } = await supabase
                .from('vote')
                .insert([{ post_id: postId, type, user_clerk: userId }]);
    
            if (error) {
                console.error('Error adding vote:', error);
            } else {
                // Add new vote to local state
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

            {/* Display total vote count */}
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

export default UpDownVote;
