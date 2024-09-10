import React from 'react';
import { createClient } from '@/utils/supabase/server';

export default async function page() {
    const supabase = createClient();
    const { data: notes } = await supabase.from("notes").select();

    return (
        <>
            <div>
                Hello senior roadmaps
            </div>
            <pre>{JSON.stringify(notes, null, 2)}</pre>
        </>
        
    )
}
