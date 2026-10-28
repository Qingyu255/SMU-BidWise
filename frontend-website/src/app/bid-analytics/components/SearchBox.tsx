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
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/30 bg-white px-4 text-slate-900 shadow-xl shadow-black/15 transition focus-within:ring-4 focus-within:ring-cyan-400/30 sm:h-16 sm:px-5">
        <Search
          className="h-5 w-5 shrink-0 text-indigo-500"
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
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 sm:text-base"
        />
        <span className="hidden text-xs font-semibold text-slate-400 sm:inline">
          Search courses
        </span>
      </div>
      {open && (query || matches.length > 0) && (
        <div
          id="bid-course-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl shadow-slate-950/20"
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
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${index === activeIndex ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
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
