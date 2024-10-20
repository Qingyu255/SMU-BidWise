'use client'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Image as ImageIcon, Link2 } from 'lucide-react'
import { FC } from 'react'
import { UserAvatar } from './UserAvatar'
import { UserProfile, useUser } from '@clerk/clerk-react';
import { usePathname, useRouter } from 'next/navigation'



// Define the expected user type based on the properties you want to use
interface UserType {
    id: string | null;
    firstName: string | null;
    profileImageUrl: string | null;
  }

interface MiniCreatePostProps {
    user: UserType | null; // Adjust type based on your actual User type
  }

const MiniCreatePost: FC<MiniCreatePostProps> = ({user}) => {
  const router = useRouter()
  const pathname = usePathname()
  
  return (
    <li className='overflow-hidden rounded-md bg-white shadow'>
      <div className='h-full px-6 py-4 flex justify-between gap-6'>
        <div className='relative'>
          <UserAvatar image={user?.profileImageUrl} name={user?.firstName}/>

          <span className='absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white' />
        </div>
        <Input
          onClick={() => router.push(pathname + '/submit')}
          readOnly
          placeholder='Create post'
        />
        <Button
          onClick={() => router.push(pathname + '/submit')}
          variant='ghost'>
          <ImageIcon className='text-zinc-600' />
        </Button>
        <Button
          onClick={() => router.push(pathname + '/submit')}
          variant='ghost'>
          <Link2 className='text-zinc-600' />
        </Button>
      </div>
    </li>
  )
}

export default MiniCreatePost