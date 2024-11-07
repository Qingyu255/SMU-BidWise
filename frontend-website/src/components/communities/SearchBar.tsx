'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import { useRouter, usePathname } from 'next/navigation';
import { Users } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command_modified';
import { useOnClickOutside } from 'usehooks-ts';
import createClient from '@/utils/supabase/client';

interface Subreddit {
    id: string;
    name: string;
}

// Type Guard to check if an object is a Subreddit
function isSubreddit(item: unknown): item is Subreddit {
    return (
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'name' in item &&
        typeof (item as any).id === 'string' &&
        typeof (item as any).name === 'string'
    );
}

interface SearchBarProps { }

const SearchBar: FC<SearchBarProps> = () => {
    const [input, setInput] = useState<string>(''); // Controlled input
    const [searchResults, setSearchResults] = useState<Subreddit[]>([]); // Store results locally
    const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for fetch
    const pathname = usePathname();
    const commandRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    useOnClickOutside(commandRef, () => {
        setInput('');
    });

    // Perform the search request
    const fetchSubreddits = async (query: string) => {
        if (!query) return;

        setIsLoading(true); // Set loading state when making the request
        try {
            const { data, error } = await supabase
                .from('subreddit')
                .select('*')
                .ilike('name', `%${query}%`);

            if (error) {
                console.error('Error fetching subreddits:', error);
                setSearchResults([]); // Reset results on error
                return;
            }

            const filteredData = (data as unknown[]).filter(isSubreddit);
            setSearchResults(filteredData); // Set the results from the query
        } catch (error) {
            console.error('Request failed:', error);
        } finally {
            setIsLoading(false); // Stop loading state once the request is done
        }
    };

    // Debounced request
    const debouncedSearch = useCallback(
        debounce((query: string) => fetchSubreddits(query), 300),
        []
    );

    const handleInputChange = (text: string) => {
        setInput(text);
        debouncedSearch(text); // Trigger debounced request
    };

    useEffect(() => {
        setInput('');
    }, [pathname]);

    // Function to handle subreddit selection and redirection
    const handleSubredditSelect = (subredditName: string) => {
        if (subredditName && input) {
            // Log to debug
            console.log("Redirecting to:", subredditName);
            router.push(`/communities/r/${subredditName}`); // Navigate to subreddit page
            setInput(''); // Clear input after navigation
        }
    };

    // Handle backspace case to ensure no redirect happens on an empty input
    useEffect(() => {
        if (input === '') {
            setSearchResults([]); // Reset results when input is cleared
        }
    }, [input]);

    return (
        <Command
            ref={commandRef}
            className="relative rounded-lg border max-w-full z-50 overflow-visible"
        >
            <CommandInput
                onValueChange={handleInputChange} // Controlled input
                value={input}
                className="w-full outline-none border-none focus:border-none focus:outline-none ring-0"
                placeholder="Search communities..."
            />

            {input.length > 0 && (
                <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
                    {isLoading ? (
                        <CommandEmpty>Loading...</CommandEmpty> // Show loading state
                    ) : searchResults.length === 0 ? (
                        <CommandEmpty>No results found.</CommandEmpty> // No results found message
                    ) : (
                        <CommandGroup heading="Communities">
                            {Array.isArray(searchResults) && searchResults.length > 0 ? (
                                searchResults.map((subreddit) => (
                                    <CommandItem
                                        key={subreddit.id}
                                        value={subreddit.name}
                                        onSelect={() => handleSubredditSelect(subreddit.name)} // Subreddit select
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>r/{subreddit.name}</span>
                                    </CommandItem>
                                ))
                            ) : (
                                <CommandEmpty>No results found.</CommandEmpty>
                            )}
                        </CommandGroup>
                    )}
                </CommandList>
            )}
        </Command>
    );
};

export default SearchBar;
