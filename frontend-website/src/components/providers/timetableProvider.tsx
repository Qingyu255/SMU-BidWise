"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { ClassItem } from "@/types";
import { useSupabaseClient } from "@/utils/supabase/authenticated/client";
import { useUser } from "@clerk/nextjs";

interface TimetableContextType {
  selectedClasses: Map<string, ClassItem>;
  addClass: (classItem: ClassItem) => void;
  removeClass: (classItem: ClassItem, isInTimetablePage: boolean) => void;
  updatePlannedBid: (classId: string, bid: number) => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(
  undefined
);

// Hook to allow other components to access the provider
export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error("useTimetable must be used within a TimetableProvider");
  }
  return context;
};

export const TimetableProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded, isSignedIn, user } = useUser();

  const supabase = useSupabaseClient();
  const [selectedClasses, setSelectedClasses] = useState<Map<string, ClassItem>>(
    new Map()
  );
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);

  const upsertTimetable = async (timetableData: ClassItem[]) => {
    if (!user || !supabase) {
      console.warn(
        "upsertTimetable() called without a user or supabase client."
      );
      return;
    }
    const { data, error } = await supabase.from("user_timetables").upsert(
      {
        clerk_user_id: user.id,
        timetable_data: timetableData,
      },
      { onConflict: "clerk_user_id" }
    );

    if (error) {
      console.error("Error upserting timetable data:", error.message);
    } else {
      console.log("Timetable data upserted successfully");
    }
  };

  // Load data on initial mount
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) {
        // Wait for authentication to load
        return;
      }
  
      if (isSignedIn && supabase) {
        // User is signed in, fetch cloud data
        const { data, error } = await supabase
          .from("user_timetables")
          .select("timetable_data")
          .eq("clerk_user_id", user.id)
          .single();
  
        if (error && error.code !== "PGRST116") {
          // Handle error (excluding 'No rows found' error)
          console.error("Error fetching timetable data:", error.message);
          return;
        }
  
        const dbData: ClassItem[] = data?.timetable_data || [];
  
        // Load local data
        const savedClasses = localStorage.getItem("selectedClasses");
        const localData: ClassItem[] = savedClasses
          ? JSON.parse(savedClasses).map(([_, item]: [string, ClassItem]) => item)
          : [];
  
        if (dbData.length === 0 && localData.length > 0) {
          // First login with no cloud data, upsert local data to cloud
          console.log("First login, using local data and saving to cloud...");
          setSelectedClasses(new Map(localData.map((item) => [item.id, item])));
          await upsertTimetable(localData); // Save local data to cloud
        } else {
          // Use cloud data
          setSelectedClasses(new Map(dbData.map((item) => [item.id, item])));
  
          // Update local storage to match cloud data
          localStorage.setItem(
            "selectedClasses",
            JSON.stringify(dbData.map((item) => [item.id, item]))
          );
        }
      } else {
        // User not signed in, load from local storage
        const savedClasses = localStorage.getItem("selectedClasses");
        if (savedClasses) {
          const parsedClasses = JSON.parse(savedClasses);
          setSelectedClasses(
            new Map(
              parsedClasses.map(([_, item]: [string, ClassItem]) => [
                item.id,
                item,
              ])
            )
          );
        } else {
          setSelectedClasses(new Map());
        }
      }
      setIsDataLoaded(true);
      setInitialLoadCompleted(true);
    };
    fetchData();
  }, [isSignedIn, user?.id, isLoaded]);  

  // Save to local storage whenever selectedClasses changes
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem(
        "selectedClasses",
        JSON.stringify(Array.from(selectedClasses.entries()))
      );
    }
  }, [selectedClasses, isDataLoaded]);

  // Upsert to Supabase whenever selectedClasses changes and user is signed in
  useEffect(() => {
    if (isDataLoaded && isSignedIn && initialLoadCompleted) {
      const timetableData = Array.from(selectedClasses.values());
      upsertTimetable(timetableData);
    }
  }, [selectedClasses, isSignedIn, isDataLoaded, initialLoadCompleted]);

  const addClass = (classItem: ClassItem) => {
    setSelectedClasses((prev) => {
      const updated = new Map(prev);
      updated.set(classItem.id, classItem);
      return updated;
    });
  };

  const removeClass = (classItem: ClassItem, isInTimetablePage: boolean) => {
    // we want to remove all sections with the same section code eg. G9 this is important for sections split into multiple timings
    selectedClasses.forEach(selectedClassObj => {
      if (isInTimetablePage) {
        if(selectedClassObj.courseCode === classItem.courseCode && selectedClassObj.section === classItem.section) {
          setSelectedClasses((prev) => {
            const updated = new Map(prev);
            updated.delete(selectedClassObj.id);
            return updated;
          });
        }
      } else if (selectedClassObj.section === classItem.section) {
        // not in timetable page => in course page
        setSelectedClasses((prev) => {
          const updated = new Map(prev);
          updated.delete(selectedClassObj.id);
          return updated;
        });
      }
    })
    

  };

  const updatePlannedBid = (classId: string, bid: number) => {
    setSelectedClasses((prev) => {
      const updated = new Map(prev);
      const classItem = updated.get(classId);
      if (classItem) {
        updated.set(classId, { ...classItem, plannedBid: bid });
      }
      return updated;
    });
  };

  return (
    <TimetableContext.Provider
      value={{ selectedClasses, addClass, removeClass, updatePlannedBid }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

// Cloud saving behaviour Behavior:
// User without an account (using local storage):
// --The user can add timetables, and they are stored locally.

// User logs in for the first time:
// --If the user has local data but no cloud data, the local data is used and saved to the cloud.
// --If the user has no local data, the app starts with an empty timetable.

// User with existing cloud data:
// --Cloud data is always used when the user logs in.
