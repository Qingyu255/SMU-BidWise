'use client';
import { useEffect, useState } from 'react';
import createClient from "@/utils/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'; // Import the arrow icons
import { cn } from '@/lib/utils'
import { Button } from './ui/button';

interface UpDownVoteProps {
    postId: string; // The ID of the post being voted on
    initialVotes: { user_clerk: string; type: number }[]; // Initial votes data for the post
}

const UpDownVote = ({ postId, initialVotes = [] }: UpDownVoteProps) => {
    const { user } = useUser(); // Get the current user
    const supabase = createClient();
    const [votes, setVotes] = useState(initialVotes);
    const hasVoted = votes.some(vote => vote.user_clerk === user?.id); // Check if user has voted
    const userVote = votes.find(vote => vote.user_clerk === user?.id)?.type; // Get the type of user's vote

    useEffect(() => {
        // Set up channel for real-time updates
        const channel = supabase.channel('schema-vote-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'vote'
            }, (payload) => {
                console.log('Votes changed:', payload);
                // Optionally update local state here if needed
            })
            .subscribe();

        // Clean up the subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const handleVote = async (type: number) => {
        if (hasVoted || !user) return; // Prevent voting if already voted or user is not logged in

        const userId = user.id; // Safely use user.id after checking if user is defined

        const { data, error } = await supabase
            .from('vote')
            .insert([{ post_id: postId, type, user_clerk: userId }]); // Use userId safely

        if (error) {
            console.error('Error adding vote:', error);
        } else {
            console.log('Vote added:', data);
            setVotes(prevVotes => [...prevVotes, { user_clerk: userId, type }]); // This should now work correctly
        }
    };

    // Calculate the total votes
    const totalVotes = votes.reduce((acc, vote) => acc + vote.type, 0);

    return (
        <div className="flex items-center">
            {/* Upvote Button */}
            <button
                onClick={() => handleVote(1)}
                disabled={hasVoted && userVote !== undefined} // Disable if already voted
                className="flex items-center justify-center w-10 h-10 transition-all duration-200 bg-transparent outline-none" // Transparent background and no outline
                aria-label="Upvote" // Accessibility label
            >
                <ArrowBigUp
                    className={cn('h-5 w-5 text-zinc-700', {
                        'text-emerald-500 fill-emerald-500': userVote === 1, // Green fill if voted up
                    })} // Styling based on userVote
                />
            </button>

            {/* Total Votes Display */}
            <span className="mx-2 text-gray-700">{totalVotes}</span> {/* Display total votes */}

            {/* Downvote Button */}
            <button
                onClick={() => handleVote(-1)}
                disabled={hasVoted && userVote !== undefined} // Disable if already voted
                className="flex items-center justify-center w-10 h-10 transition-all duration-200 bg-transparent outline-none" // Transparent background and no outline
                aria-label="Downvote" // Accessibility label
            >
                <ArrowBigDown
                    className={cn('h-5 w-5 text-zinc-700', {
                        'text-red-500 fill-red-500': userVote === -1, // Red fill if voted down
                    })} // Styling based on userVote
                />
            </button>
        </div>
    );
};

export default UpDownVote;
