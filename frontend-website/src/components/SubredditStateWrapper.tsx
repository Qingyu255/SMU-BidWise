// SubredditStateWrapper.tsx
"use client";

import React, { useState } from 'react';
import CheckSubscription from "@/components/CheckSubscription";
import SubredditOwner from "@/components/SubredditOwner";
import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface SubredditStateWrapperProps {
    subredditId: string;
    subredditName: string;
    slug: string;
}

const SubredditStateWrapper: React.FC<SubredditStateWrapperProps> = ({
    subredditId,
    subredditName,
    slug
}) => {
    const [isOwner, setIsOwner] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    return (
        <>
            {/* These components check the status but don't render anything */}
            <SubredditOwner
                subredditId={subredditId}
                onCheckComplete={setIsOwner}
            />
            <CheckSubscription
                subredditId={subredditId}
                onCheckComplete={setIsSubscribed}
            />
            
            {/* Owner message */}
            {isOwner && (
                <div className="py-3">
                    <p>You are the owner of this subreddit.</p>
                </div>
            )}

            {/* Show subscription toggle for non-owners */}
            {!isOwner && (
                <div className="py-3">
                    <SubscribeLeaveToggle
                        isSubscribed={isSubscribed}
                        subredditId={subredditId}
                        subredditName={subredditName}
                    />
                </div>
            )}
        
        </>
    );
};

export default SubredditStateWrapper;