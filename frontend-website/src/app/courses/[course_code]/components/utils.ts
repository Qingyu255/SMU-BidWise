export const sortBySection = (sections: any): any[] => {
    return sections.sort((a: any, b: any) => {
        const numA = parseInt(a.section.replace(/^\D+/g, ''), 10);
        const numB = parseInt(b.section.replace(/^\D+/g, ''), 10);
        
        return numA - numB; // Sort by numeric value
    });
}

export const groupSections = (sections: any[]): any[] => {
    const groupedSectionsMap = new Map<string, any>();
  
    sections.forEach((section) => {
      // Create a unique key based on fields other than day, start_time, end_time
      const key = `${section.courseCode}_${section.section}_${section.instructor}_${section.venue}_${section.availability?.total_seats}_${section.availability?.reserved_seats}_${section.availability?.available_seats}_${section.availability?.current_enrolled}`;
  
      if (!groupedSectionsMap.has(key)) {
        // Clone the section and initialize arrays for day, start_time, end_time
        groupedSectionsMap.set(key, {
          ...section,
          days: [section.day],
          start_times: [section.start_time],
          end_times: [section.end_time],
        });
      } else {
        // Merge the differing fields into arrays
        const existingSection = groupedSectionsMap.get(key)!;
        existingSection.days.push(section.day);
        existingSection.start_times.push(section.start_time);
        existingSection.end_times.push(section.end_time);
      }
    });
  
    return Array.from(groupedSectionsMap.values());
};