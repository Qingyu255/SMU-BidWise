"use client"
import React, { useState } from 'react';
import { useTimetable } from '../../components/timetableProvider';
import TimetableGeneric from '../../components/timetable/TimetableGeneric';

// interface Professor {
//   id: number;
//   name: string;
//   classes: ClassItem[];
// }

const appStyle: React.CSSProperties = {
  // minWidth: '900px',
  padding: '20px',
  fontFamily: "'Roboto', sans-serif",
  backgroundColor: 'inherit',
};

export default function Page() {
  // const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);

  const { selectedClasses, addClass, removeClass } = useTimetable();
  const selectedClassItems = Array.from(selectedClasses.values());

  // const handleProfessorSelect = (professor: Professor) => {
  //   setSelectedProfessor(professor);
  // };
  const handleClassSelect = (classItem: any) => {
    // here we will only be removing
    console.log("Class selected:", classItem);
    const isSelected = selectedClasses.has(classItem.id);
    if (isSelected) {
      removeClass(classItem);
    } else {
      // addClass(classItem);
      console.warn("attempted to remove classItem not in local storage"); // should not happen ever
    }
  }

  return (
    <div className="App" style={appStyle}>
        {/* delete MyTimetable.tsx soon?*/}
        {/* <MyTimetable/> */}

        {/* to  convert the selectedClasses map (Map<string, ClassItem>) to an array of ClassItem objects, you can use the Array.from() method  */}
        <TimetableGeneric classes={selectedClassItems} onClassSelect={handleClassSelect}/>
      
    </div>
  );
}
