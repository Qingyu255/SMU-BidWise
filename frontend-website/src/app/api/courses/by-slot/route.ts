import { NextRequest, NextResponse } from 'next/server';
import createClient from '@/utils/supabase/server';
import { COURSE_DAYS, COURSE_HOURS, nextHour } from '@/lib/courseSchedule';

export async function GET(request: NextRequest) {
  const day = request.nextUrl.searchParams.get('day') || '';
  const hour = request.nextUrl.searchParams.get('hour') || '';
  if (!COURSE_DAYS.some(item => item.value === day) || !COURSE_HOURS.includes(hour)) {
    return NextResponse.json({ error: 'Invalid day or time.' }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { data: termData, error: termError } = await supabase.rpc('get_latest_term').single();
    const term = termData as { id: string; term: string } | null;
    if (termError || !term?.id) throw termError || new Error('Latest term is unavailable');

    const sections: Array<{ course_id: string; id: string; section: string; day: string; start_time: string; end_time: string; instructor: string; venue: string }> = [];
    const pageSize = 1000;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from('sections')
        .select('course_id, id, section, day, start_time, end_time, instructor, venue')
        .eq('term', term.id)
        .neq('type', 'EXAM')
        .eq('day', day)
        .lt('start_time', nextHour(hour))
        .gt('end_time', hour)
        .order('id')
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      sections.push(...(data || []));
      if (!data || data.length < pageSize) break;
    }

    if (!sections.length) return NextResponse.json({ term: term.term, courses: [] });
    const courseIds = [...new Set(sections.map(section => section.course_id))];
    const { data: courses, error: courseError } = await supabase.from('course_info')
      .select('id, course_code, title, career, units, description, enrolment_requirements')
      .in('id', courseIds)
      .order('course_code');
    if (courseError) throw courseError;

    const courseAreas = new Map<string, Set<string>>();
    for (let index = 0; index < courseIds.length; index += 100) {
      for (let offset = 0; ; offset += pageSize) {
        const { data: areas, error: areaError } = await supabase.from('course_areas')
          .select('course_id, area_name')
          .in('course_id', courseIds.slice(index, index + 100))
          .order('course_id')
          .order('area_name')
          .range(offset, offset + pageSize - 1);
        if (areaError) throw areaError;
        for (const area of areas || []) {
          if (!courseAreas.has(area.course_id)) courseAreas.set(area.course_id, new Set());
          if (area.area_name) courseAreas.get(area.course_id)!.add(area.area_name);
        }
        if (!areas || areas.length < pageSize) break;
      }
    }

    return NextResponse.json({
      term: term.term,
      courses: (courses || []).map(course => ({
        ...course,
        areas: [...(courseAreas.get(course.id) || [])].sort((a, b) => a.localeCompare(b)),
        sections: sections.filter(section => section.course_id === course.id)
          .sort((a, b) => a.start_time.localeCompare(b.start_time) || a.section.localeCompare(b.section)),
      })),
    });
  } catch (error) {
    console.error('Error loading courses for timetable slot:', error);
    return NextResponse.json({ error: 'Could not load courses for this time slot.' }, { status: 500 });
  }
}
