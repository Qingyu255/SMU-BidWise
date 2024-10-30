'use client';
import { useEffect, useState } from 'react';
import createClient from "@/utils/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { ArrowUp, ArrowDown } from 'lucide-react'; // Import the arrow icons

interface UpDownVoteProps {
    postId: string; // The ID of the post being voted on
    initialVotes: { user_clerk: string; type: number }[]; // Initial votes data for the post
}

const UpDownVote = ({ postId, initialVotes = [] }: UpDownVoteProps) => {
    const { user } = useUser(); // Get the current user
    const supabase = createClient();
    const [votes, setVotes] = useState(initialVotes);
    const hasVoted = votes.some(vote => vote.user_clerk === user?.id); // Check if user has voted

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
            <button
                onClick={() => handleVote(1)}
                disabled={hasVoted} // Disable if already voted
                className={`text-green-500 ${hasVoted ? 'opacity-50' : ''}`}
                aria-label="Upvote" // Accessibility label
            >
                <ArrowUp className="h-5 w-5" /> {/* Green up arrow */}
            </button>
            <span className="mx-2 text-gray-700">{totalVotes}</span> {/* Display total votes */}
            <button
                onClick={() => handleVote(-1)}
                disabled={hasVoted} // Disable if already voted
                className={`text-red-500 ${hasVoted ? 'opacity-50' : ''}`}
                aria-label="Downvote" // Accessibility label
            >
                <ArrowDown className="h-5 w-5" /> {/* Red down arrow */}
            </button>
        </div>
    );
};

export default UpDownVote;
