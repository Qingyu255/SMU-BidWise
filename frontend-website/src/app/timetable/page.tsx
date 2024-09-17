"use client"
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Timetable from '../courses/[course_code]/Timetable';
import MyTimetable from './mytimetable';
import { TimetableProvider } from '../courses/[course_code]/TimetableContext';
// Define types for your state
interface ClassItem {
  id: number;
  name: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  time: string;
}

interface Professor {
  id: number;
  name: string;
  classes: ClassItem[];
}

const appStyle: React.CSSProperties = {
  // minWidth: '900px',
  padding: '20px',
  fontFamily: "'Roboto', sans-serif",
  backgroundColor: 'inherit',
};

export default function Page() {
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<ClassItem[]>([]);

  const handleProfessorSelect = (professor: Professor) => {
    setSelectedProfessor(professor);
  };

  const handleClassSelect = (classItem: ClassItem) => {
    setSelectedClasses((prevClasses) => [...prevClasses, classItem]);
  };

  return (
    <div className="App" style={appStyle}>
      <TimetableProvider>
        <MyTimetable/>
      </TimetableProvider>
   
      
    </div>
  );
}
