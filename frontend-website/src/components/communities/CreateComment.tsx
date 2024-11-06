'use client';

import { Button,ButtonProps } from '../ui/button';
import { useRouter } from 'next/navigation';
import { FC, useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import createClient from '@/utils/supabase/client';
import { useUser } from '@clerk/clerk-react';

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

interface LoadingButtonProps extends ButtonProps {
    isLoading?: boolean;
  }

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const [input, setInput] = useState<string>('');
  const supabase = createClient();
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    // Set up channel for real-time updates
    const channel = supabase.channel('schema-vote-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comment'
      }, (payload) => {
        console.log('Comment added:', payload);
        // Optional: Update local state for real-time updates
      })
      .subscribe();

    // Clean up subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

const handlePostComment = async () => {
  const payload = {
    postId: postId,
    text: input,
    replyToId: replyToId || null,
  };

  try {
    if (!user || !user.user) {
      throw new Error('User is not signed in');
    }

    const { data, error } = await supabase
      .from('comment')
      .insert([
        {
          post_id: payload.postId,
          text: payload.text,
          reply_to_id: payload.replyToId,
          author_clerk: user.user.id, // Access the id safely
        }
      ]);

    if (error) {
      throw new Error(error.message);
    }

    console.log('Comment posted successfully:', data);
    setInput('');

  } catch (err) {
    console.error('Error posting comment:', err);
  }
};

  return (
    <div className='grid w-full gap-1.5'>
      <Label htmlFor='comment'>Your comment</Label>
      <div className='mt-2'>
        <Textarea
          id='comment'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder='What are your thoughts?'
        />

        <div className='mt-2 flex justify-end'>
          <Button
            disabled={input.length === 0}
            onClick={handlePostComment}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
