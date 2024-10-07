'use client'
import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';
import { useMemo } from 'react';

export function useSupabaseClient() {
  const { session } = useSession();

  const supabaseClient = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options) => {
            if (session) {
                const clerkToken = await session.getToken({ template: 'supabase' });

                if (!clerkToken) {
                    console.error('Clerk JWT token is missing.');
                    return fetch(url, options);
                }
                // console.log('Clerk JWT token fetched');
                const headers = new Headers(options?.headers);
                headers.set('Authorization', `Bearer ${clerkToken}`);
                return fetch(url, {
                    ...options,
                    headers,
                });
            }
            // fallback: proceed without Authorization header // actually session wont be null so idt code will hit here
            return fetch(url, options);
        },
      },
    });
  }, [session]);

  return supabaseClient;
}
