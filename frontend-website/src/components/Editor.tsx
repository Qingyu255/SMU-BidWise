'use client'
import { FC, useCallback, useRef, useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useForm } from 'react-hook-form'
import { PostCreationRequest, PostValidator } from '@/lib/validators/post'
import { zodResolver } from '@hookform/resolvers/zod';
import type EditorJS from '@editorjs/editorjs'
import { toast } from '@/hooks/use-toast'
import createClient from '@/utils/supabase/client'
import { useUser } from '@clerk/clerk-react'
import { useRouter } from 'next/navigation'


interface EditorProps {
    subredditId: string
    subredditName: string
}

const Editor: FC<EditorProps> = ({ subredditId, subredditName }) => {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PostCreationRequest>({
        resolver: zodResolver(PostValidator),
        defaultValues: {
            subredditId,
            title: '',
            content: null,
        },
    })

    const ref = useRef<EditorJS>()
    const [isMounted, setIsMounted] = useState<boolean>(false)
    const _titleRef = useRef<HTMLTextAreaElement>(null)
    const supabase = createClient(); // Create a Supabase client
    const { user, isLoaded, isSignedIn } = useUser(); // Extract user data and loading states

    useEffect(() => {
        const setupChannel = async () => {
            const channel = supabase.channel('schema-db-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'post'
                }, (payload) => console.log('Post created:', payload))
                .subscribe((status) => {
                    console.log('Channel subscribed with status:', status);
                });
            return channel;
        }

        if (isLoaded && isSignedIn && user) {
            setupChannel(); // Setup channel when user is ready
        }
    }, [isLoaded, isSignedIn, user, supabase]);

    async function createPostWithSupabase(payload: PostCreationRequest) {
        const { title, content, subredditId } = payload;

        const { data, error } = await supabase
            .from('post') 
            .insert([{ title, content, subreddit_id: subredditId, author_clerk: user?.id }]); // Adjust to match your database schema

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    const initializeEditor = useCallback(async () => {
        const EditorJS = (await import('@editorjs/editorjs')).default;
        const Header = (await import('@editorjs/header')).default;
        const Embed = (await import('@editorjs/embed')).default;
        const Table = (await import('@editorjs/table')).default;
        const List = (await import('@editorjs/list')).default;
        const Code = (await import('@editorjs/code')).default;
        const InlineCode = (await import('@editorjs/inline-code')).default;

        if (!ref.current) {
            const editor = new EditorJS({
                holder: 'editor',
                onReady() {
                    ref.current = editor;
                },
                placeholder: 'Type here to write your post...',
                inlineToolbar: true,
                data: { blocks: [] },
                tools: {
                    header: Header,
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    table: Table,
                    embed: Embed,
                },
                minHeight: 0,
                defaultBlock: 'paragraph',
            });
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMounted(true)
        }
    }, [])

    useEffect(() => {
        if (Object.keys(errors).length) {
            console.log('Validation errors:', errors);
            for (const [_key, value] of Object.entries(errors)) {
                value
                toast({
                    title: 'Something went wrong.',
                    description: (value as { message: string }).message,
                    variant: 'destructive',
                })
            }
        }
    }, [errors])

    useEffect(() => {
        const init = async () => {
            await initializeEditor()

            setTimeout(() => {
                _titleRef?.current?.focus()
            }, 0
            )
        }

        if (isMounted) {
            init()

            return () => {
                ref.current?.destroy()
                ref.current = undefined
            }
        }
    }, [isMounted, initializeEditor])



    async function onSubmit(data: PostCreationRequest) {
        console.log("Submitted data:", data); // Log the submitted data
        const blocks = await ref.current?.save()

        if (!blocks) {
            toast({
                title: 'Error',
                description: 'Failed to save editor content',
                variant: 'destructive',
            });
            return; // Prevent further execution if blocks are invalid
        }

        const payload: PostCreationRequest = {
            title: data.title.trim() as string,
            content: JSON.stringify(blocks), // Serialize blocks to JSON string
            subredditId,
        }
        try {
            await createPostWithSupabase(payload);
            toast({
                description: 'Your post has been published.',
            });
            router.push(`/communities/r/${subredditName}`); // Redirect after successful post creation
        } catch (error) {
            toast({
                title: 'Something went wrong.',
                description: (error as Error).message,
                variant: 'destructive',
            });
        }
    }

    const { ref: titleRef, ...rest } = register('title')
    return (
        <>
            <style jsx global>{`
            .codex-editor {
                position: relative;
                box-sizing: border-box;
                width: 100%;
            }

            .codex-editor__redactor {
                padding-bottom: 0 !important;
                margin-right: 0 !important;
                margin-left: 0 !important;
            }

            .ce-block__content {
                max-width: 100% !important;
                margin: 0;
                width: 100% !important;
            }

            .ce-toolbar__content {
                max-width: 100% !important;
                width: 100% !important;
            }

            .ce-toolbar__actions {
                right: 0 !important;
            }

            .ce-paragraph {
                width: 100% !important;
                padding: 0 !important;
            }
        `}</style>
            <div className='w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
                <form id='subreddit-post-form'
                    className='w-full'
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className='prose prose-strong dark:prose-invert'>
                        <TextareaAutosize
                            {...rest}
                            ref={(e) => {
                                //@ts-ignore
                                _titleRef.current = e; // Use callback to assign
                                titleRef(e); // Call react-hook-form's ref function
                            }}
                            placeholder='Title'
                            className='w-full resize-none appearance-none overflow-hidden bg-transparent text-4xl font-bold focus:outline-none'
                        />

                        <div
                            id='editor' className='min-h-[100px] w-full' style={{ width: '100%' }}
                        />
                    </div>
                </form>

            </div>
        </>)

}

export default Editor