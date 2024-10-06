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
import ConflictModal from "../timetable/ConflictModal";

interface TimetableContextType {
  selectedClasses: Map<string, ClassItem>;
  addClass: (classItem: ClassItem) => void;
  removeClass: (classItem: ClassItem) => void;
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
  const [conflictDetected, setConflictDetected] = useState(false);
  const [dbTimetable, setDbTimetable] = useState<ClassItem[]>([]);
  const [localTimetable, setLocalTimetable] = useState<ClassItem[]>([]);

  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);

  const areTimetablesEqual = (
    timetable1: ClassItem[],
    timetable2: ClassItem[]
  ) => {
    if (timetable1.length !== timetable2.length) {
      return false;
    }

    const map1 = new Map(timetable1.map((item) => [item.id, item]));
    const map2 = new Map(timetable2.map((item) => [item.id, item]));

    for (let [id, item] of map1) {
      const item2 = map2.get(id);
      if (!item2 || JSON.stringify(item) !== JSON.stringify(item2)) {
        return false;
      }
    }
    return true;
  };

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
        // User is signed in, always use cloud data
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

        if (
          localData.length > 0 &&
          !areTimetablesEqual(dbData, localData)
        ) {
          // Conflict detected
          setDbTimetable(dbData);
          setLocalTimetable(localData);
          setConflictDetected(true);
        } else {
          // No conflict, use cloud data
          setSelectedClasses(new Map(dbData.map((item) => [item.id, item])));
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
    if (isDataLoaded && isSignedIn && !conflictDetected && initialLoadCompleted) {
      const timetableData = Array.from(selectedClasses.values());
      upsertTimetable(timetableData);
    }
  }, [selectedClasses, isSignedIn, isDataLoaded, conflictDetected, initialLoadCompleted]);

  const addClass = (classItem: ClassItem) => {
    setSelectedClasses((prev) => {
      const updated = new Map(prev);
      updated.set(classItem.id, classItem);
      return updated;
    });
  };

  const removeClass = (classItem: ClassItem) => {
    setSelectedClasses((prev) => {
      const updated = new Map(prev);
      updated.delete(classItem.id);
      return updated;
    });
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

  const handleConflictResolution = async (choice: string) => {
    if (choice === "database") {
      setSelectedClasses(new Map(dbTimetable.map((item) => [item.id, item])));
      localStorage.setItem(
        "selectedClasses",
        JSON.stringify(dbTimetable.map((item) => [item.id, item]))
      );
    } else if (choice === "local") {
      setSelectedClasses(new Map(localTimetable.map((item) => [item.id, item])));
      await upsertTimetable(localTimetable);
    } else if (choice === "merge") {
      const mergedTimetable = mergeTimetables(dbTimetable, localTimetable);
      setSelectedClasses(
        new Map(mergedTimetable.map((item) => [item.id, item]))
      );
      await upsertTimetable(mergedTimetable);
    }
    setConflictDetected(false);
  };

  const mergeTimetables = (
    dbTimetable: ClassItem[],
    localTimetable: ClassItem[]
  ) => {
    const mergedMap = new Map<string, ClassItem>();

    dbTimetable.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    localTimetable.forEach((item) => {
      mergedMap.set(item.id, item); // Overwrites duplicates with local data
    });

    return Array.from(mergedMap.values());
  };

  return (
    <>
      <ConflictModal
        open={conflictDetected}
        onResolve={handleConflictResolution}
      />
      <TimetableContext.Provider
        value={{ selectedClasses, addClass, removeClass, updatePlannedBid }}
      >
        {children}
      </TimetableContext.Provider>
    </>
  );
};


// intended cloud saving logic:

// -If the user is signed in:
// --Fetch cloud data from Supabase.
// --Load local data from localStorage.
// --Compare the two datasets.
// --If they differ and local data exists, trigger conflict detection.
// --If no conflict, use cloud data and update local storage.

// -If the user is not signed in:
// --Load local data from localStorage.
