"use client"
import { Button } from '@/components/ui/button'
import createClient from '@/utils/supabase/client';
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react'

interface LikesProps {
  likes: number;
  id: string;
}

interface LikedData {
    user_clerk_user_id: string;
    senior_clerk_user_id: string;
}
const Likes: React.FC<LikesProps> = ({ likes, id }) => {
    let color = 'none'
    const {user} = useUser();
    const [likesAllowed, setLikesAllowed] = useState(false)
    const [liked, setLiked] = useState(false)
    const supabase = createClient()
    const user_id = user?.id || ''
    const [likedData, setLikedData] = useState<LikedData[]>([])
    const [likesCounter, setLikesCounter] = useState(likes)
    useEffect(() => {
        if(user_id) {


            setLikesAllowed(true)
        }
    }, [user])


    useEffect(() => {
        const fetchLiked = async () => {
            const { data: likedData, error: likedError } = await supabase
                .from('roadmap_likes')
                .select('*')
                .eq('user_clerk_user_id', user_id);
            if(likedError) { throw likedError }
            else if(likedData) {
                const userLikes: LikedData[] = (likedData as unknown as LikedData[]).map((item: LikedData) => ({
                    user_clerk_user_id: item.user_clerk_user_id,
                    senior_clerk_user_id: item.senior_clerk_user_id
                }))
                console.log('ul', userLikes)
            }
        };
        fetchLiked();
    })


    

    const handleLikes = async () => {
        if (likesAllowed == true) {
            const { error: likesError } = await supabase
                .from('roadmap_info')
                .update({likes: likes + 1})
                .eq('_clerk_user_id', id);

            if (likesError) throw likesError;

            console.log('user_id', user_id)
            console.log('id', id)
            const { error: likedError } = await supabase
                .from('roadmap_likes')
                .insert({
                    user_clerk_user_id: user_id,
                    senior_clerk_user_id: id
                });

            if (likedError) throw likedError;
            console.log('added likes')
            setLiked(true);
            setLikesCounter(likesCounter + 1)


        }
            

    }
        if (liked === true) {
            color = 'currentColor'
        }
        

        return (
            <Button variant={'outline'} onClick={handleLikes}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={color} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                &nbsp;
                {likesCounter}
            </Button>
        )
    }

export default Likes