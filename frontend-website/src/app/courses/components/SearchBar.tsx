"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useTransition } from 'react';
import { Spinner } from '@nextui-org/react';

export default function SearchBar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 100);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (debouncedSearchTerm !== null) {
            handleSearch(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm]);

    function handleSearch(term: string) {
        console.log("search text: " + term);
        const params = new URLSearchParams(searchParams);
        
        // Remove the 'page' query parameter on each new search
        if (params.has('page')) {
            params.delete('page');
        }

        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        })
    }
    return (
        <div>
            <div className="relative w-full">
                {isPending ? (
                    <Spinner className="absolute left-3 top-1/2 transform -translate-y-1/2" color='default'/>
                ) : (
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                )}
                
                <Input
                    type="text"
                    placeholder="Search for course code, title, and descriptions"
                    className="pl-11 py-5" // add padding to the left for the icon
                    onChange={(e) => {setSearchTerm(e.target.value)}}
                    value={searchTerm}
                />
            </div>
        </div>
    )
}
