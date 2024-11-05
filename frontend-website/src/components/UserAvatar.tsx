import { AvatarProps } from '@radix-ui/react-avatar'
import { Icons } from '@/components/Icons'
import { Avatar, AvatarFallback } from './ui/avatar'
import Image from 'next/image'

// Update the props to receive `image` and `name` directly, bypassing Prisma User type
interface UserAvatarProps extends AvatarProps {
    image?: string | null // Optional profile image from Clerk
    name?: string | null  // Optional name from Clerk
  }
  
  export function UserAvatar({ image, name, ...props }: UserAvatarProps) {
    return (
      <Avatar {...props}>
        {image ? (
          <div className='relative aspect-square h-full w-full'>
            <Image
              src={image} // Profile image URL
              alt='Profile picture'
              fill // New Next.js prop for filling the container
              objectFit="cover" // Ensures the image scales correctly
              referrerPolicy='no-referrer'
            />
          </div>
        ) : (
          <AvatarFallback>
            <span className='sr-only'>{name}</span>
            <Icons.user className='h-4 w-4' /> {/* Fallback icon */}
          </AvatarFallback>
        )}
      </Avatar>
    )
  }