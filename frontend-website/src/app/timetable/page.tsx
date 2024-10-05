"use client"
import React, { useState } from 'react';
import { useTimetable } from '../../components/timetableProvider';
import TimetableGeneric from '../../components/timetable/TimetableGeneric';
import { useToast } from "@/hooks/use-toast";
import { TimetableSummaryTable } from './components/TimetableSummaryTable';
import InfoCard from './components/InfoCard';

export default function Page() {

  const { selectedClasses, addClass, removeClass } = useTimetable();
  const selectedClassItems = Array.from(selectedClasses.values());
  const { toast } = useToast();

  const handleClassSelect = (classItem: any) => {
    // here we will only be removing
    console.log("Class selected:", classItem);
    const isSelected = selectedClasses.has(classItem.id);
    if (isSelected) {
      removeClass(classItem);
      toast({
        title: `Removed ${classItem.courseCode} - ${classItem.section} from Timetable`,
      });
    } else {
      // addClass(classItem);
      console.warn("attempted to remove classItem not in local storage"); // should not happen ever
    }
  }

  return (
    <div>
        <InfoCard/>
        {/* to  convert the selectedClasses map (Map<string, ClassItem>) to an array of ClassItem objects, you can use the Array.from() method  */}
        <TimetableGeneric classes={selectedClassItems} onClassSelect={handleClassSelect}/>
        <TimetableSummaryTable sections={selectedClassItems}/>
    </div>
  );
}
