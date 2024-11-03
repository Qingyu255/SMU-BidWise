'use client'
import { FC, useEffect, useState } from "react";
import { ExtendedPost } from "../../types";
import createClient from "@/utils/supabase/client";
import { INFINITE_SCROLL_PAGINATION_RESULTS } from "@/config";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import Post from "./Post";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subreddit {
  id: string;
  name: string;
  created_at: string;
  description?: string;
}

const MyFeed: FC = () => {
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscriptions, setHasSubscriptions] = useState<boolean | null>(null);
  const [allSubreddits, setAllSubreddits] = useState<Subreddit[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    const loadFeed = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // First, get user's subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('subreddit_id')
          .eq('clerk_user_id', user.id);

        if (subError) throw subError;

        if (!subscriptions || subscriptions.length === 0) {
          setHasSubscriptions(false);
          // Load all subreddits for discovery
          const { data: subreddits, error } = await supabase
          .from('subreddit')  // Explicitly define table and response types
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
          if (error) {
            console.error("Failed to load subreddits:", error);
          } else {
            setAllSubreddits((subreddits as unknown as Subreddit[] || []));
          }
          setLoading(false);
          return;
        }

        setHasSubscriptions(true);
        const subredditIds = subscriptions.map(sub => sub.subreddit_id);

        // Get posts from subscribed subreddits
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

        // Get authors info
        const authorIds = initialPosts.map(post => post.author_clerk);
        const { data: authors } = await supabase
          .from('user')
          .select('clerk_user_id, name')
          .in('clerk_user_id', authorIds);

        // Get votes
        const postIds = initialPosts.map(post => post.id);
        const { data: votes } = await supabase
          .from('vote')
          .select('post_id, user_clerk, type')
          .in('post_id', postIds);

        // Get comments
        const { data: comments } = await supabase
          .from('comment')
          .select('post_id, text')
          .in('post_id', postIds);

        // Get subreddit names
        const { data: subreddits } = await supabase
          .from('subreddit')
          .select('id, name')
          .in('id', subredditIds);

        const subredditMap = Object.fromEntries(subreddits?.map(sub => [sub.id, sub.name]) || []);

        // Combine all data
        const extendedPosts = initialPosts.map(post => {
          const author = authors?.find(user => user.clerk_user_id === post.author_clerk);
          const postVotes = votes?.filter(vote => vote.post_id === post.id) || [];
          const postComments = comments?.filter(comment => comment.post_id === post.id) || [];

          return {
            ...post,
            author_name: author ? author.name : 'Unknown',
            votes: postVotes,
            comments: postComments,
            subreddit_name: subredditMap[post.subreddit_id as string] || 'Unknown Subreddit', // Fetch subreddit name
          } as ExtendedPost;
        });

        setPosts(extendedPosts);
        setHasMorePosts(initialPosts.length === INFINITE_SCROLL_PAGINATION_RESULTS);
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

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('subreddit_id')
      .eq('clerk_user_id', user.id);

    const subredditIds = subscriptions?.map(sub => sub.subreddit_id) || [];
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
      .in('subreddit_id', subredditIds)
      .order('created_at', { ascending: false })
      .range(start, start + INFINITE_SCROLL_PAGINATION_RESULTS - 1);

    if (error || !newPosts.length) {
      setHasMorePosts(false);
      return;
    }

    const authorIds = newPosts.map(post => post.author_clerk);
    const { data: authors } = await supabase
      .from('user')
      .select('clerk_user_id, name')
      .in('clerk_user_id', authorIds);

    const postIds = newPosts.map(post => post.id);
    const { data: votes } = await supabase
      .from('vote')
      .select('post_id, user_clerk, type')
      .in('post_id', postIds);

    const { data: comments } = await supabase
      .from('comment')
      .select('post_id, text')
      .in('post_id', postIds);

    const extendedPosts = newPosts.map(post => {
      const author = authors?.find(user => user.clerk_user_id === post.author_clerk);
      const postVotes = votes?.filter(vote => vote.post_id === post.id) || [];
      const postComments = comments?.filter(comment => comment.post_id === post.id) || [];

      return {
        ...post,
        author_name: author ? author.name : 'Unknown',
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

  if (!hasSubscriptions) {
    return (
      <div className="col-span-1 md:col-span-3 space-y-6">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">You don&apos;t have any subscriptions yet</h2>
          <p className="text-zinc-600 mb-6">Explore these subreddits to get started:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allSubreddits.map((subreddit) => (
            <Card key={subreddit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">r/{subreddit.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600 text-sm">
                  {subreddit.description || "A community for interesting discussions"}
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Created {new Date(subreddit.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    // Main content spans full width on mobile, all three columns on desktop
    <div className="col-span-1 md:col-span-3">
      {/* Feed content */}
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.id}>
            <Post
              post={post}
              subredditName={post.subreddit_name || "Unknown Subreddit"} // Pass the subreddit name here
              commentAmt={post.comments.length}
              votesAmt={post.votes.length}
              currentVote={post.votes.find(vote => vote.user_clerk === user?.id)?.type?.toString()} // Convert to string if it's a number
            />
          </li>
        ))}

        {/* Load more section */}
        {posts.length > 0 && (
          <li className="flex justify-center">
            {hasMorePosts ? (
              <button
                onClick={handleLoadMorePosts}
                className="text-zinc-500 hover:text-zinc-600 transition"
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