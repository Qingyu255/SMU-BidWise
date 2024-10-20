import { SubredditValidator } from '@/lib/validators/subreddit';
import { z } from 'zod';
import createClient from '@/utils/supabase/server';
import { clerkClient, getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'; // Ensure you're using this import


const supabase = createClient()

// Move channel subscription into a separate function
async function setupChannel() {
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

// Call the setupChannel function to initialize
setupChannel().catch(err => console.error("Error setting up channel:", err));

export async function POST(req: Request) {
    console.log("Received a Post request");
    console.log("it work")
    try {
        const { userId } = getAuth(req);
        const user = userId ? await clerkClient.users.getUser(userId) : null;

        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const firstName = user.firstName; 
        const primaryEmailAddress = user.emailAddresses[0]?.emailAddress; 

        console.log("User Info: ", { firstName, primaryEmailAddress });

        // Find user in the database
        const { data: userData, error: userError } = await supabase
            .from("user")
            .select("clerk_user_id")
            .eq('clerk_user_id', userId)
            .limit(1);

        if (userError) {
            return new Response("Error fetching User", { status: 404 });
        }

        // If not found, insert data
        if (userData.length === 0) {
            const { error: insertUserError } = await supabase
                .from("user")
                .insert([{ clerk_user_id: userId, name: firstName, email: primaryEmailAddress }]);

            if (insertUserError) {
                return new Response("Error inserting User", { status: 404 });
            }

            console.log("User added");
        }

        // Subreddit creation
        const body = await req.json();
        console.log("Request body", body);
        const { name } = SubredditValidator.parse(body);

        // Check if subreddit already exists
        const { data: subredditData, error: subredditError } = await supabase
            .from("subreddit")
            .select("name")
            .eq('name', name)
            .limit(1);

        if (subredditError) {
            return new Response("Error fetching subreddit:", { status: 404 });
        }

        if (subredditData.length > 0) {
            return new Response('Subreddit already exists', { status: 409 });
        }

        // Insert and create new subreddit 
        const { error: createSubredditError } = await supabase
            .from("subreddit")
            .insert([{ name: name, creator_clerk: userId }]);

        if (createSubredditError) {
            return new Response("Error creating subreddit", { status: 500 });
        }

        // Get the subreddit ID
        const { data: subredditIdData, error: idError } = await supabase
            .from('subreddit')
            .select('id')
            .eq('name', name)
            .single();

        if (idError || !subredditIdData) {
            return new Response("Error retrieving subreddit ID", { status: 500 });
        }

        const subredditId = subredditIdData.id;

        // Insert into subscription
        const { error: subscriptionError } = await supabase
            .from("subscription")
            .insert([{ subreddit_id: subredditId, clerk_user_id: userId }]);

        if (subscriptionError) {
            return new Response("Error subscribing to subreddit", { status: 500 });
        }

        return NextResponse.json({ message: `Subreddit ${name} created successfully`, subredditId }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 });
        }
        console.error('Unexpected error:', error);
        return new Response('Could not create Subreddit', { status: 500 });
    }
}

// // export async function POST(req: Request) {
// //     console.log("Received a Post request");
// //     try {
// //         // see if user is logged in -> return unique clerk id
// //          // Get the auth object
// //          const { userId } = getAuth(req);

// //          // Fetch user details from Clerk
// //          const user = userId ? await clerkClient.users.getUser(userId) : null;
 
// //          if (!user) {
// //              return new Response("Unauthorized", { status: 401 });
// //          }
 
// //          // Access user's firstName and primaryEmailAddress
// //          const firstName = user.firstName; 
// //          const primaryEmailAddress = user.emailAddresses[0]?.emailAddress; 
 
// //          // Log the user info
// //          console.log("User Info: ", { firstName, primaryEmailAddress });
 
// //         // find user in database
// //         const { data: userData, error: userError } = await supabase
// //             .from("user")
// //             .select("clerk_user_id") // Specify the columns you want to select
// //             .eq('clerk_user_id', userId) // Filter based on your condition
// //             .limit(1) // Limit results to 1
// //         //errors
// //         if (userError) {
// //             return new Response("Error fetching User", { status: 404 });
// //         }
// //         // if not found, insert data
// //         if (userData.length === 0) {
// //             const { data: insertUserData, error: insertUserError } = await supabase
// //                 .from("user")
// //                 .insert([{ clerk_user_id: userId, name: user.firstName, email: user.primaryEmailAddress }]);
// //             console.log("User added")

// //             if (insertUserError) {
// //                 return new Response("Error fetching User", { status: 404 })
// //             }
// //         }

// //         //subreddit creation
// //         const body = await req.json();
// //         console.log("Request body", body);
// //         const { name } = SubredditValidator.parse(body)
// //         // NextResponse.json({ message: 'Subreddit created', name }, { status: 201 });

// //         //check if subreddit already exist
// //         const { data: subredditData, error: subredditError } = await supabase
// //             .from("subreddit")
// //             .select("name") // Specify the columns you want to select
// //             .eq('name', name) // Filter based on your condition
// //             .limit(1) // Limit results to 1

// //         if (subredditError) {
// //             return new Response("Error fetching subreddit:", { status: 404 });
// //         }
// //         if (subredditData.length > 0) {
// //             return new Response('Subreddit already exists', { status: 409 });
// //         }

// //         // insert and create new subreddit 
// //         const { data: newSubreddit, error: createSubredditError } = await supabase
// //             .from("subreddit")
// //             .insert([{ name: name, creator_clerk: userId }]);

// //         if (createSubredditError) {
// //             return new Response("Error creating subreddit", { status: 500 });
// //         }

// //         // Get the subreddit ID
// //         const { data: subredditIdData, error: idError } = await supabase
// //             .from('subreddit')
// //             .select('id')
// //             .eq('name', name)
// //             .single();

// //         if (idError || !subredditIdData) {
// //             return new Response("Error retrieving subreddit ID", { status: 500 });
// //         }

// //         const subredditId = subredditIdData.id;

// //         // Insert into subscription
// //         const { error: subscriptionError } = await supabase
// //             .from("subscription")
// //             .insert([{ subreddit_id: subredditId, clerk_user_id: userId }]);

// //         if (subscriptionError) {
// //             return new Response("Error subscribing to subreddit", { status: 500 });
// //         }

// //         return NextResponse.json({ message: `Subreddit ${name} created successfully`, subredditId }, { status: 201 });

// //     } catch (error) {
// //         if (error instanceof z.ZodError) {
// //             return new Response(error.message, { status: 422 });
// //         }
// //         return new Response('Could not create Subreddit', { status: 500 });
// //     }
    
// // }