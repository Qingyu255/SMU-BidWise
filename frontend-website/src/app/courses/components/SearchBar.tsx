"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function SearchBar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 700);

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
        replace(`${pathname}?${params.toString()}`);
    }
    return (
        <div>
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input 
                    type="text"
                    placeholder="Search for course code, title, and descriptions"
                    className="pl-10" // add padding to the left for the icon
                    onChange={(e) => {setSearchTerm(e.target.value)}}
                    value={searchTerm}
                />
            </div>
        </div>
    )
}
