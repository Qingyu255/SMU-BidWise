"use client"
import { SubredditValidator } from '@/lib/validators/subreddit';
import { z } from 'zod';
import createClient from '@/utils/supabase/server';
import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

const supabase = createClient()

export async function POST(req: Request) {
    try {
        // see if user is logged in -> return unique clerk id
        const userId = await useAuth(req)

        if (!userId) {
            // if user is not then unauthorised
            return new Response("Unauthorised", { status: 401 })
        }


        //add user into the database if havent 
        // find first
        const { data: userData, error: userError } = await supabase
            .from("user")
            .select("clerk_user_id") // Specify the columns you want to select
            .eq('clerk_user_id', userId) // Filter based on your condition
            .limit(1) // Limit results to 1
        //errors
        if (userError) {
            return new Response("Error fetching User", { status: 404 });
        }
        // if not found, insert data
        if (userData.length === 0) {
            const { isLoaded, isSignedIn, user } = useUser()

            if (isSignedIn && user) {
                const { data: insertUserData, error: insertUserError } = await supabase
                    .from("user")
                    .insert([{ clerk_user_id: userId, name: user.firstName, email: user.primaryEmailAddress }]); 
                    
                if (insertUserError) {
                    return new Response("Error fetching User", { status: 404 })
                }
            }

        }

        const body = await req.json()
        const { name } = SubredditValidator.parse(body)

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
        const subreddit = await supabase
            .from("subreddit")
            .insert([{name: name, creator_clerk: userId}]);

        const subredditId = supabase
            .from('subreddit')
            .select('id')
            .eq('name', name)
            .single()

        await supabase
            .from("subscription")
            .insert([{subreddit_id: subredditId, clerk_user_id: userId,  }]);

        return new Response(name)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 })
        }

        return new Response('Could not create Subreddit', {status:180})

    }

}