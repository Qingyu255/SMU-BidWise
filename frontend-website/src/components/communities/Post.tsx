'use client'
import { formatTimeToNow } from '@/utils/utils'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { FC, useRef } from 'react'
import EditorOutput from './EditorOutput'
import UpDownVote from './UpDownVote' // Import UpDownVote component
import { ExtendedPost } from '../../../types'

interface PostProps {
    post: ExtendedPost
    votesAmt: number
    subredditName: string
    currentVote?: string
    commentAmt: number
}

const Post: FC<PostProps> = ({
    post,
    subredditName,
    currentVote,
    commentAmt,
}) => {
    const pRef = useRef<HTMLParagraphElement>(null)
    const isOverflowing = pRef.current && pRef.current.clientHeight >= 160;

    return (
        <div className='rounded-md bg-white shadow'>
            <div className='px-6 py-4 flex justify-between'>


                <div className='w-0 flex-1'>
                    <div className='max-h-40 mt-1 text-xs text-gray-500'>
                        {subredditName && (
                            <>
                                <a
                                    className='underline text-zinc-900 text-sm underline-offset-2'
                                    href={`/communities/r/${subredditName}`}
                                    aria-label={`Visit subreddit ${subredditName}`}>
                                    r/{subredditName}
                                </a>
                                <span className='px-1'>•</span>
                            </>
                        )}
                        <span>Posted by u/{post.author_name} </span>
                        {formatTimeToNow(new Date(post.created_at))}
                    </div>
                    <Link href={`/communities/r/${subredditName}/post/${post.id}`}>
                        <h1 className='text-lg font-semibold py-2 leading-6 text-gray-900'>
                            {post.title}
                        </h1>
                    </Link>

                    <div className='relative flex justify-between text-sm max-h-40 w-full overflow-clip' ref={pRef}>
                        <div className='flex-1'>
                            <EditorOutput content={post.content} />
                            {isOverflowing && (
                                <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent'></div>
                            )}
                        </div>
                        <UpDownVote postId={post.id} initialVotes={post.votes} />
                    </div>
                </div>
            </div>

            <div className='bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6'>
                <Link
                    href={`/r/${subredditName}/post/${post.id}`}
                    className='flex items-center justify-between w-full'>
                    <div className='flex items-center gap-2'>
                        <MessageSquare className='h-4 w-4' />
                        {commentAmt} comments
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default Post;
