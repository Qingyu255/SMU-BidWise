export interface ExtendedPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  subreddit_id: string;
  author_clerk: string;
  author_name: string;
  votes: { post_id: string; type: number, user_clerk:string }[]; // This should include the 'user_id'
  comments: { post_id: string; text: string }[];
}