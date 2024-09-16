import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createFetch =
  (options: Pick<RequestInit, "next" | "cache">) =>
  (url: RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, {
      ...init,
      ...options,
    });
  };

export default function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: createFetch({
          next: {
            revalidate: 300,
            tags: ["supabase"],
          },
        }),
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
    // {
    //   cookies: {
    //     getAll() {
    //       return cookieStore.getAll()
    //     },
    //     setAll(cookiesToSet) {
    //       try {
    //         cookiesToSet.forEach(({ name, value, options }) =>
    //           cookieStore.set(name, value, options)
    //         )
    //       } catch {
    //         // The `setAll` method was called from a Server Component.
    //         // This can be ignored if you have middleware refreshing
    //         // user sessions.
    //       }
    //     },
    //   },
    // }
  )
}