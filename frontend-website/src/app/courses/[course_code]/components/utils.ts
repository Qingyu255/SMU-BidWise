export const sortBySection = (sections: any): any[] => {
    return sections.sort((a: any, b: any) => {
      const numA = parseInt(a.section.replace(/^\D+/g, ''), 10);
      const numB = parseInt(b.section.replace(/^\D+/g, ''), 10);
      
      return numA - numB; // Sort by numeric value
    });
  }
