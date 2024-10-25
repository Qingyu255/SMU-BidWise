"use client";

import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { useUser } from "@clerk/clerk-react";

interface SubscribeLeaveToggleProps {
    isSubscribed: boolean;
    subredditId: string;
    subredditName: string;
}

const SubscribeLeaveToggle: React.FC<SubscribeLeaveToggleProps> = ({ 
    isSubscribed: initialIsSubscribed, 
    subredditId, 
    subredditName 
}) => {
    const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
    const { user, isLoaded, isSignedIn } = useUser();
    const supabase = createClient();

    useEffect(() => {
        // Setup Supabase real-time subscription
        const setupChannel = async () => {
            const channel = supabase.channel('schema-subscription-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                }, (payload) => {
                    console.log('Subscription change:', payload);
                    // Update local state based on the change
                    if (payload.eventType === 'INSERT' && payload.new.clerk_user_id === user?.id) {
                        setIsSubscribed(true);
                    } else if (payload.eventType === 'DELETE' && payload.old.clerk_user_id === user?.id) {
                        setIsSubscribed(false);
                    }
                });

            // Start listening to the channel
            await channel.subscribe();
            return channel;
        };
    }, [isLoaded, isSignedIn, user, subredditId, supabase]);

    const handleSubscriptionToggle = async () => {
        if (!user?.id) {
            console.error("User is not signed in.");
            return;
        }

        try {
            if (isSubscribed) {
                // If the user is subscribed, remove the subscription
                const { error } = await supabase
                    .from("subscriptions")
                    .delete()
                    .eq("clerk_user_id", user.id)
                    .eq("subreddit_id", subredditId);

                if (error) {
                    throw new Error(error.message);
                }
                // Note: We don't need to setIsSubscribed here as it will be handled by the real-time subscription
                console.log(`Successfully unsubscribed from r/${subredditName}`);
            } else {
                // If the user is not subscribed, add the subscription
                const { error } = await supabase
                    .from("subscriptions")
                    .insert({
                        clerk_user_id: user.id,
                        subreddit_id: subredditId,
                    });

                if (error) {
                    throw new Error(error.message);
                }
                // Note: We don't need to setIsSubscribed here as it will be handled by the real-time subscription
                console.log(`Successfully subscribed to r/${subredditName}`);
            }
        } catch (error) {
            console.error("Error toggling subscription:", error);
        }
    };

    return (
        <button
            onClick={handleSubscriptionToggle}
            className={`w-full mt-4 px-4 py-2 text-white rounded ${
                isSubscribed 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-blue-500 hover:bg-blue-600"
            }`}
        >
            {isSubscribed ? "Leave" : "Join"}
        </button>
    );
};

export default SubscribeLeaveToggle;