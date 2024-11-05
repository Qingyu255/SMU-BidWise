"use client"

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/toast'
import { Description } from '@radix-ui/react-toast'
import createClient from '@/utils/supabase/client'
import { useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'; // For navigation


const Page = () => {
    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<string | null>(null); // State for error message
    const supabase = createClient(); // Initialize Supabase client
    const { user, isLoaded, isSignedIn } = useUser(); // Extract user data and loading states
    const router = useRouter(); // Initialize the useRouter hook for navigation


    useEffect(() => {
        const setupChannel = async () => {
            const channel = supabase.channel('schema-db-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'user'
                }, (payload) => console.log('User table change:', payload))
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'subreddit',
                }, (payload) => console.log('Subreddit change:', payload))
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                }, (payload) => console.log('Subreddit subscribed:', payload))
                .subscribe((status) => {
                    console.log('Channel subscribed with status:', status);
                });
            return channel;
        }

        if (isLoaded && isSignedIn && user) {
            setupChannel(); // Setup channel when user is ready
        }
    }, [isLoaded, isSignedIn, user, supabase]);

    const handleSubmit = async () => {
        try {
            const subredditName = input.trim(); // Trim the input

            if (!subredditName) {
                setError('Subreddit name cannot be empty'); // Check for empty name
                return;
            }

            const { data: subredditData, error: subredditError } = await supabase
                .from("subreddit")
                .select("name")
                .eq('name', subredditName)
                .limit(1);

            if (subredditError) {
                setError("Error fetching subreddit: " + subredditError.message);
                return;
            }

            if (subredditData.length > 0) {
                setError('Subreddit already exists');
                return;
            }

            // Insert and create new subreddit 
            const { error: createSubredditError } = await supabase
                .from("subreddit")
                .insert([{ name: subredditName, creator_clerk: user?.id }]); // Ensure user.id is correct

            if (createSubredditError) {
                setError("Error creating subreddit: " + createSubredditError.message); // Improved error message
                return;
            }

            // Get the subreddit ID
            const { data: subredditIdData, error: idError } = await supabase
                .from('subreddit')
                .select('id')
                .eq('name', subredditName)
                .single();

            if (idError || !subredditIdData) {
                setError("Error retrieving subreddit ID: " + (idError?.message || "No data found"));
                return;
            }

            const subredditId = subredditIdData.id;

            // Insert into subscription
            const { error: subscriptionError } = await supabase
                .from("subscriptions")
                .insert([{ subreddit_id: subredditId, clerk_user_id: user?.id}]);

            if (subscriptionError) {
                console.error("Subscription Error:", subscriptionError); // Log the entire error object
                setError("Error subscribing to subreddit: " + (subscriptionError.message || JSON.stringify(subscriptionError))); // Improved error message
                return;
            }

            console.log(`Subreddit ${subredditName} created successfully with ID: ${subredditId}`);
            router.push(`/communities/r/${subredditName}`);

        } catch (err) {
            console.error('Error in handleSubmit:', err);
            if (err instanceof Error) {
                setError('An unexpected error occurred: ' + err.message); // Access message safely
            } else {
                setError('An unexpected error occurred'); // Generic fallback message
            }
        }
    };


    return (
        <div className='container flex items-center h-full max-w-3xl mx-auto'>
            <div className='relative bg-white w-full h-fit p-4 rounded-lg space-y-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-xl font-semibold'>Create a Community</h1>
                    <Button variant="ghost" onClick={() => router.push('/communities')}>Back</Button> {/* Back button */}
                </div>

                <hr className='bg-red-500 h-px' />
                <div>
                    <p className='text-lg font-medium'>Community Name</p>
                    <p className='text-xs pb-2'>Community name cannot be changed</p>

                    <div className='relative'>
                        <p className='absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400'>
                            r/
                        </p>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className='pl-6'
                        />
                    </div>
                    {error && <p className='text-red-500 text-sm'>{error}</p>}
                </div>
                <div className='flex justify-end gap-4'>
                    <Button variant='ghost' onClick={() => router.push('/communities')}>Cancel</Button>
                    <Button
                        disabled={input.length === 0}
                        onClick={handleSubmit}>
                        Create Community
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Page;
