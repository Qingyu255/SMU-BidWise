"use client"

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/toast'
import { Description } from '@radix-ui/react-toast'
import createClient from '@/utils/supabase/client'
import { useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'


const Page = () => {
    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<string | null>(null); // State for error message
    const supabase = createClient(); // Initialize Supabase client
    const { user, isLoaded, isSignedIn } = useUser(); // Extract user data and loading states

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
                    table: 'subscription',
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
                .insert([{ name: subredditName, creator_clerk: user.id }]); // Ensure user.id is correct

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

            //get user id
            const { data: userData, error: userError } = await supabase
                .from('user')
                .select('id')
                .eq('clerk_user_id', subredditName)
                .single();

            if (userError || !userData) {
                setError("Error retrieving subreddit ID: " + (userError?.message || "No data found"));
                return;
            }
            const userID = userData.id;
            const subredditId = subredditIdData.id;

            // Insert into subscription
            const { error: subscriptionError } = await supabase
                .from("subscription")
                .insert([{ subreddit_id: subredditId, clerk_user_id: user.id, user_id: userID }]);

            if (subscriptionError) {
                console.error("Subscription Error:", subscriptionError); // Log the entire error object
                setError("Error subscribing to subreddit: " + (subscriptionError.message || JSON.stringify(subscriptionError))); // Improved error message
                return;
            }

            console.log(`Subreddit ${subredditName} created successfully with ID: ${subredditId}`);

        } catch (err) {
            console.error('Error in handleSubmit:', err);
            setError('An unexpected error occurred: ' + err.message); // Improved error reporting
        }
    };


    return (
        <div className='container flex items-center h-full max-w-3xl mx-auto'>
            <div className='relative bg-white w-full h-fit p-4 rounded-lg space-y-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-xl font-semibold'>Create a Community</h1>
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
                    <Button variant='ghost' onClick={() => setInput('')}>Cancel</Button>
                    <Button
                        disabled={input.length === 0}
                        onClick={handleSubmit}>
                        Create Community
                    </Button>
                </div>
            </div>
        </div>);
}


export default Page


// const [input, setInput] = useState<string>('')
// const router = useRouter()

// const mutation = useMutation({
//     mutationFn: async () => {
//         const payload = {
//             name: input.trim(), // Trim whitespace from input
//         };

//         const response = await fetch('/api/communities/subreddit', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload),
//         });

//         if (!response.ok) {
//             const errorData = await response.json(); // Parse the response to get the error message
//             throw new Error(errorData.message || 'Network response was not ok');
//         }

//         return response.json();
//     },
//     onError: (err) => {
//         const message = err.message;
//         Toast({
//             title: 'Error',
//             children: 'does not work',
//             variant: 'destructive',
//         });
//     },
//     onSuccess: (data) => {
//         console.log('Subreddit created:', data);
//         router.replace(`/communities/r/${data.name}`); // Use replace instead of push
//     }
// });

// const isLoading = mutation.status === 'pending'; // Get loading status from mutation