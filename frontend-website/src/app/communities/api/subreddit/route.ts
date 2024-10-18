"use client"
import { SubredditValidator } from '@/lib/validators/subreddit';
import { z } from 'zod';
import createClient from '@/utils/supabase/server';
import React from 'react';
import { useUser } from '@clerk/clerk-react';


const supabase = createClient()

export async function POST(req: Request) {
    try {
        // see if user is logged in -> return unique clerk id
        const { user } = useUser();
        const userClerkId = user?.id

        if (!userClerkId) {
            // if user is not then unauthorised
            return new Response("Unauthorised", { status: 401 })
        }

        // find user in database
        const { data: userData, error: userError } = await supabase
            .from("user")
            .select("clerk_user_id") // Specify the columns you want to select
            .eq('clerk_user_id', userClerkId) // Filter based on your condition
            .limit(1) // Limit results to 1
        //errors
        if (userError) {
            return new Response("Error fetching User", { status: 404 });
        }
        // if not found, insert data
        if (userData.length === 0) {
            const { data: insertUserData, error: insertUserError } = await supabase
                .from("user")
                .insert([{ clerk_user_id: userClerkId, name: user.firstName, email: user.primaryEmailAddress }]);
            console.log("User added")

            if (insertUserError) {
                return new Response("Error fetching User", { status: 404 })
            }
        }

        //subreddit creation
        const body = await req.json()
        const { name } = SubredditValidator.parse(body)

        //check if subreddit already exist
        const { data: subredditData, error: subredditError } = await supabase
            .from("subreddit")
            .select("name") // Specify the columns you want to select
            .eq('name', name) // Filter based on your condition
            .limit(1) // Limit results to 1

        if (subredditError) {
            return new Response("Error fetching subreddit:", { status: 404 });
        }
        if (subredditData.length > 0) {
            return new Response('Subreddit already exists', { status: 409 });
        }

        // insert and create new subreddit 
        const { data: newSubreddit, error: createSubredditError } = await supabase
            .from("subreddit")
            .insert([{ name: name, creator_clerk: userClerkId }]);

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
            .insert([{ subreddit_id: subredditId, clerk_user_id: userClerkId }]);

        if (subscriptionError) {
            return new Response("Error subscribing to subreddit", { status: 500 });
        }

        return new Response(`Subreddit ${name} created successfully`, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 });
        }
        return new Response('Could not create Subreddit', { status: 500 });
    }
}