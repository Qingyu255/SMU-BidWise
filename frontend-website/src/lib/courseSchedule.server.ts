import createClient from '@/utils/supabase/server';
import { COURSE_DAYS, COURSE_HOURS, overlapsHour, selectedValues } from './courseSchedule';

export async function getMatchingCourseIds(daysParam?: string, hoursParam?: string) {
  const days = selectedValues(daysParam, COURSE_DAYS.map(day => day.value));
  const hours = selectedValues(hoursParam, COURSE_HOURS);
  if (!days.length && !hours.length) return null;

  const supabase = createClient();
  const { data: termData, error: termError } = await supabase.rpc('get_latest_term').single();
  const term = termData as { id: string; term: string } | null;
  if (termError || !term?.id) throw termError || new Error('Latest term is unavailable');

  const matchingIds = new Set<string>();
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    let query = supabase.from('sections')
      .select('id, course_id, day, start_time, end_time')
      .eq('term', term.id)
      .neq('type', 'EXAM')
      .order('id')
      .range(offset, offset + pageSize - 1);
    if (days.length) query = query.in('day', days);
    const { data, error } = await query;
    if (error) throw error;
    for (const section of data || []) {
      if (!hours.length || hours.some(hour => overlapsHour(section.start_time, section.end_time, hour))) {
        matchingIds.add(section.course_id);
      }
    }
    if (!data || data.length < pageSize) break;
  }
  return [...matchingIds];
}
