import { createClient as createClientSideClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClientSideClient> | null = null;
// singleton approach
export default function createClient() {
    if (!supabaseClient) {
        const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        supabaseClient = createClientSideClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseClient;
}