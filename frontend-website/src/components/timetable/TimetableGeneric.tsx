"use client";
import React from 'react';
import { useTimetable } from '../providers/timetableProvider';
import { ClassItem } from '@/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { Button } from '../ui/button';
import { CalendarPlus, CalendarMinus, Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { CardDescription } from '../ui/card';

export type TimetableProps = {
  classes: ClassItem[];
  onClassSelect: (e: any) => void;
  isTimetablePage?: boolean
};

export default function TimetableGeneric({ classes, onClassSelect, isTimetablePage }: TimetableProps) {
  const { selectedClasses } = useTimetable();

  // Map short form day names to full names used in timetable
  const dayMapping: { [key: string]: string } = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
  };

  // Define fixed time slots (hours)
  const fixedTimeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
  ];

  const selectedClassColour = "#bae6fd";
  const unselectedClassColour = "#34d399";

  // Convert time to minutes
  const parseTime = (time: string) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 60 + minutes + (seconds || 0); // Convert to minutes
  };

  // Calculate the height of a row in pixels
  const rowHeight = 50; // Height of cell in pixels

  // Total number of rows in the grid
  const totalRows = fixedTimeSlots.length - 1;

  // Create a mapping from time to vertical position in pixels
  const timeToPosition = (time: string) => {
    const timeMinutes = parseTime(time);
    const startMinutes = parseTime(fixedTimeSlots[0]);
    return ((timeMinutes - startMinutes) / 60) * rowHeight;
  };

  // Prepare classes for rendering
  const preparedClasses = classes.map((classItem) => {
    const dayName = dayMapping[classItem.day];
    return {
      ...classItem,
      dayName,
      topOffset: timeToPosition(classItem.start_time),
      height: ((parseTime(classItem.end_time) - parseTime(classItem.start_time)) / 60) * rowHeight,
    };
  });

  // Helper function to group overlapping classes
  function groupOverlappingClasses(classesForDay: any) {
    // Input: array of classes for a day
    // Output: array of overlapping groups, where each group is an array of overlapping classes

    // sort the classes by start time
    const sortedClasses = classesForDay.slice().sort((a: any, b: any) => parseTime(a.start_time) - parseTime(b.start_time));

    const overlappingGroups: any = []; // Each group is an array of overlapping classes

    sortedClasses.forEach((classItem: any) => {
      const startTime = parseTime(classItem.start_time);
      const endTime = parseTime(classItem.end_time);

      let addedToGroup = false;

      // Try to add classItem to an existing group
      for (const group of overlappingGroups) {
        // Check if classItem overlaps with any class in the group
        const overlaps = group.some((item: any) => {
          const itemStart = parseTime(item.start_time);
          const itemEnd = parseTime(item.end_time);
          return (startTime < itemEnd && endTime > itemStart);
        });

        if (overlaps) {
          group.push(classItem);
          addedToGroup = true;
          break;
        }
      }

      // If not added to any group, create a new group
      if (!addedToGroup) {
        overlappingGroups.push([classItem]);
      }
    });

    return overlappingGroups;
  }

  // Define styles
  const timetableStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '120px repeat(5, minmax(200px, 1fr))', // Set minimum width for each day column
    gridTemplateRows: `50px repeat(${totalRows}, ${rowHeight}px)`, // Added header row height
    position: 'relative',
    padding: '10px 0'
  };

  const timeSlotStyle: React.CSSProperties = {
    border: '1px solid #9e9e9e',
    borderTop: '0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
  };

  const dayHeaderStyle: React.CSSProperties = {
    border: '1px solid #9e9e9e',
    borderLeft: '0px',
    textAlign: 'center',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textTransform: 'uppercase',
  };

  const cellStyle: React.CSSProperties = {
    borderBottom: '1px solid #9e9e9e',
    borderRight: '1px solid #9e9e9e',
    position: 'relative',
  };

  const classStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: unselectedClassColour,
    color: 'black',
    borderRadius: '5px',
    padding: '5px 4px',
    overflow: 'hidden',
    cursor: 'pointer',
  };

  const daysArr: string[]= Object.values(dayMapping)

  return (
    <div>
    <div className='flex flex-row justify-end'>
      <Info className='w-3 h-3 my-auto mr-2 text-sm text-muted-foreground'/>
      {(isTimetablePage) ? (
        <span className='text-sm text-muted-foreground'>
          Click <CalendarMinus className='inline w-3 h-3'/> to remove section from timetable
        </span>
      ) : (
        <span className='text-sm text-muted-foreground'>
          Click <CalendarPlus className='inline w-3 h-3'/> / <CalendarMinus className='inline w-3 h-3'/> to add or remove section from timetable
        </span>
      )}
    </div>
    <div style={{ overflowX: 'auto' }}> {/* Allow horizontal scrolling */}
      <div style={timetableStyle}>
        {/* Fill Time Labels */}
        <div style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }} className='border-1 border-[#9e9e9e]'></div>
        {fixedTimeSlots.slice(0, -1).map((time, index) => (
          <div
            key={`time-${index}`}
            style={{
              gridColumn: '1 / 2',
              gridRow: `${index + 2} / ${index + 3}`,
              ...timeSlotStyle,
            }}
          >
            {`${time} - ${fixedTimeSlots[index + 1]}`}
          </div>
        ))}

        {/* Fill Day Headers */}
        {daysArr.map((day, index) => (
          <div
            key={`day-${index}`}
            style={{
              gridColumn: `${index + 2} / ${index + 3}`,
              gridRow: '1 / 2',
              ...dayHeaderStyle,
            }}
          >
            {day.slice(0, 3)}
          </div>
        ))}

        {/* Fill empty grid Cells */}
        {daysArr.map((day, dayIndex) =>
          fixedTimeSlots.slice(0, -1).map((_, timeIndex) => (
            <div
              key={`cell-${dayIndex}-${timeIndex}`}
              className={`${timeIndex % 2 === 0 ? 'bg-gray-300' : ''} bg-opacity-15`}
              style={{
                gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
                gridRow: `${timeIndex + 2} / ${timeIndex + 3}`,
                ...cellStyle,
              }}
            ></div>
          ))
        )}

        {/* Fill Class Entries */}
        {daysArr.map((day) => {
          const dayIndex = daysArr.indexOf(day);
          const classesForDay = preparedClasses.filter((classItem) => classItem.dayName === day);

          // Group overlapping classes
          const overlappingGroups = groupOverlappingClasses(classesForDay);

          // For each overlapping group
          return overlappingGroups.map((group: any) => {
            const numOverlaps = group.length;

            return group.map((classItem: any, overlapIndex: any) => (
              <div
                style={{
                  ...classStyle,
                  backgroundColor: selectedClasses.has(classItem.id)
                    ? selectedClassColour
                    : classStyle.backgroundColor,
                  borderLeft: selectedClasses.has(classItem.id)
                  ? '6px solid #5A7BB5'
                  : '6px solid #059669',
                  gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
                  gridRow: `2 / span ${totalRows}`,
                  top: `${classItem.topOffset}px`,
                  height: `${classItem.height}px`,
                  width: `${100 / numOverlaps - 0.8}%`,
                  left: `${(100 / numOverlaps) * overlapIndex + 0.3}%`,
                }}
                key={overlapIndex}
              >
                <div className='w-full flex justify-end'>
                  <Popover key={classItem.id}>
                    <PopoverTrigger className='p-1 hover:bg-white hover:bg-opacity-70 rounded-md h-[32px]'>
                      {selectedClasses.has(classItem.id) ? (
                        <CalendarMinus className='text-gray-600'/>
                      ) : (
                        <CalendarPlus className='text-gray-600'/>
                      )}
                    </PopoverTrigger>
                    <PopoverContent>
                      {selectedClasses.has(classItem.id) ? (
                        <div className="text-center">
                          <h3 className="font-semibold py-2">
                            Remove{' '}
                            {classItem.courseCode ? `${classItem.courseCode} - ` : ''}
                            {classItem.section} from Timetable?
                          </h3>
                          <PopoverClose asChild>
                            <Button
                              onClick={async () => {
                                await new Promise((resolve) => setTimeout(resolve, 200));
                                onClassSelect(classItem);
                              }}
                            >
                              Remove
                            </Button>
                          </PopoverClose>
                        </div>
                      ) : (
                        <div className="text-center">
                          <h3 className="font-semibold py-2">
                            Add {classItem.section} to Timetable?
                          </h3>
                          <PopoverClose asChild>
                            <Button
                              onClick={async () => {
                                await new Promise((resolve) => setTimeout(resolve, 200));
                                onClassSelect(classItem);
                              }}
                            >
                              Add
                            </Button>
                          </PopoverClose>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
                <div
                  style={{
                    maxHeight: `${classItem.height -35}px`,
                    overflowY: 'auto'
                  }}
                >
                  {classItem.courseCode && (
                    <div className='font-bold'>{classItem.courseCode}</div>
                  )}
                  <div>
                    <div className='font-bold'>
                      {classItem.section} 
                      <p className='font-semibold text-xs leading-none'>{classItem.instructor}</p>
                    </div>
                    <div className='text-xs lg:text-sm leading-none '>{classItem.venue}</div>
                  </div>
                </div>
              </div>
            ));
          });
        })}
      </div>
      <div className="flex justify-between pb-1">
        <div className="flex items-center space-x-2">
          {(!isTimetablePage) && (
            <Badge variant="outline" className="flex items-center ">
              <div style={{backgroundColor: unselectedClassColour}} className={`w-4 h-4 rounded-sm mr-2`}></div>
              Available
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center">
            <div style={{backgroundColor: selectedClassColour}} className={`w-4 h-4 rounded-sm mr-2`}></div>
            Selected
          </Badge>
        </div>
      </div>
    </div>
    </div>
  );
}
