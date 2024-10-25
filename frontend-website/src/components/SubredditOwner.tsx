'use client'
import React, { useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { useUser } from "@clerk/clerk-react";

interface SubredditOwnerProps {
    subredditId: string;
    onCheckComplete: (isOwner: boolean) => void;
}

const SubredditOwner: React.FC<SubredditOwnerProps> = ({ subredditId, onCheckComplete }) => {
    const { user } = useUser();
    const supabase = createClient();

    useEffect(() => {
        const checkOwnership = async () => {
            if (!user?.id) {
                onCheckComplete(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("subreddit")
                    .select("creator_clerk")
                    .eq("id", subredditId)
                    .single();

                if (error) {
                    throw new Error(error.message);
                }

                const isOwner = data.creator_clerk === user.id;
                onCheckComplete(isOwner);
            } catch (error) {
                console.error("Error checking subreddit ownership:", error);
                onCheckComplete(false);
            }
        };

        checkOwnership();
    }, [user, subredditId, onCheckComplete]);

    // Component doesn't need to render anything visible
    return null;
};

export default SubredditOwner;