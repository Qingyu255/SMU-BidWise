import { createClient as createClientSideClient } from '@supabase/supabase-js';

export default function createClient() {
    const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    return createClientSideClient(supabaseUrl, supabaseAnonKey);
}