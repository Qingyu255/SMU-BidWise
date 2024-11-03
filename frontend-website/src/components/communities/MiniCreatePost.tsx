"use client"
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Image as ImageIcon, Link2 } from 'lucide-react'
import { FC, useState, useEffect } from 'react'
import { UserAvatar } from '../UserAvatar'
import { useUser } from '@clerk/clerk-react'
import { usePathname, useRouter } from 'next/navigation'
import createClient from '@/utils/supabase/client'

interface MiniCreatePostProps {
    subredditID?: string;
    userName?: string;
}

const MiniCreatePost: FC<MiniCreatePostProps> = ({ subredditID }) => {
    const { user } = useUser() // Get user data from Clerk
    const router = useRouter()
    const pathname = usePathname()
    const [content, setContent] = useState('') // State for the post content
    const supabase = createClient();
    
    useEffect(() => {
        const setupChannel = async () => {
          const channel = supabase.channel('schema-db-changes')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'subreddit',
            }, (payload) => console.log('Subreddit change:', payload))
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'post',
            }, (payload) => console.log('Post added', payload))
            .subscribe((status) => {
              console.log('Channel subscribed with status:', status);
            });
          return channel;
        }
    
        if (user) {
          handleSubmit(); // Setup channel when user is ready
        }
      }, [user, supabase]);

    const handleSubmit = async () => {
        if (!user) return; // Prevent submission if user is not authenticated
        if (!subredditID) {
            console.error('Subreddit ID is missing'); // Log an error if subredditID is invalid
            return;
        }

      const { error } = await supabase
        .from('post') // Replace with your actual table name
        .insert([
          {
            id: undefined, // Let Supabase generate the UUID
            title: '', // Provide a default or user input for title if needed
            content, // Content from user input
            author_clerk: user.id, // Assuming you're using Clerk for authentication
            subreddit_id: subredditID, // Passed as prop or retrieved from context
            created_at: new Date().toISOString(), // Use current date for created_at
            updated_at: new Date().toISOString(), // Same for updated_at
          },
        ])
  
      if (error) {
        console.error('Error creating post:', error)
        return
      }
  
      // Optionally reset content or redirect after submission
      setContent('')
      router.push(pathname) // Navigate back to the current page or any other logic
    }
  
    return (
      <li className='overflow-hidden rounded-md bg-white shadow'>
        <div className='h-full px-6 py-4 flex justify-between gap-6'>
          <div className='relative'>
            <UserAvatar
              name={user?.fullName || null} // Pass the name directly
              image={user?.imageUrl || null} // Pass the image URL directly
            />
            <span className='absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white' />
          </div>
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)} // Update content state
            onClick={() => router.push(pathname + '/submit')}
            placeholder='Create post'
          />
          <Button onClick={handleSubmit} variant='ghost'>
            <ImageIcon className='text-zinc-600' />
          </Button>
          <Button onClick={handleSubmit} variant='ghost'>
            <Link2 className='text-zinc-600' />
          </Button>
        </div>
      </li>
    )
  }
  
  export default MiniCreatePost