import createClient  from '@/utils/supabase/client';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient();

export const getLatestTerm = async () => {
    const { data: latestTerm, error: latestTermError } = await supabase
      .rpc('get_latest_term') // call the custom rpc supabase sql function
      .single();
  
    if (latestTermError) {
      console.error('Error fetching latest term:', latestTermError.message);
      return null;
    }
    return latestTerm;
  }
