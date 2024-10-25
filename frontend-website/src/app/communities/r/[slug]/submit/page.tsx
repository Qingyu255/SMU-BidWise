'use client'
import MiniCreatePost from "@/components/MiniCreatePost"
import { Button } from "@/components/ui/button"
import createClient from '@/utils/supabase/client'
import { useUser } from '@clerk/clerk-react'
import { notFound } from "next/navigation"
import Editor from "@/components/Editor"

interface pageProps {
    params: {
        slug: string
    }
}

const page = async ({ params }: pageProps) => {
    const subredditName = params.slug;
    const { user } = useUser(); // Extract user data and loading states
    const supabase = createClient(); // Initialize Supabase client

    const { data: subredditData, error: srError } = await supabase
        .from("subreddit")
        .select("subreddit_id")
        .eq('name', subredditName)
        .single();

      // Check for errors when fetching user data
      if (srError) {
        throw new Error(srError.message); // Handle error
      }
      if (!subredditData) return notFound()

    const subredditId = subredditData.subreddit_id

    return (
        <div className='flex flex-col items-start gap-6'>
            {/* heading */}
            <div className='border-b border-gray-200 pb-5'>
                <div className='-ml-2 -mt-2 flex flex-wrap items-baseline'>
                    <h3 className='ml-2 mt-2 text-base font-semibold leading-6 text-gray-900'>
                        Create Post
                    </h3>
                    <p className='ml-2 mt-1 truncate text-sm text-gray-500'>
                        in r/{params.slug}
                    </p>
                </div>
            </div>

            {/* form
            <Editor subredditId="subredditId" authorId='userId' /> */}

            <div className='w-full flex justify-end'>
                <Button type='submit' className='w-full' form='subreddit-post-form'>
                    Post
                </Button>
            </div>
        </div>
    )
}

export default page