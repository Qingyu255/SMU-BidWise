// CreatePostButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

const CreatePostButton = ({ slug }: { slug: string }) => {
    const router = useRouter();

    const handleCreatePost = () => {
        // Log the slug to the console
        console.log(`Navigating to create post for subreddit: ${slug}`);
        
        // Delay the redirect
        setTimeout(() => {
            router.push(`/communities/r/${slug}/submit`);
        }, 2000); // Wait for 2 seconds before redirecting
    };

    return (
        <button
            onClick={handleCreatePost}
            className={buttonVariants({
                variant: "outline",
                className: "w-full mb-6",
            })}
        >
            Create Post
        </button>
    );
};

export default CreatePostButton;
