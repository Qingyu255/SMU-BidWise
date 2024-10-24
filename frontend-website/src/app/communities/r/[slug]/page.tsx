"use client"

import { useSearchParams, useParams } from 'next/navigation'
import createClient from '@/utils/supabase/client'
import { useUser } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';


const ClientSubredditPage = () => {
  const searchParams = useSearchParams()
  const { user, isLoaded, isSignedIn } = useUser(); // Extract user data and loading states
  const subredditId = searchParams.get('subredditId')
  const supabase = createClient(); // Initialize Supabase client
  const [subredditName, setSubredditName] = useState<string>(''); // State to hold subreddit name
  const [userName, setUserName] = useState<string>(''); // State to hold user name

  useEffect(() => {
    const setupChannel = async () => {
      const channel = supabase.channel('schema-db-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user'
        }, (payload) => console.log('User table change:', payload))
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'subreddit',
        }, (payload) => console.log('Subreddit change:', payload))
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
        }, (payload) => console.log('Subreddit subscribed:', payload))
        .subscribe((status) => {
          console.log('Channel subscribed with status:', status);
        });
      return channel;
    }

    if (isLoaded && isSignedIn && user) {
      fetchData(); // Setup channel when user is ready
    }
  }, [isLoaded, isSignedIn, user, supabase]);

  //get Subreddit Data and other Data
  const fetchData = async () => {
    if (!user?.id) {
      console.error('User is not signed in or user ID is missing');
      return;
    }
    if (!subredditId) {
      console.error('Subreddit ID is missing');
      return;
    }
    try {
      //get subreddit data
      const { data: subredditData, error: subredditError } = await supabase
        .from("subreddit")
        .select("name")
        .eq('id', subredditId)
        .single();

      // Check for errors when fetching subreddit details
      if (subredditError) {
        throw new Error(subredditError.message); // Handle error
      }

      setSubredditName(subredditData.name as string); // Update state with subreddit name

      // get user data 
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("name")
        .eq('clerk_user_id', user?.id)
        .single();

      // Check for errors when fetching subreddit details
      if (userError) {
        throw new Error(userError.message); // Handle error
      }

      setUserName(userData.name as string); // Update state with subreddit name
      console.log("Subreddit Data:", subredditData);
      console.log("User Data:", userData);


    } catch (error) {
      console.error('Error fetching subreddit data:', error);
    }
  };


  return (
    <div>
      <h1>r/{subredditName}</h1>
      <p>Subreddit ID: {subredditId}</p>
      <p>Created by: {userName} </p>
    </div>
  )
}

export default ClientSubredditPage