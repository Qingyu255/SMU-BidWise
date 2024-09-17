"use client"
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the shape of the context state
interface TimetableContextType {
  selectedClasses: Set<string>;
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
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load selected classes from local storage on component mount
    const savedClasses = localStorage.getItem('selectedClasses');
    if (savedClasses) {
      setSelectedClasses(new Set(JSON.parse(savedClasses)));
    }
  }, []);

  useEffect(() => {
    // Save selected classes to local storage whenever they change
    localStorage.setItem('selectedClasses', JSON.stringify(Array.from(selectedClasses)));
  }, [selectedClasses]);

  const addClass = (classItem: any) => {
    setSelectedClasses(prev => new Set(prev).add(classItem.id));
  };

  const removeClass = (classItem: any) => {
    setSelectedClasses(prev => {
      const updated = new Set(prev);
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
