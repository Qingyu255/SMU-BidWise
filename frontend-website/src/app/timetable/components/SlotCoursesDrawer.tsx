'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { COURSE_DAYS, nextHour } from '@/lib/courseSchedule';

type Slot = { day: string; hour: string };
type SlotCourse = {
  id: string;
  course_code: string;
  title: string;
  career: string;
  units: string;
  description: string;
  sections: Array<{ id: string; section: string; start_time: string; end_time: string; instructor: string; venue: string }>;
};

export default function SlotCoursesDrawer({ slot, onClose }: { slot: Slot | null; onClose: () => void }) {
  const day = slot?.day;
  const hour = slot?.hour;
  const [courses, setCourses] = useState<SlotCourse[]>([]);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!day || !hour) return;
    const controller = new AbortController();
    setCourses([]);
    setTerm('');
    setError('');
    setLoading(true);
    fetch(`/api/courses/by-slot?day=${encodeURIComponent(day)}&hour=${encodeURIComponent(hour)}`, { signal: controller.signal })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load courses.');
        return result;
      })
      .then(result => { setCourses(result.courses); setTerm(result.term); })
      .catch(fetchError => { if (fetchError.name !== 'AbortError') setError(fetchError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [day, hour]);

  const dayLabel = COURSE_DAYS.find(day => day.value === slot?.day)?.label || '';
  return <Sheet open={!!slot} onOpenChange={open => { if (!open) onClose(); }}>
    <SheetContent side='right' className='w-full sm:max-w-xl overflow-y-auto'>
      <SheetHeader className='pr-6'>
        <SheetTitle>Courses for {dayLabel}, {slot?.hour}–{slot ? nextHour(slot.hour) : ''}</SheetTitle>
        <SheetDescription>Sections offered during this hour in {term || 'the latest term'}.</SheetDescription>
      </SheetHeader>
      {loading && <p className='py-6 text-sm text-muted-foreground'>Loading courses…</p>}
      {error && <p role='alert' className='py-6 text-sm text-destructive'>{error}</p>}
      {!loading && !error && <div className='mt-5 space-y-4'>
        <p className='text-sm text-muted-foreground'>{courses.length} {courses.length === 1 ? 'course' : 'courses'} found</p>
        {courses.length === 0 && <p className='text-sm'>No sections are offered at this time in the latest term.</p>}
        {courses.map(course => <article key={course.id} className='rounded-lg border p-4 space-y-3'>
          <div>
            <Link href={`/courses/${encodeURIComponent(course.course_code)}`} className='font-semibold hover:underline'>{course.course_code} — {course.title}</Link>
            <p className='text-xs text-muted-foreground'>{course.career} · {course.units} CU</p>
          </div>
          {course.description && <p className='text-sm line-clamp-3'>{course.description}</p>}
          <div className='space-y-2'>
            {course.sections.map(section => <div key={section.id} className='rounded bg-muted px-3 py-2 text-sm'>
              <span className='font-medium'>{section.section}</span> · {section.start_time.slice(0, 5)}–{section.end_time.slice(0, 5)}
              <div className='text-xs text-muted-foreground'>{section.instructor}{section.venue ? ` · ${section.venue}` : ''}</div>
            </div>)}
          </div>
          <Link href={`/courses/${encodeURIComponent(course.course_code)}`} className='inline-block text-sm font-medium underline'>View course and add a section</Link>
        </article>)}
      </div>}
    </SheetContent>
  </Sheet>;
}
