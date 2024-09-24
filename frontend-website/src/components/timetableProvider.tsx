"use client"
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ClassItem } from '@/types';

interface TimetableContextType {
  selectedClasses: Map<string, ClassItem>;
  addClass: (classItem: any) => void;
  removeClass: (classItem: any) => void;
}

// Create the context
const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

// Create a hook to use the TimetableContext
export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
};

// Create a Provider component
export const TimetableProvider = ({ children }: { children: ReactNode }) => {
  // const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [selectedClasses, setSelectedClasses] = useState<Map<string, ClassItem>>(new Map());

  // load from local strage
  useEffect(() => {
    const savedClasses = localStorage.getItem('selectedClasses');
    if (savedClasses) {
      const parsedClasses = JSON.parse(savedClasses);
      setSelectedClasses(new Map(parsedClasses));
    }
  }, []);

  // save to local storage
  useEffect(() => {
    localStorage.setItem('selectedClasses', JSON.stringify(Array.from(selectedClasses.entries())));
  }, [selectedClasses]);

  const addClass = (classItem: ClassItem) => {
    setSelectedClasses(prev => {
      const updated = new Map(prev);
      updated.set(classItem.id, classItem);
      return updated;
    });
  };

  const removeClass = (classItem: ClassItem) => {
    setSelectedClasses(prev => {
      const updated = new Map(prev);
      updated.delete(classItem.id);
      return updated;
    });
  };

  return (
    <TimetableContext.Provider value={{ selectedClasses, addClass, removeClass }}>
      {children}
    </TimetableContext.Provider>
  );
};
