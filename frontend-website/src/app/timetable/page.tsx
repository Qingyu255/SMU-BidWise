"use client"
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { professors } from './data';
import ProfessorList from './professorlist';
import Timetable from './Timetable';
import MyTimetable from './mytimetable';

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
  minWidth: '900px',
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
      <h1>Professor Timetable Selector</h1>
      <ProfessorList professors={professors} onSelect={handleProfessorSelect} />
      {selectedProfessor && (
        <Timetable
          professorClasses={selectedProfessor.classes}
          onClassSelect={handleClassSelect}
        />
      )}
      <MyTimetable selectedClasses={selectedClasses} />
    </div>
  );
}
