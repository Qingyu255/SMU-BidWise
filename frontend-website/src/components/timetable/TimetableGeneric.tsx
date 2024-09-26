"use client"
import React, { useState } from 'react';
import { useTimetable } from '../timetableProvider';
import { ClassItem } from '@/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { Button } from '../ui/button';

export type TimetableProps = {
  classes: ClassItem[];
  onClassSelect: (e: any) => void
}


export default function TimetableGeneric ({ classes, onClassSelect }: TimetableProps) {
  const { selectedClasses } = useTimetable();
  
  // Map short form day names to full names used in timetable
  const dayMapping: { [key: string]: string } = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
  };

  // Define fixed time slots
  const fixedTimeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
    '21:00 - 22:00',
    '22:00 - 23:00',
  ];

  // Convert time to a comparable format
  const parseTimeSlots = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes
  };

  const parseTime = (time: string) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60; // Convert to minutes
  };

  // Calculate the height of a row in pixels
  const rowHeight = 50; // Height of each row in pixels

  // Initialize timetable structure
  const timetable: any = fixedTimeSlots.map((time) => ({
    time,
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  }));

  // Add classes to timetable
  classes.forEach((classItem: any) => {
    const startMinutes = parseTime(classItem.start_time);
    const endMinutes = parseTime(classItem.end_time);
    console.log(`Class start: ${startMinutes}, end: ${endMinutes}`);


    // Find relevant time slots for the class
    fixedTimeSlots.forEach((slot, index) => {
      const slotStart = parseTimeSlots(slot.split(' - ')[0]);
      const slotEnd = parseTimeSlots(slot.split(' - ')[1]);
     

      // Check if the slot overlaps with the class time
      if (startMinutes >= slotStart && endMinutes > slotStart && startMinutes < slotEnd) {
        const timeSlot: any = timetable[index];
        if (timeSlot) {
          timeSlot[dayMapping[classItem.day]].push({
            ...classItem,
            startMinutes,
            endMinutes,
            startOffset: (startMinutes - slotStart) / 60,
            endOffset: (endMinutes - slotStart) / 60,
            
          });
        }
      }
    });
  });

  // Define styles
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '10px 10px 0 0',
    overflow: 'hidden',
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '15px',
    border: '1px solid #9e9e9e',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  };

  const tdStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '0',
    border: '1px solid #9e9e9e',
    fontSize: '14px',
    verticalAlign: 'middle',
    height: `${rowHeight}px`,
    overflow: 'visible'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#34d399',
    color: 'black',
    border: 'none',
    padding: '0 5px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
    position: 'absolute',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
 
  return (
    <div style={{ overflowX: 'auto', padding: '0 10px' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle} className='rounded-tl-lg'></th>
            <th style={thStyle}>Mon</th>
            <th style={thStyle}>Tue</th>
            <th style={thStyle}>Wed</th>
            <th style={thStyle}>Thu</th>
            <th style={thStyle}>Fri</th>
          </tr>
        </thead>
        <tbody>
          {fixedTimeSlots.map((slot, rowIndex) => (
            <tr key={rowIndex} className={`${rowIndex % 2 === 0 && 'bg-gray-300'} bg-opacity-15`}>
              <td style={tdStyle} id="timeRange">{slot}</td>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                const classes: any = timetable[rowIndex][day];

                return (
                  <td key={day} style={tdStyle}>
                    {classes.map((classItem: any, index: number) => {
                      const { startOffset, endOffset } = classItem;

                      // Calculate the height of the button
                      const buttonHeight = (endOffset - startOffset) * rowHeight;
                      // console.log("classes displayed:", classes);
                      return (
                        <Popover key={index}>
                          <div key={index} style={{ position: 'relative', height: `${rowHeight}px` }} className='Z-10'>
                            <PopoverTrigger
                              style={{
                                ...buttonStyle,
                                top: `${startOffset * rowHeight}px`,
                                height: `${buttonHeight}px`,
                                backgroundColor: selectedClasses.has(classItem.id) ? '#bae6fd' : buttonStyle.backgroundColor,
                              }}
                              
                              // onClick={() => (onClassSelect(classItem))}
                              disabled={false}
                            >
                              <div className='flex flex-col px-1'>
                                {("courseCode" in classItem && (
                                  <div className='font-bold'>{classItem.courseCode}</div>
                                ))}
                                <div className='font-semibold'>{classItem.section}</div>
                                <div>{classItem.venue}</div>
                              </div>
                            </PopoverTrigger>
                          </div>
                          <PopoverContent>
                            {selectedClasses.has(classItem.id) ? (
                              <div className="text-center">
                                <h3 className="font-semibold py-2">Remove {classItem.courseCode? `${classItem.courseCode} - ` : ""}{classItem.section} from Timetable?</h3>
                                <PopoverClose asChild>
                                  <Button onClick={async () => {
                                    await new Promise(resolve => setTimeout(resolve, 200)); // Wait for 200 ms
                                    onClassSelect(classItem);
                                  }}>
                                    Remove
                                  </Button>
                                </PopoverClose>
                              </div>
                            ) : (
                              <div className="text-center">
                                <h3 className="font-semibold py-2">Add {classItem.section} to Timetable?</h3>
                                <PopoverClose asChild>
                                  <Button onClick={async () => {
                                    await new Promise(resolve => setTimeout(resolve, 200)); // Wait for 200 ms
                                    onClassSelect(classItem);
                                  }}>
                                    Add
                                  </Button>
                                </PopoverClose>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
