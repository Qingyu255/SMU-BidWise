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
import { useTimetable } from '@/components/providers/timetableProvider';
import Link from 'next/link';

export function SearchBox() {
  const apiURL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL
  const router = useRouter();
  const pathname = usePathname();
  const [searchText, setSearchText] = useState<string>("");
  // const [debouncedSearchText] = useDebounce(searchText, 500);
  const [uniqueCourses, setUniqueCourses] = useState<string[]>([]);
  const [showTimetableClasses, setShowTimetableClasses] = useState(false);

  const { selectedClasses } = useTimetable();

  const selectedClassObjArr = Array.from(selectedClasses.values());
  const selectedClassCodeArr = [...new Set(selectedClassObjArr.map(obj => obj.courseCode))];

  useEffect(() => {
      const fetchAllCourseCodes = async () => {
          const response = await fetch(`${apiURL}/uniquecourses`);
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
      <CommandInput 
        placeholder="Search for a Course" 
        onValueChange={handleSearchInputChange}
        onFocus={() => setShowTimetableClasses(true)}
        onBlur={() => {
          setTimeout(() => setShowTimetableClasses(false), 100)
        }} // when click outside, added delay to if onselect needs to be called, onBlur wont come into play immediately
      />

      {/* show items in timetable if any */}
      {(showTimetableClasses && (searchText.length === 0) && selectedClassCodeArr.length > 0) && (
        <CommandList>
          <CommandGroup heading="Courses in your timetable:">
            {selectedClassCodeArr.map((courseCode, index) => (
              <a key={index} href={`${pathname}?courseCode=${courseCode}`}>
                <CommandItem onSelect={() => {handleCourseSelection(courseCode + ":"); setShowTimetableClasses(false);}}>
                  <span>{courseCode}</span>
                </CommandItem>
              </a>
            ))}
          </CommandGroup>
        </CommandList>
      )}

      <CommandList className={`${(searchText.length > 0) ? 'h-[150px]' : 'h-0'}`}>
        {(searchText.length > 0) && (
          <CommandEmpty>No courses found</CommandEmpty>
        )}

        {(uniqueCourses.length > 0) && (
          <CommandGroup heading="Courses">
            {uniqueCourses.map((course, index) => (
              <a key={index} href={`${pathname}?courseCode=${course.split(":")[0]}`}>
                <CommandItem key={index} onSelect={() => {handleCourseSelection(course)}}>
                  <span>{course}</span>
                </CommandItem>
              </a>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}
  