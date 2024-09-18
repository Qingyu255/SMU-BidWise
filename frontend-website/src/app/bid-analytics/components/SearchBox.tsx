'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useDebounce } from 'use-debounce';
import { useRouter, usePathname } from 'next/navigation';

export function SearchBox() {
  const apiURL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL
  const router = useRouter();
  const pathname = usePathname();
  const [searchText, setSearchText] = useState<string>("");
  // const [debouncedSearchText] = useDebounce(searchText, 500);
  const [uniqueCourses, setUniqueCourses] = useState<string[]>([])

  useEffect(() => {
      const fetchAllCourseCodes = async () => {
          const response = await fetch(`${apiURL}/uniquecourses`, { next: { revalidate: 86400 } });
          const jsonPayload = await response.json()
          setUniqueCourses(jsonPayload.data)
      }
      fetchAllCourseCodes()
  }, [apiURL])

  const handleSearchInputChange = (value: string) => {
    setSearchText(value);
  }

  const handleCourseSelection = (fullCourseString: string) => {
    const courseCode = fullCourseString.split(":")[0];
    setSearchText("");
    router.push(`${pathname}?courseCode=${courseCode}`);
  }

  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
      <CommandInput placeholder="Search for a Course" onValueChange={handleSearchInputChange}/>
      <CommandList className={`${(searchText.length > 0) ? 'h-[150px]' : 'h-0'}`}>
        {(searchText.length > 0) && (
          <CommandEmpty>No courses found</CommandEmpty>
        )}

        {(uniqueCourses.length > 0) && (
          <CommandGroup heading="Courses">
            {uniqueCourses.map((course, index) => (
              <CommandItem key={index} onSelect={() => {handleCourseSelection(course); console.log("hi")}}>
                <span>{course}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}
  