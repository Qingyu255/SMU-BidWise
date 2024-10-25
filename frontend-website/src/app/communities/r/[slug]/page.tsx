"use client"

import { useParams } from 'next/navigation'
import createClient from '@/utils/supabase/client'
import { useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import MiniCreatePost from '@/components/MiniCreatePost'
import Layout from './layout'

interface pageProps {
  params: {
      slug: string
  }
}

const ClientSubredditPage = ({params}: pageProps) => {
  const subredditName = params.slug;
  const { user } = useUser(); // Extract user data and loading states
  const supabase = createClient(); // Initialize Supabase client
  const [userName, setUserName] = useState<string>(''); // State to hold user name

  useEffect(() => {
    fetchData(); // Call fetchData when the component mounts
  }, [user, subredditName]); // Add dependencies

  const fetchData = async () => {
    if (!user?.id) {
      console.error('User is not signed in or user ID is missing');
      return;
    }
    if (!subredditName) {
      console.error('Subreddit Name is missing');
      return;
    }
    try {
      // Get user data 
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("name")
        .eq('clerk_user_id', user?.id)
        .single();

      // Check for errors when fetching user data
      if (userError) {
        throw new Error(userError.message); // Handle error
      }

      setUserName(userData.name as string); // Update state with user name
      console.log("Username:", userName);

      // Get subreddit data
      const { data: subredditData, error: subredditError } = await supabase
        .from("subreddit")
        .select("id, name") // Fetch both id and name
        .eq('name', subredditName) // Query by name instead of ID
        .single(); // Expect a single result

      // Check for errors when fetching subreddit details
      if (subredditError) {
        throw new Error(subredditError.message); // Handle error
      }

      const subredditId = subredditData.id
      console.log("Subreddit Data:", subredditData.id);
      console.log("subreddit ID", subredditId)

    } catch (error) {
      console.error('Error fetching subreddit data:', error);
    }
  };


  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl h-14'>
        r/{subredditName}
      </h1>
      <MiniCreatePost subredditID="subredditId" userName="userName" />
      {/* Show Posts */}
    </>
  )
}

export default ClientSubredditPage