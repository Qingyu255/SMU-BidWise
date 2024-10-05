"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { ClassItem } from "@/types";
import createClient from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import ConflictModal from "./timetable/ConflictModal";

interface TimetableContextType {
  selectedClasses: Map<string, ClassItem>;
  addClass: (classItem: ClassItem) => void;
  removeClass: (classItem: ClassItem) => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

// hook to allow other files to access provider
export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error("useTimetable must be used within a TimetableProvider");
  }
  return context;
};

export const TimetableProvider = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, user } = useUser();
  const supabase = createClient();
  const [selectedClasses, setSelectedClasses] = useState<Map<string, ClassItem>>(new Map());
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [dbTimetable, setDbTimetable] = useState<ClassItem[]>([]);
  const [localTimetable, setLocalTimetable] = useState<ClassItem[]>([]);

  const areTimetablesEqual = (timetable1: ClassItem[], timetable2: ClassItem[]) => {
    if (timetable1.length !== timetable2.length) {
      return false
    };

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
    if (!user) {
      console.warn("upsertTimetable() is called when clerk user object is null, returning... ");
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

  const handleConflictResolution = async (choice: string) => {
    if (choice === "database") {
      setSelectedClasses(
        new Map(dbTimetable.map((item) => [item.id, item]))
      );
      localStorage.setItem(
        "selectedClasses",
        JSON.stringify(dbTimetable.map((item) => [item.id, item]))
      );
    } else if (choice === "local") {
      setSelectedClasses(
        new Map(localTimetable.map((item) => [item.id, item]))
      );
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

  // try fetch on mount and resolve table data, resolve any conflicts between local storage or cloud
  useEffect(() => {
    const fetchData = async () => {
      if (isSignedIn) {
        // fetch data from the database
        const { data, error } = await supabase
          .from("user_timetables")
          .select("timetable_data")
          .eq("clerk_user_id", user.id)
          .single();

        // const dbData: ClassItem[] = data?.timetable_data || [];
        const dbData: any = data?.timetable_data || [];
        const savedClasses = localStorage.getItem("selectedClasses");
        const localData: ClassItem[] = savedClasses? (
          JSON.parse(savedClasses).map(([_, item]: [string, ClassItem]) => item)
        ) : [];

        if (
          dbData.length > 0 &&
          localData.length > 0 &&
          !areTimetablesEqual(dbData, localData)
        ) {
          // Conflict detected
          setDbTimetable(dbData);
          setLocalTimetable(localData);
          setConflictDetected(true);
        } else if (dbData.length > 0) {
          // Use database data
          setSelectedClasses(
            new Map(dbData.map((item: ClassItem) => [item.id, item]))
          );
          localStorage.setItem(
            "selectedClasses",
            JSON.stringify(Array.from(selectedClasses.entries()))
          );
        } else if (localData.length > 0) {
          // Use local data
          setSelectedClasses(
            new Map(localData.map((item) => [item.id, item]))
          );
          // Upsert local data to database
          await upsertTimetable(localData);
        } else {
          // No data in either place
          setSelectedClasses(new Map());
        }
      } else {
        // User not signed in, load from local storage
        const savedClasses = localStorage.getItem("selectedClasses");
        if (savedClasses) {
          const parsedClasses = JSON.parse(savedClasses);
          setSelectedClasses(
            new Map(parsedClasses.map(([_, item]: [string, ClassItem]) => [item.id, item]))
          );
        } else {
          setSelectedClasses(new Map());
        }
      }
      setIsDataLoaded(true);
    };
    fetchData();
  }, [isSignedIn, user?.id]);

  // Save to local storage whenever selectedClasses changes
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem(
        "selectedClasses",
        JSON.stringify(Array.from(selectedClasses.entries()))
      );
    }
  }, [selectedClasses, isDataLoaded]);

  // upsert to Supabase whenever selectedClasses changes and user is signed in
  useEffect(() => {
    if (isDataLoaded && isSignedIn && !conflictDetected) {
      const timetableData = Array.from(selectedClasses.values());
      upsertTimetable(timetableData);
    }
  }, [selectedClasses, isSignedIn, isDataLoaded, user?.id]);

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

  return (
    <>
      <ConflictModal open={conflictDetected} onResolve={handleConflictResolution} />
      <TimetableContext.Provider
        value={{ selectedClasses, addClass, removeClass }}
      >
        {children}
      </TimetableContext.Provider>
    </>
  );
};
