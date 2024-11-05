"use client";
import createClient from '@/utils/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import MiniCreatePost from '@/components/communities/MiniCreatePost';
import PostFeed from '@/components/communities/PostFeed';

interface pageProps {
  params: {
    slug: string;
  };
}

const ClientSubredditPage = ({ params }: pageProps) => {
  const subredditName = params.slug;
  const { user } = useUser(); // Extract user data and loading states
  const supabase = createClient(); // Initialize Supabase client
  const [subredditId, setSubredditId] = useState<string>(''); // State to hold subreddit ID
  const [userName, setUserName] = useState<string>(''); // State to hold subreddit ID
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false); // Loading state for pagination

  const fetchSubredditId = async () => {
    if (!user?.id || !subredditName) return;

    try {
      const { data: subredditData, error: subredditError } = await supabase
        .from("subreddit")
        .select("id")
        .eq('name', subredditName)
        .single();

      if (subredditError) throw new Error(subredditError.message);

      setSubredditId(subredditData.id as string);

      const { data: userData, error: userError } = await supabase
      .from("user")
      .select("name")
      .eq('user_clerk_id', user?.id)
      .single();

    if (userError) throw new Error(userError.message);

    setUserName(userData.name as string)

    } catch (error) {
      console.error('Error fetching subreddit data:', error);
    }
  };

  useEffect(() => {
    fetchSubredditId(); // Call fetchSubredditId when the component mounts
  }, [user, subredditName]); // Add dependencies

  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl h-14'>r/{subredditName}</h1>
      <MiniCreatePost subredditID={subredditId} userName={userName} />
      <PostFeed 
        subredditName={subredditName} 
        subredditId={subredditId}
        loadMorePosts={() => {/* Logic to load more posts if needed */}} 
        isFetchingNextPage={isFetchingNextPage} 
      />
    </>
  );
};

export default ClientSubredditPage;



// "use client"
// import createClient from '@/utils/supabase/client'
// import { useUser } from '@clerk/clerk-react'
// import { useState, useEffect } from 'react'
// import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
// import MiniCreatePost from '@/components/MiniCreatePost'
// import PostFeed from '@/components/PostFeed';
// import { ExtendedPost } from '../../../../../types';

// interface pageProps {
//   params: {
//     slug: string
//   }
// }

// const ClientSubredditPage = ({ params }: pageProps) => {
//   const subredditName = params.slug;
//   const { user } = useUser(); // Extract user data and loading states
//   const supabase = createClient(); // Initialize Supabase client
//   const [userName, setUserName] = useState<string>(''); // State to hold user name
//   const [subredditId, setSubredditId] = useState<string>(''); // State to hold user name
//   const [post, setPosts] = useState<ExtendedPost[]>([]); // State to hold posts data

//   useEffect(() => {
//     fetchData(); // Call fetchData when the component mounts
//   }, [user, subredditName]); // Add dependencies

//   const fetchData = async () => {
//     if (!user?.id) {
//       console.error('User is not signed in or user ID is missing');
//       return;
//     }
//     if (!subredditName) {
//       console.error('Subreddit Name is missing');
//       return;
//     }
//     try {
//       // Get user data 
//       const { data: userData, error: userError } = await supabase
//         .from("user")
//         .select("name")
//         .eq('clerk_user_id', user?.id)
//         .single();

//       // Check for errors when fetching user data
//       if (userError) {
//         throw new Error(userError.message); // Handle error
//       }

//       setUserName(userData.name as string); // Update state with user name
//       console.log("Username:", userData.name); // Log the fetched user name

//       // Get subreddit data
//       const { data: subredditData, error: subredditError } = await supabase
//         .from("subreddit")
//         .select("id, name") // Fetch both id and name
//         .eq('name', subredditName) // Query by name instead of ID
//         .single(); // Expect a single result

//       // Check for errors when fetching subreddit details
//       if (subredditError) {
//         throw new Error(subredditError.message); // Handle error
//       }

//       setSubredditId(subredditData.id as string); // Update subredditId state
//       console.log("Subreddit Data:", subredditData.id); // Log the fetched subreddit ID

//       // Get post data
//       const { data: postData, error: postError } = await supabase
//         .from('post')
//         .select(`
//         id,
//         title,
//         content,
//         created_at,
//         subreddit_id,
//         author_clerk
//     `)
//         .order('created_at', { ascending: false }) // Adjust ordering as needed
//         .limit(INFINITE_SCROLL_PAGINATION_RESULTS) // For pagination
//         .eq('subreddit_id', subredditData.id as string); // If filtering by subreddit, otherwise remove

//       if (postError) {
//         throw new Error(postError.message);
//       }

//       // Get author IDs from post data
//       const authorIds = postData.map(post => post.author_clerk);

//       // Fetch user data
//       const { data: authorData, error: authorError } = await supabase
//         .from('user')
//         .select('clerk_user_id, name')
//         .in('clerk_user_id', authorIds); // Fetch users matching author IDs

//       if (authorError) {
//         throw new Error(authorError.message);
//       }

//       // Fetch votes for posts
//       const { data: votesData, error: votesError } = await supabase
//         .from('vote')
//         .select('post_id, type')
//         .in('post_id', postData.map(post => post.id));

//       if (votesError) {
//         throw new Error(votesError.message);
//       }

//       // Fetch comments for posts
//       const { data: commentsData, error: commentsError } = await supabase
//         .from('comment')
//         .select('post_id, text')
//         .in('post_id', postData.map(post => post.id));

//       if (commentsError) {
//         throw new Error(commentsError.message);
//       }
//       // Combine posts with author names, votes, and comments
//       const extendedPosts = postData.map(post => {
//         const author = authorData.find(user => user.clerk_user_id === post.author_clerk);

//         const votes = votesData.filter(vote => vote.post_id === post.id);
//         const comments = commentsData.filter(comment => comment.post_id === post.id);

//         return {
//           ...post,
//           author_name: author ? author.name : 'Unknown',
//           votes, // Add votes
//           comments, // Add comments
//         };
//       }) as ExtendedPost[];

//       // Set the extended posts
//       setPosts(extendedPosts);
//       console.log(extendedPosts)

      

//     } catch (error) {
//       console.error('Error fetching subreddit data:', error);
//     }

//   };


//   return (
//     <>
//       <h1 className='font-bold text-3xl md:text-4xl h-14'>
//         r/{subredditName}
//       </h1>
//       <MiniCreatePost subredditID="subredditId" userName="userName" />
//       {/* Show Posts */}
//       <PostFeed initialPosts={post} subredditName={subredditName} subredditId={subredditId} />
//     </>
//   )
// }

// export default ClientSubredditPage