// TypeScript Function to Convert UTC to SGT

/**
 * Converts a UTC timestamp string to a formatted Singapore Time string.
 * @param utcTimestamp - The UTC timestamp in "YYYY-MM-DD HH:mm:ss.SSSSSS" format.
 * @returns A formatted string in Singapore Time (e.g., "October 26, 2024, 13:22").
 * @throws Will throw an error if the input timestamp is invalid.
 */
export function convertUtcToSGT(utcTimestamp: string): string {
    // Validate the input format using a regular expression
    const utcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\d*$/;
    if (!utcRegex.test(utcTimestamp)) {
        console.warn('Invalid UTC timestamp format. Expected "YYYY-MM-DD HH:mm:ss.SSSSSS".');
        return "-";
    }

    // Step 1: Convert the timestamp to ISO 8601 format
    const isoTimestamp: string = utcTimestamp
        .replace(' ', 'T')            // Replace space with 'T'
        .split('.')[0] + 'Z';         // Truncate microseconds and append 'Z'

    // Step 2: Create a Date object from the ISO timestamp
    const date: Date = new Date(isoTimestamp);

    if (isNaN(date.getTime())) {
        console.warn('Invalid date. Unable to parse the provided timestamp.');
        return "-";
    }

    // Step 3: Define formatting options for Singapore Time
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: 'long',      // Options: 'numeric', '2-digit', 'long', 'short', 'narrow'
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false      // Use 24-hour format; set to true for 12-hour format
    };

    // Step 4: Use Intl.DateTimeFormat to format the date
    const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('en-US', options);
    const sgTime: string = formatter.format(date);

    return sgTime;
}
