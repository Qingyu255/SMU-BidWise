export const COURSE_DAYS = [
  { value: 'Mon', label: 'Monday' },
  { value: 'Tue', label: 'Tuesday' },
  { value: 'Wed', label: 'Wednesday' },
  { value: 'Thu', label: 'Thursday' },
  { value: 'Fri', label: 'Friday' },
] as const;

export const COURSE_HOURS = Array.from({ length: 15 }, (_, index) => {
  const hour = index + 8;
  return `${String(hour).padStart(2, '0')}:00`;
});

export function selectedValues(value: string | undefined, allowed: readonly string[]) {
  return (value || '').split(',').filter(item => allowed.includes(item));
}

export function nextHour(time: string) {
  return `${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`;
}

export function overlapsHour(start: string, end: string, hour: string) {
  const seconds = (time: string) => {
    const [hours = 0, minutes = 0, remainingSeconds = 0] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + remainingSeconds;
  };
  return seconds(start) < seconds(nextHour(hour)) && seconds(end) > seconds(hour);
}
