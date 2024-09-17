import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the shape of the context state
interface TimetableContextType {
  selectedClasses: any[];
  addClass: (classItem: any) => void;
  removeClass: (classItem: any) => void;
}

// Create the context
const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

// Create a hook to use the TimetableContext
export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error("useTimetable must be used within a TimetableProvider");
  }
  return context;
};

// Create a Provider component
export const TimetableProvider = ({ children }: { children: ReactNode }) => {
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);

  useEffect(() => {
    // Load selected classes from local storage on component mount
    const savedClasses = localStorage.getItem('selectedClasses');
    if (savedClasses) {
      setSelectedClasses(JSON.parse(savedClasses));
    }
  }, []);

  useEffect(() => {
    // Save selected classes to local storage whenever they change
    localStorage.setItem('selectedClasses', JSON.stringify(selectedClasses));
  }, [selectedClasses]);

  const addClass = (classItem: any) => {
    setSelectedClasses((prevClasses) => [...prevClasses, classItem]);
  };

  const removeClass = (classItem: any) => {
    setSelectedClasses((prevClasses) =>
      prevClasses.filter((c) => c.section !== classItem.section)
    );
  };

  return (
    <TimetableContext.Provider value={{ selectedClasses, addClass, removeClass }}>
      {children}
    </TimetableContext.Provider>
  );
};
