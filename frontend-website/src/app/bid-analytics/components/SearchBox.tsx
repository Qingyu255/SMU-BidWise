"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { useTimetable } from "@/components/providers/timetableProvider";

function parseCourse(value: string) {
  const separator = value.indexOf(":");
  return separator < 0
    ? { code: value.trim(), name: "" }
    : {
        code: value.slice(0, separator).trim(),
        name: value.slice(separator + 1).trim(),
      };
}

export function SearchBox() {
  const router = useRouter();
  const { selectedClasses } = useTimetable();
  const [courses, setCourses] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_ANALYTICS_API_URL;

  useEffect(() => {
    const controller = new AbortController();
    if (apiUrl) {
      fetch(`${apiUrl}/uniquecourses`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((payload: { data?: string[] }) => setCourses(payload.data || []))
        .catch(() => {});
    }
    return () => controller.abort();
  }, [apiUrl]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const timetableCodes = useMemo(
    () => [
      ...new Set(
        Array.from(selectedClasses.values())
          .map((item) => item.courseCode)
          .filter((code): code is string => Boolean(code)),
      ),
    ],
    [selectedClasses],
  );
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized)
      return timetableCodes
        .map(
          (code) =>
            courses.find((course) => parseCourse(course).code === code) || code,
        )
        .slice(0, 6);
    return courses
      .filter((course) => course.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [courses, query, timetableCodes]);

  function choose(value: string) {
    const { code } = parseCourse(value);
    setQuery("");
    setOpen(false);
    if (code)
      router.push(`/bid-analytics?courseCode=${encodeURIComponent(code)}`);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-slate-900 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus-within:ring-blue-950">
        <Search
          className="h-4 w-4 shrink-0 text-blue-600"
          aria-hidden="true"
        />
        <input
          type="search"
          role="combobox"
          aria-label="Search courses by code or name"
          aria-expanded={open && matches.length > 0}
          aria-controls="bid-course-results"
          aria-autocomplete="list"
          placeholder="Search by course code or name"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) =>
                Math.min(index + 1, matches.length - 1),
              );
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            }
            if (event.key === "Enter" && open && matches[activeIndex]) {
              event.preventDefault();
              choose(matches[activeIndex]);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
        />
      </div>
      {open && (query || matches.length > 0) && (
        <div
          id="bid-course-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 text-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {query ? "Matching courses" : "In your timetable"}
          </p>
          {matches.length === 0 ? (
            <p className="px-3 py-5 text-sm text-slate-500">
              No courses found. Try a different code or name.
            </p>
          ) : (
            matches.map((course, index) => {
              const { code, name } = parseCourse(course);
              return (
                <button
                  key={`${code}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(course)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition ${index === activeIndex ? "bg-blue-50 dark:bg-blue-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{code}</span>
                    {name && (
                      <span className="block truncate text-xs text-slate-500">
                        {name}
                      </span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
