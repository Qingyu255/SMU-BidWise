"use client"

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Axios, AxiosError } from "axios"
import { CreateSubredditPayload } from '@/lib/validators/subreddit'
import { Toast } from '@/components/ui/toast'
import { Description } from '@radix-ui/react-toast'


const Page = () => {
    const [input, setInput] = useState<string>('')
    const router = useRouter()

    const { mutate: createCommunity, isLoading } = useMutation({
        mutationFn: async () => {
            const payload = {
                name: input.trim() // Trim whitespace from input
            };

            const response = await fetch('/api/communities/subreddit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json(); // Parse the response to get the error message
                throw new Error(errorData.message || 'Network response was not ok');
            }

            return response.json();
        },
        onError: (err) => {
            const message = err.message;
            Toast({
                title: 'Error',
                description: 'does not work',
                variant: 'destructive',
            });
        },
        onSuccess: (data) => {
            console.log('Subreddit created:', data);
            router.replace(`/communities/r/${data.name}`); // Use replace instead of push
        }
    });

    return (
        <div className='container flex items-center h-full max-w-3xl mx-auto'>
            <div className='relative bg-white w-full h-fit p-4 rounded-lg space-y-6'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-xl font-semibold'>Create a Community</h1>
                </div>

                <hr className='bg-red-500 h-px' />
                <div>
                    <p className='text-lg font-medium'>Community Name</p>
                    <p className='text-xs pb-2'>Community name cannot be changed</p>

                    <div className='relative'>
                        <p className='absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400'>
                            r/
                        </p>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className='pl-6'
                        />
                    </div>
                </div>
                <div className='flex justify-end gap-4'>
                    <Button variant='ghost' onClick={() => router.back()}>Cancel</Button>
                    <Button
                        disabled={input.length === 0 || isLoading}
                        onClick={() => createCommunity()}>
                        {isLoading ? 'Creating...' : 'Create Community'}
                    </Button>
                </div>
            </div>
        </div>)
}

export default Page