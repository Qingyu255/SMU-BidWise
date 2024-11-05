// SuggestSubreddits.tsx
'use client'
import React, { FC, useEffect, useState } from 'react';
import createClient from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowBigRight } from 'lucide-react'; // Import arrow icon

interface Subreddit {
    id: string;
    name: string;
    created_at: string;
}

const SuggestSubreddits: FC = () => {
    const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRandomSubreddits = async () => {
            setLoading(true);
            const supabase = createClient();

            try {
        // Fetch all subreddits explicitly defining the expected columns
        const { data: allSubreddits, error } = await supabase
          .from('subreddit')
          .select('id, name, created_at'); // Specify fields to match Subreddit interface

        if (error) throw error;

        // Validate the structure of the fetched data
        if (!Array.isArray(allSubreddits)) {
          throw new Error("Fetched data is not an array");
        }

        // Ensure that all items conform to the Subreddit interface
        const typedSubreddits: Subreddit[] = allSubreddits.map((subreddit) => {
          if (typeof subreddit.id !== 'string' || typeof subreddit.name !== 'string' || typeof subreddit.created_at !== 'string') {
            throw new Error("Fetched subreddit does not match Subreddit interface");
          }
          return {
            id: subreddit.id,
            name: subreddit.name,
            created_at: subreddit.created_at,
          };
        });

        // Randomly select 3 subreddits
        const shuffled = typedSubreddits.sort(() => 0.5 - Math.random());
        const selectedSubreddits = shuffled.slice(0, 3);

        setSubreddits(selectedSubreddits);
            } catch (error) {
                console.error('Error fetching subreddits:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRandomSubreddits();
    }, []);

    if (loading) {
        return <p className="text-center">Loading suggested subreddits...</p>;
    }


    return (
        <div className="space-y-6 p-4">
            <div className="text-center mb-4">
                <h2 className="text-xl font-semibold mb-2">Users like you also subscribe to:</h2>
            </div>

            {/* Display each subreddit as a clickable card */}
            {subreddits.map((subreddit) => (
                <Link key={subreddit.id} href={`/communities/r/${subreddit.name}`} className="hover:shadow-lg transition-shadow relative mb-4">
                    <Card className="cursor-pointer">
                        <CardHeader>
                            <CardTitle className="text-lg">r/{subreddit.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-zinc-500 mt-2">
                                Created {new Date(subreddit.created_at).toLocaleDateString()}
                            </p>
                            <div className="absolute bottom-4 right-4 flex items-center text-blue-600">
                                <span>Explore</span>
                                <ArrowBigRight className="ml-1 w-4 h-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export default SuggestSubreddits;