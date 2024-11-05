import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNowStrict } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatDistanceLocale = {
  lessThanXSeconds: 'just now',
  xSeconds: 'just now',
  halfAMinute: 'just now',
  lessThanXMinutes: '{{count}}m',
  xMinutes: '{{count}}m',
  aboutXHours: '{{count}}h',
  xHours: '{{count}}h',
  xDays: '{{count}}d',
  aboutXWeeks: '{{count}}w',
  xWeeks: '{{count}}w',
  aboutXMonths: '{{count}}m',
  xMonths: '{{count}}m',
  aboutXYears: '{{count}}y',
  xYears: '{{count}}y',
  overXYears: '{{count}}y',
  almostXYears: '{{count}}y',
};

function formatDistance(token: string, count: number, options?: any): string {
  options = options || {};
  
  const result = formatDistanceLocale[token as keyof typeof formatDistanceLocale]
    .replace('{{count}}', count.toString());

  if (options.addSuffix) {
    return options.comparison > 0 ? `in ${result}` : (result === 'just now' ? result : `${result} ago`);
  }

  return result;
}

export function formatTimeToNow(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid date'; // Fallback behavior
    }

    const sgDate = formatInTimeZone(date, 'Asia/Singapore', 'yyyy-MM-dd HH:mm:ss');
    return formatDistanceToNowStrict(new Date(sgDate), {
        addSuffix: true,
        locale: {
            ...enUS,
            formatDistance,
        },
    });
}

