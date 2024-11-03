// CheckSubscription.tsx
"use client";

import React, { useEffect, useState } from "react";
import createClient from "@/utils/supabase/client"; // Ensure you have a Supabase client set up
import { useUser } from "@clerk/clerk-react"; // Assuming you're using Clerk for user management

interface CheckSubscriptionProps {
    subredditId: string; // Prop to receive subreddit name
    onCheckComplete: (isSubscribed: boolean) => void; // Callback to return subscription status
}

const CheckSubscription: React.FC<CheckSubscriptionProps> = ({ subredditId, onCheckComplete }) => {
    const { user } = useUser(); // Get user information
    const supabase = createClient(); // Initialize Supabase client

    useEffect(() => {
        const checkSubscription = async () => {
            if (!user?.id) {
                console.error("User is not signed in.");
                onCheckComplete(false); // Return false if user is not signed in
                return;
            }

            try {
                // Check if the user is subscribed to the subreddit
                const { data, error } = await supabase
                    .from("subscriptions")
                    .select("id")
                    .eq("clerk_user_id", user.id) // Assuming user_id is stored in subscriptions
                    .eq("subreddit_id", subredditId) // Match by subreddit name
                    .single(); // Fetch a single record

                if (error) {
                    throw new Error(error.message); // Handle any errors
                }

                onCheckComplete(!!data); // Return true if data exists, false otherwise
            } catch (error) {
                console.error("Error fetching subscription status:", error);
                onCheckComplete(false); // Return false on error
            }
        };

        checkSubscription(); // Call the function to check subscription
    }, [user, subredditId, supabase, onCheckComplete]); // Dependencies

    return null; // No UI to render, as we are only returning the status
};

export default CheckSubscription;