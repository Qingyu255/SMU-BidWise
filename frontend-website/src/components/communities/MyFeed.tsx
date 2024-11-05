'use client'
import { FC, useEffect, useState } from "react";
import { ExtendedPost } from "../../../types";
import createClient from "@/utils/supabase/client";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import Post from "./Post";

const MyFeed: FC = () => {
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscriptions, setHasSubscriptions] = useState<boolean | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    const loadFeed = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Get user's subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('subreddit_id')
          .eq('clerk_user_id', user.id);

        if (subError) throw subError;

        // If no subscriptions, load all posts sorted by most recent
        if (!subscriptions || subscriptions.length === 0) {
          setHasSubscriptions(false);

          const { data: allPosts, error: postsError } = await supabase
            .from('post')
            .select(`
              id,
              title,
              content,
              created_at,
              subreddit_id,
              author_clerk
            `)
            .order('created_at', { ascending: false })
            .limit(INFINITE_SCROLL_PAGINATION_RESULTS);

          if (postsError) throw postsError;

          // Fetch all subreddits
          const { data: subreddit, error: subredditsError } = await supabase
            .from('subreddit')
            .select('id, name');

          if (subredditsError) throw subredditsError;

          // Create a mapping of subreddit IDs to names
          const subredditMap = Object.fromEntries(
            subreddit?.map(subreddit => [subreddit.id, subreddit.name]) || []
          );

          const authorIds = allPosts.map(post => post.author_clerk);
          const postIds = allPosts.map(post => post.id);

          // Fetch authors info
          const { data: authors } = await supabase
            .from('user')
            .select('clerk_user_id, name')
            .in('clerk_user_id', authorIds);

          // Fetch votes for posts
          const { data: votes } = await supabase
            .from('vote')
            .select('post_id, user_clerk, type')
            .in('post_id', postIds);

          // Fetch comments for posts
          const { data: comments } = await supabase
            .from('comment')
            .select('post_id, text')
            .in('post_id', postIds);

          // Combine data into extended posts
          const extendedPosts = allPosts.map(post => {
            const subredditName = subredditMap[post.subreddit_id as string] || "Unknown Subreddit";
            const author = authors?.find(user => user.clerk_user_id === post.author_clerk);
            const postVotes = votes?.filter(vote => vote.post_id === post.id) || [];
            const postComments = comments?.filter(comment => comment.post_id === post.id) || [];

            return {
              ...post,
              subreddit_name: subredditName,
              author_name: author ? author.name : 'Unknown',
              votes: postVotes,
              comments: postComments,
            } as ExtendedPost;
          });

          setPosts(extendedPosts);
          setHasMorePosts(allPosts.length === INFINITE_SCROLL_PAGINATION_RESULTS);
        } else {
          // If there are subscriptions, load posts from subscribed subreddits
          setHasSubscriptions(true);
          const subredditIds = subscriptions.map(sub => sub.subreddit_id);

          const { data: initialPosts, error: postsError } = await supabase
            .from('post')
            .select(`
              id,
              title,
              content,
              created_at,
              subreddit_id,
              author_clerk
            `)
            .in('subreddit_id', subredditIds)
            .order('created_at', { ascending: false })
            .range(0, INFINITE_SCROLL_PAGINATION_RESULTS - 1);

          if (postsError) throw postsError;

          // Fetch all subreddits
          const { data: subreddits, error: subredditsError } = await supabase
            .from('subreddit')
            .select('id, name');

          if (subredditsError) throw subredditsError;

          // Create a mapping of subreddit IDs to names
          const subredditMap = Object.fromEntries(
            subreddits?.map(subreddit => [subreddit.id, subreddit.name]) || []
          );

          const authorIds = initialPosts.map(post => post.author_clerk);
          const postIds = initialPosts.map(post => post.id);

          const { data: authors } = await supabase
            .from('user')
            .select('clerk_user_id, name')
            .in('clerk_user_id', authorIds);

          const { data: votes } = await supabase
            .from('vote')
            .select('post_id, user_clerk, type')
            .in('post_id', postIds);

          const { data: comments } = await supabase
            .from('comment')
            .select('post_id, text')
            .in('post_id', postIds);

          const extendedPosts = initialPosts.map(post => {
            const subredditName = subredditMap[post.subreddit_id as string] || "Unknown Subreddit";
            const author = authors?.find(user => user.clerk_user_id === post.author_clerk);
            const postVotes = votes?.filter(vote => vote.post_id === post.id) || [];
            const postComments = comments?.filter(comment => comment.post_id === post.id) || [];

            return {
              ...post,
              subreddit_name: subredditName,
              author_name: author ? author.name : 'Unknown',
              votes: postVotes,
              comments: postComments,
            } as ExtendedPost;
          });

          setPosts(extendedPosts);
          setHasMorePosts(initialPosts.length === INFINITE_SCROLL_PAGINATION_RESULTS);
        }
      } catch (error) {
        console.error('Error loading feed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user, supabase]);

  const handleLoadMorePosts = async () => {
    if (!user) return;

    const start = posts.length;
    const { data: newPosts, error } = await supabase
      .from('post')
      .select(`
        id,
        title,
        content,
        created_at,
        subreddit_id,
        author_clerk
      `)
      .order('created_at', { ascending: false })
      .range(start, start + INFINITE_SCROLL_PAGINATION_RESULTS - 1);

    if (error || !newPosts.length) {
      setHasMorePosts(false);
      return;
    }
    // Fetch all subreddits
    const { data: subreddits, error: subredditsError } = await supabase
      .from('subreddit')
      .select('id, name');

    if (subredditsError) throw subredditsError;
     // Create a mapping of subreddit IDs to names
     const subredditMap = Object.fromEntries(
      subreddits?.map(subreddit => [subreddit.id, subreddit.name]) || []
    );


    const authorIds = newPosts.map(post => post.author_clerk);
    const postIds = newPosts.map(post => post.id);

    const { data: authors } = await supabase
      .from('user')
      .select('clerk_user_id, name')
      .in('clerk_user_id', authorIds);

    const { data: votes } = await supabase
      .from('vote')
      .select('post_id, user_clerk, type')
      .in('post_id', postIds);

    const { data: comments } = await supabase
      .from('comment')
      .select('post_id, text')
      .in('post_id', postIds);

    const extendedPosts = newPosts.map(post => {
      const subredditName = subredditMap[post.subreddit_id as string] || "Unknown Subreddit";
      const author = authors?.find(user => user.clerk_user_id === post.author_clerk);
      const postVotes = votes?.filter(vote => vote.post_id === post.id) || [];
      const postComments = comments?.filter(comment => comment.post_id === post.id) || [];

      return {
        ...post,
        author_name: author ? author.name : 'Unknown',
        subreddit_name: subredditName,
        votes: postVotes,
        comments: postComments,
      } as ExtendedPost;
    });

    setPosts(prevPosts => [...prevPosts, ...extendedPosts]);
  };

  if (loading) {
    return (
      <div className="col-span-1 md:col-span-3 flex justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="col-span-1 md:col-span-3">
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.id}>
            <Post
              post={post}
              subredditName={post.subreddit_name || "Unknown Subreddit"}
              commentAmt={post.comments.length}
              votesAmt={post.votes.length}
              currentVote={post.votes.find(vote => vote.user_clerk === user?.id)?.type?.toString()}
            />
          </li>
        ))}
        {posts.length > 0 && (
          <li className="flex justify-center">
            {hasMorePosts ? (
              <button
                onClick={handleLoadMorePosts}
                className="text-zinc-500 hover:text-zinc-600 transition underline"
              >
                Load More
              </button>
            ) : (
              <p className="text-zinc-500">No more posts to show</p>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default MyFeed;
