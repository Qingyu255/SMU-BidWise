// SubscriptionCount.tsx
"use client"; // Mark as a client component
import React, { useEffect, useState } from "react";
import createClient from "@/utils/supabase/client"; // Ensure this is your client-side supabase client

const POLLING_INTERVAL = 5000; // Polling interval in milliseconds

const SubscriptionCount = ({ subredditId }: { subredditId: string }) => {
    const [subscriptionCount, setSubscriptionCount] = useState(0);

    // Function to fetch the subscription count
    const fetchSubscriptionCount = async () => {
        const supabase = createClient(); // Initialize Supabase client
        const { count, error: countError } = await supabase
            .from("subscriptions")
            .select("clerk_user_id", { count: 'exact' })
            .eq("subreddit_id", subredditId);

        if (countError) {
            console.error(countError.message); // Handle error
            return;
        }

        setSubscriptionCount(count || 0);
    };

    // Fetch subscription count initially
    useEffect(() => {
        fetchSubscriptionCount(); // Fetch once on mount

        // Set up polling
        const interval = setInterval(fetchSubscriptionCount, POLLING_INTERVAL);
        return () => clearInterval(interval); // Cleanup on unmount
    }, [subredditId]);

    return <div>{subscriptionCount}</div>;
};

export default SubscriptionCount;
