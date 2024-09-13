import React from 'react';
import { CircleAlert } from 'lucide-react';
import { Card, CardTitle } from "@/components/ui/card";

export default function NoResultCard({searchString, searchCategory}: {searchString?: string, searchCategory?: string}) {
    return (
        <Card className='flex flex-col p-5 mx-2'>
            <div className='flex justify-center'>
                <CircleAlert/>
            </div>
            <div className='pt-2 text-base sm:text-lg'>
                {searchString && (
                    <CardTitle className='text-center'>No search results for: {searchString}</CardTitle>
                )}
                {searchCategory && (
                    <CardTitle className='text-center'>No {searchCategory} found</CardTitle>
                )}
                {!searchCategory && !searchString && (
                    <CardTitle className='text-center'>No search results</CardTitle>
                )}
            </div>
            <div>{searchString}</div>
        </Card>
    )
}
