"use client";
import React from 'react';
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
  onClassSelect: (e: any) => void;
};

export default function TimetableGeneric({ classes, onClassSelect }: TimetableProps) {
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

  // Convert time to minutes
  const parseTime = (time: string) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 60 + minutes + (seconds || 0); // Convert to minutes
  };

  // Calculate the height of a row in pixels
  const rowHeight = 50; // Height of each hour in pixels

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

    // First, sort the classes by start time
    const sortedClasses = classesForDay.slice().sort((a: any, b: any) => parseTime(a.start_time) - parseTime(b.start_time));

    const overlappingGroups: any = []; // Each group is an array of overlapping classes

    sortedClasses.forEach((classItem: any) => {
      const startTime = parseTime(classItem.start_time);
      const endTime = parseTime(classItem.end_time);

      let addedToGroup = false;

      // Try to add classItem to an existing group
      for (const group of overlappingGroups) {
        // Check if classItem overlaps with any class in the group
        const overlaps = group.some((item: any )=> {
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
    gridTemplateColumns: '80px repeat(5, 1fr)',
    gridTemplateRows: `repeat(${totalRows}, ${rowHeight}px)`,
    position: 'relative',
    border: '1px solid #9e9e9e',
  };

  const timeSlotStyle: React.CSSProperties = {
    borderBottom: '1px solid #9e9e9e',
    borderRight: '1px solid #9e9e9e',
    textAlign: 'center',
    padding: '5px',
    fontWeight: 'bold',
  };

  const dayHeaderStyle: React.CSSProperties = {
    borderBottom: '1px solid #9e9e9e',
    borderRight: '1px solid #9e9e9e',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: '10px',
  };

  const cellStyle: React.CSSProperties = {
    borderBottom: '1px solid #9e9e9e',
    borderRight: '1px solid #9e9e9e',
    position: 'relative',
  };

  const classStyle: React.CSSProperties = {
    border: "1px solid #60696D",
    position: 'absolute',
    left: '0',
    backgroundColor: '#34d399',
    color: 'black',
    borderRadius: '5px',
    padding: '5px',
    overflow: 'hidden',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={timetableStyle}>
        {/* Time Labels */}
        <div style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }} className='border-b-1 border-r-1 border-[#9e9e9e]'></div>
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

        {/* Day Headers */}
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
          <div
            key={`day-${index}`}

            style={{
              gridColumn: `${index + 2} / ${index + 3}`,
              gridRow: '1 / 2',
              ...dayHeaderStyle,
              textTransform: "uppercase"
            }}
          >
            {day.slice(0, 3)}
          </div>
        ))}

        {/* Grid Cells */}
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, dayIndex) =>
          fixedTimeSlots.slice(0, -1).map((_, timeIndex) => (
            <div
              className={`${timeIndex % 2 === 0 && 'bg-gray-300'} bg-opacity-15`}
              key={`cell-${dayIndex}-${timeIndex}`}
              style={{
                gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
                gridRow: `${timeIndex + 2} / ${timeIndex + 3}`,
                ...cellStyle,
              }}
            ></div>
          ))
        )}

        {/* Class Entries */}
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
          const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(day);
          const classesForDay = preparedClasses.filter((classItem) => classItem.dayName === day);

          // Group overlapping classes
          const overlappingGroups = groupOverlappingClasses(classesForDay);

          // For each overlapping group
          return overlappingGroups.map((group: any) => {
            const numOverlaps = group.length;

            return group.map((classItem: any, overlapIndex: any) => (
              <Popover key={classItem.id}>
                <PopoverTrigger
                  style={{
                    ...classStyle,
                    backgroundColor: selectedClasses.has(classItem.id)
                      ? '#bae6fd'
                      : classStyle.backgroundColor,
                    gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
                    gridRow: `2 / span ${totalRows}`,
                    top: `${classItem.topOffset}px`,
                    height: `${classItem.height}px`,
                    width: `${100 / numOverlaps}%`,
                    left: `${(100 / numOverlaps) * overlapIndex}%`,
                  }}
                >
                  <div>
                    {classItem.courseCode && (
                      <div className='font-bold'>{classItem.courseCode}</div>
                    )}
                    <div className='font-semibold'>{classItem.section}</div>
                    <div>{classItem.venue}</div>
                  </div>
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
            ));
          });
        })}
      </div>
    </div>
  );
}



// "use client";
// import React from 'react';
// import { useTimetable } from '../timetableProvider';
// import { ClassItem } from '@/types';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { PopoverClose } from "@radix-ui/react-popover";
// import { Button } from '../ui/button';

// export type TimetableProps = {
//   classes: ClassItem[];
//   onClassSelect: (e: any) => void;
// };

// export default function TimetableGeneric({ classes, onClassSelect }: TimetableProps) {
//   const { selectedClasses } = useTimetable();

//   // Map short form day names to full names used in timetable
//   const dayMapping: { [key: string]: string } = {
//     Mon: 'Monday',
//     Tue: 'Tuesday',
//     Wed: 'Wednesday',
//     Thu: 'Thursday',
//     Fri: 'Friday',
//   };

//   // Define fixed time slots
//   const fixedTimeSlots = [
//     '08:00 - 09:00',
//     '09:00 - 10:00',
//     '10:00 - 11:00',
//     '11:00 - 12:00',
//     '12:00 - 13:00',
//     '13:00 - 14:00',
//     '14:00 - 15:00',
//     '15:00 - 16:00',
//     '16:00 - 17:00',
//     '17:00 - 18:00',
//     '18:00 - 19:00',
//     '19:00 - 20:00',
//     '20:00 - 21:00',
//     '21:00 - 22:00',
//     '22:00 - 23:00',
//   ];

//   // Convert time to a comparable format
//   const parseTimeSlots = (time: string) => {
//     const [hours, minutes] = time.split(':').map(Number);
//     return hours * 60 + minutes; // Convert to minutes
//   };

//   const parseTime = (time: string) => {
//     const [hours, minutes, seconds] = time.split(':').map(Number);
//     return hours * 60 + minutes + (seconds || 0) / 60; // Convert to minutes
//   };

//   // Calculate the height of a row in pixels
//   const rowHeight = 50; // Height of each row in pixels

//   // Initialize timetable structure
//   const timetable: any = fixedTimeSlots.map((time) => ({
//     time,
//     Monday: [],
//     Tuesday: [],
//     Wednesday: [],
//     Thursday: [],
//     Friday: [],
//   }));

//   // Group classes by start time and day
//   const classGroups: { [key: string]: ClassItem[] } = {};

//   // Add classes to timetable and group them by start time and day
//   classes.forEach((classItem: any) => {
//     const startMinutes = parseTime(classItem.start_time);
//     const endMinutes = parseTime(classItem.end_time);

//     // Find relevant time slots for the class
//     fixedTimeSlots.forEach((slot, index) => {
//       const slotStart = parseTimeSlots(slot.split(' - ')[0]);
//       const slotEnd = parseTimeSlots(slot.split(' - ')[1]);

//       // Check if the slot overlaps with the class time
//       if (startMinutes >= slotStart && endMinutes > slotStart && startMinutes < slotEnd) {
//         const timeSlot: any = timetable[index];
//         if (timeSlot) {
//           const dayName = dayMapping[classItem.day];
//           timeSlot[dayName].push({
//             ...classItem,
//             startMinutes,
//             endMinutes,
//             startOffset: (startMinutes - slotStart) / 60,
//             endOffset: (endMinutes - slotStart) / 60,
//           });

//           // Group classes by start time and day
//           const groupKey = `${classItem.start_time}-${classItem.day}`;
//           if (!classGroups[groupKey]) {
//             classGroups[groupKey] = [];
//           }
//           classGroups[groupKey].push(classItem);
//         }
//       }
//     });
//   });

//   // Define styles
//   const tableStyle: React.CSSProperties = {
//     width: '100%',
//     borderCollapse: 'collapse',
//     border: '1px solid #9e9e9e',
//     overflow: 'hidden',
//   };

//   const thStyle: React.CSSProperties = {
//     textAlign: 'center',
//     padding: '15px',
//     border: '1px solid #9e9e9e',
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//   };

//   const tdStyle: React.CSSProperties = {
//     textAlign: 'center',
//     minWidth: '120px',
//     border: '1px solid #9e9e9e',
//     fontSize: '14px',
//     verticalAlign: 'top', // Align content to the top
//     overflow: 'visible',
//     position: 'relative', // Needed for absolute positioning inside
//   };

//   const buttonStyle: React.CSSProperties = {
//     backgroundColor: '#34d399',
//     color: 'black',
//     border: '2px solid #524f4e',
//     padding: '0 5px',
//     borderRadius: '5px',
//     cursor: 'pointer',
//     fontSize: '14px',
//     fontWeight: '500',
//     transition: 'background-color 0.3s ease',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     whiteSpace: 'normal',
//     overflow: 'hidden',
//     textOverflow: 'ellipsis',
//     wordWrap: 'break-word',
//   };

//   return (
//     <div style={{ overflowX: 'auto' }} className='table-auto'>
//       <table style={tableStyle}>
//         <thead>
//           <tr>
//             <th style={thStyle} className='rounded-tl-lg'></th>
//             <th style={thStyle}>Mon</th>
//             <th style={thStyle}>Tue</th>
//             <th style={thStyle}>Wed</th>
//             <th style={thStyle}>Thu</th>
//             <th style={thStyle}>Fri</th>
//           </tr>
//         </thead>
//         <tbody>
//           {fixedTimeSlots.map((slot, rowIndex) => (
//             <tr key={rowIndex} className={`${rowIndex % 2 === 0 && 'bg-gray-300'} bg-opacity-15`}>
//               <td
//                 style={{ ...tdStyle, height: `${rowHeight}px` }}
//                 id="timeRange"
//                 className='px-4 lg:px-0 font-bold bg-white dark:bg-black'
//               >
//                 {slot}
//               </td>
//               {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
//                 const classesInSlot: any[] = timetable[rowIndex][day];

//                 // Calculate the maximum endOffset to determine the required height
//                 const maxEndOffset = Math.max(
//                   ...classesInSlot.map((classItem) => classItem.endOffset || 1),
//                   1 // Default to 1 if classesInSlot is empty
//                 );

//                 // Calculate the required height for the cell
//                 const cellHeight = maxEndOffset * rowHeight;

//                 return (
//                   <td key={day} style={{ ...tdStyle, height: `${cellHeight}px` }}>
//                     <div
//                       style={{
//                         position: 'relative',
//                         height: '100%',
//                         width: '100%',
//                       }}
//                     >
//                       {classesInSlot.map((classItem: any) => {
//                         const { startOffset, endOffset } = classItem;

//                         // Calculate the height and top position
//                         const buttonHeight = (endOffset - startOffset) * rowHeight;
//                         const topPosition = startOffset * rowHeight;

//                         // Get the group of classes starting at the same time and day
//                         const groupKey = `${classItem.start_time}-${classItem.day}`;
//                         const group = classGroups[groupKey];
//                         const totalInGroup = group.length;

//                         // Find the index of the class in its group
//                         const classIndexInGroup = group.findIndex(
//                           (item) => item.id === classItem.id
//                         );

//                         // Calculate width and left position
//                         const buttonWidthPercentage = 100 / totalInGroup;
//                         const leftPosition = `${buttonWidthPercentage * classIndexInGroup}%`;

//                         return (
//                           <Popover key={classItem.id}>
//                             <PopoverTrigger
//                               style={{
//                                 ...buttonStyle,
//                                 backgroundColor: selectedClasses.has(classItem.id)
//                                   ? '#bae6fd'
//                                   : buttonStyle.backgroundColor,
//                                 position: 'absolute',
//                                 top: `${topPosition}px`,
//                                 left: leftPosition,
//                                 width: `${buttonWidthPercentage}%`,
//                                 height: `${buttonHeight}px`,
//                               }}
//                               className='px-2'
//                               disabled={false}
//                             >
//                               <div className='flex flex-col px-1'>
//                                 {('courseCode' in classItem && (
//                                   <div className='font-bold'>{classItem.courseCode}</div>
//                                 ))}
//                                 <div className='font-semibold'>{classItem.section}</div>
//                                 <div>{classItem.venue}</div>
//                               </div>
//                             </PopoverTrigger>
//                             <PopoverContent>
//                               {selectedClasses.has(classItem.id) ? (
//                                 <div className="text-center">
//                                   <h3 className="font-semibold py-2">
//                                     Remove{' '}
//                                     {classItem.courseCode
//                                       ? `${classItem.courseCode} - `
//                                       : ''}
//                                     {classItem.section} from Timetable?
//                                   </h3>
//                                   <PopoverClose asChild>
//                                     <Button
//                                       onClick={async () => {
//                                         await new Promise((resolve) => setTimeout(resolve, 200)); // Wait for 200 ms
//                                         onClassSelect(classItem);
//                                       }}
//                                     >
//                                       Remove
//                                     </Button>
//                                   </PopoverClose>
//                                 </div>
//                               ) : (
//                                 <div className="text-center">
//                                   <h3 className="font-semibold py-2">
//                                     Add {classItem.section} to Timetable?
//                                   </h3>
//                                   <PopoverClose asChild>
//                                     <Button
//                                       onClick={async () => {
//                                         await new Promise((resolve) => setTimeout(resolve, 200)); // Wait for 200 ms
//                                         onClassSelect(classItem);
//                                       }}
//                                     >
//                                       Add
//                                     </Button>
//                                   </PopoverClose>
//                                 </div>
//                               )}
//                             </PopoverContent>
//                           </Popover>
//                         );
//                       })}
//                     </div>
//                   </td>
//                 );
//               })}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// "use client"
// import React from 'react';
// import { useTimetable } from '../timetableProvider';
// import { ClassItem } from '@/types';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { PopoverClose } from "@radix-ui/react-popover";
// import { Button } from '../ui/button';

// export type TimetableProps = {
//   classes: ClassItem[];
//   onClassSelect: (e: any) => void
// }

// export default function TimetableGeneric ({ classes, onClassSelect }: TimetableProps) {
//   const { selectedClasses } = useTimetable();
  
//   // Map short form day names to full names used in timetable
//   const dayMapping: { [key: string]: string } = {
//     Mon: 'Monday',
//     Tue: 'Tuesday',
//     Wed: 'Wednesday',
//     Thu: 'Thursday',
//     Fri: 'Friday',
//   };

//   // Define fixed time slots
//   const fixedTimeSlots = [
//     '08:00 - 09:00',
//     '09:00 - 10:00',
//     '10:00 - 11:00',
//     '11:00 - 12:00',
//     '12:00 - 13:00',
//     '13:00 - 14:00',
//     '14:00 - 15:00',
//     '15:00 - 16:00',
//     '16:00 - 17:00',
//     '17:00 - 18:00',
//     '18:00 - 19:00',
//     '19:00 - 20:00',
//     '20:00 - 21:00',
//     '21:00 - 22:00',
//     '22:00 - 23:00',
//   ];

//   // Convert time to a comparable format
//   const parseTimeSlots = (time: string) => {
//     const [hours, minutes] = time.split(':').map(Number);
//     return hours * 60 + minutes; // Convert to minutes
//   };

//   const parseTime = (time: string) => {
//     const [hours, minutes, seconds] = time.split(':').map(Number);
//     return hours * 60 + minutes + (seconds || 0) / 60; // Convert to minutes
//   };

//   // Calculate the height of a row in pixels
//   const rowHeight = 50; // Height of each row in pixels

//   // Initialize timetable structure
//   const timetable: any = fixedTimeSlots.map((time) => ({
//     time,
//     Monday: [],
//     Tuesday: [],
//     Wednesday: [],
//     Thursday: [],
//     Friday: [],
//   }));

//   // Group classes by start time and day
//   const classGroups: { [key: string]: ClassItem[] } = {};

//   // Add classes to timetable and group them by start time and day
//   classes.forEach((classItem: any) => {
//     const startMinutes = parseTime(classItem.start_time);
//     const endMinutes = parseTime(classItem.end_time);

//     // Find relevant time slots for the class
//     fixedTimeSlots.forEach((slot, index) => {
//       const slotStart = parseTimeSlots(slot.split(' - ')[0]);
//       const slotEnd = parseTimeSlots(slot.split(' - ')[1]);

//       // Check if the slot overlaps with the class time
//       if (startMinutes >= slotStart && endMinutes > slotStart && startMinutes < slotEnd) {
//         const timeSlot: any = timetable[index];
//         if (timeSlot) {
//           const dayName = dayMapping[classItem.day];
//           timeSlot[dayName].push({
//             ...classItem,
//             startMinutes,
//             endMinutes,
//             startOffset: (startMinutes - slotStart) / 60,
//             endOffset: (endMinutes - slotStart) / 60,
//           });

//           // Group classes by start time and day
//           const groupKey = `${classItem.start_time}-${classItem.day}`;
//           if (!classGroups[groupKey]) {
//             classGroups[groupKey] = [];
//           }
//           classGroups[groupKey].push(classItem);
//         }
//       }
//     });
//   });

//   // Define styles
//   const tableStyle: React.CSSProperties = {
//     width: '100%',
//     borderCollapse: 'collapse',
//     border: '1px solid #9e9e9e',
//     overflow: 'hidden',
//   };

//   const thStyle: React.CSSProperties = {
//     textAlign: 'center',
//     padding: '15px',
//     border: '1px solid #9e9e9e',
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//   };

//   const tdStyle: React.CSSProperties = {
//     textAlign: 'center',
//     minWidth: '120px',
//     border: '1px solid #9e9e9e',
//     fontSize: '14px',
//     verticalAlign: 'middle',
//     height: `${rowHeight}px`,
//     overflow: 'visible',
//     position: 'relative', // Ensure absolute positioning works inside td
//   };

//   const buttonStyle: React.CSSProperties = {
//     backgroundColor: '#34d399',
//     color: 'black',
//     border: '2px solid #524f4e',
//     padding: '0 5px',
//     borderRadius: '5px',
//     cursor: 'pointer',
//     fontSize: '14px',
//     fontWeight: '500',
//     transition: 'background-color 0.3s ease',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     whiteSpace: 'normal',
//     overflow: 'hidden',
//     textOverflow: 'ellipsis',
//     wordWrap: 'break-word',
//   };

//   return (
//     <div style={{ overflowX: 'auto' }} className='table-auto'>
//       <table style={tableStyle}>
//         <thead>
//           <tr>
//             <th style={thStyle} className='rounded-tl-lg'></th>
//             <th style={thStyle}>Mon</th>
//             <th style={thStyle}>Tue</th>
//             <th style={thStyle}>Wed</th>
//             <th style={thStyle}>Thu</th>
//             <th style={thStyle}>Fri</th>
//           </tr>
//         </thead>
//         <tbody>
//           {fixedTimeSlots.map((slot, rowIndex) => (
//             <tr key={rowIndex} className={`${rowIndex % 2 === 0 && 'bg-gray-300'} bg-opacity-15`}>
//               <td style={tdStyle} id="timeRange" className='px-4 lg:px-0 font-bold bg-white dark:bg-black'>{slot}</td>
//               {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
//                 const classesInSlot: any[] = timetable[rowIndex][day];

//                 return (
//                   <td key={day} style={tdStyle}>
//                     <div
//                       style={{
//                         display: 'flex',
//                         flexWrap: 'nowrap', // Prevents items from wrapping onto multiple lines
//                         gap: '5px',
//                         justifyContent: 'flex-start', // Aligns items to the start of the container
//                         alignItems: 'flex-start', // Align items at the top
//                         width: '100%', // Ensure the container takes the full width of the <td>
//                         overflowX: 'auto', // Adds a scrollbar if content overflows
//                       }}
//                     >                      
//                         {classesInSlot.map((classItem: any) => {
//                         const { startOffset, endOffset } = classItem;

//                         // Calculate the height of the button
//                         const buttonHeight = (endOffset - startOffset) * rowHeight;

//                         // Get the group of classes starting at the same time and day
//                         const groupKey = `${classItem.start_time}-${classItem.day}`;
//                         const group = classGroups[groupKey];
//                         const totalInGroup = group.length;

//                         // Adjust button width based on the number of classes in the group
//                         const buttonWidthPercentage = 100 / totalInGroup;

//                         return (
//                           <Popover key={classItem.id}>
//                             <PopoverTrigger
//                               style={{
//                                 ...buttonStyle,
//                                 backgroundColor: selectedClasses.has(classItem.id) ? '#bae6fd' : buttonStyle.backgroundColor,
//                                 flex: `0 0 ${buttonWidthPercentage}%`,
//                                 height: `${buttonHeight}px`,
//                               }}
//                               className='px-2'
//                               disabled={false}
//                             >
//                               <div className='flex flex-col px-1'>
//                                 {("courseCode" in classItem && (
//                                   <div className='font-bold'>{classItem.courseCode}</div>
//                                 ))}
//                                 <div className='font-semibold'>{classItem.section}</div>
//                                 <div>{classItem.venue}</div>
//                               </div>
//                             </PopoverTrigger>
//                             <PopoverContent>
//                             {selectedClasses.has(classItem.id) ? (
//                               <div className="text-center">
//                                 <h3 className="font-semibold py-2">Remove {classItem.courseCode? `${classItem.courseCode} - ` : ""}{classItem.section} from Timetable?</h3>
//                                 <PopoverClose asChild>
//                                   <Button onClick={async () => {
//                                     await new Promise(resolve => setTimeout(resolve, 200)); // Wait for 200 ms
//                                     onClassSelect(classItem);
//                                   }}>
//                                     Remove
//                                   </Button>
//                                 </PopoverClose>
//                               </div>
//                             ) : (
//                               <div className="text-center">
//                                 <h3 className="font-semibold py-2">Add {classItem.section} to Timetable?</h3>
//                                 <PopoverClose asChild>
//                                   <Button onClick={async () => {
//                                     await new Promise(resolve => setTimeout(resolve, 200)); // Wait for 200 ms
//                                     onClassSelect(classItem);
//                                   }}>
//                                     Add
//                                   </Button>
//                                 </PopoverClose>
//                               </div>
//                             )}
//                             </PopoverContent>
//                           </Popover>
//                         );
//                       })}
//                     </div>
//                   </td>
//                 );
//               })}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };



// "use client"
// import React, { useState } from 'react';
// import { useTimetable } from '../timetableProvider';
// import { ClassItem } from '@/types';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { PopoverClose } from "@radix-ui/react-popover";
// import { Button } from '../ui/button';

// export type TimetableProps = {
//   classes: ClassItem[];
//   onClassSelect: (e: any) => void
// }


// export default function TimetableGeneric ({ classes, onClassSelect }: TimetableProps) {
//   const { selectedClasses } = useTimetable();
  
//   // Map short form day names to full names used in timetable
//   const dayMapping: { [key: string]: string } = {
//     Mon: 'Monday',
//     Tue: 'Tuesday',
//     Wed: 'Wednesday',
//     Thu: 'Thursday',
//     Fri: 'Friday',
//   };

//   // Define fixed time slots
//   const fixedTimeSlots = [
//     '08:00 - 09:00',
//     '09:00 - 10:00',
//     '10:00 - 11:00',
//     '11:00 - 12:00',
//     '12:00 - 13:00',
//     '13:00 - 14:00',
//     '14:00 - 15:00',
//     '15:00 - 16:00',
//     '16:00 - 17:00',
//     '17:00 - 18:00',
//     '18:00 - 19:00',
//     '19:00 - 20:00',
//     '20:00 - 21:00',
//     '21:00 - 22:00',
//     '22:00 - 23:00',
//   ];

//   // Convert time to a comparable format
//   const parseTimeSlots = (time: string) => {
//     const [hours, minutes] = time.split(':').map(Number);
//     return hours * 60 + minutes; // Convert to minutes
//   };

//   const parseTime = (time: string) => {
//     const [hours, minutes, seconds] = time.split(':').map(Number);
//     return hours * 60 + minutes + seconds / 60; // Convert to minutes
//   };

//   // Calculate the height of a row in pixels
//   const rowHeight = 50; // Height of each row in pixels

//   // Initialize timetable structure
//   const timetable: any = fixedTimeSlots.map((time) => ({
//     time,
//     Monday: [],
//     Tuesday: [],
//     Wednesday: [],
//     Thursday: [],
//     Friday: [],
//   }));

//   type startTimeToNumClassesMapType = { [key: string]: number };

//   const startTimeDateToNumClassesMap: startTimeToNumClassesMapType = {};


//   // Add classes to timetable
//   classes.forEach((classItem: any) => {
//     const startMinutes = parseTime(classItem.start_time);
//     const endMinutes = parseTime(classItem.end_time);
//     console.log(`Class start: ${startMinutes}, end: ${endMinutes}`);


//     // Find relevant time slots for the class
//     fixedTimeSlots.forEach((slot, index) => {
//       const slotStart = parseTimeSlots(slot.split(' - ')[0]);
//       const slotEnd = parseTimeSlots(slot.split(' - ')[1]);

//       // Check if the slot overlaps with the class time
//       if (startMinutes >= slotStart && endMinutes > slotStart && startMinutes < slotEnd) {
//         const timeSlot: any = timetable[index];
//         if (timeSlot) {
//           timeSlot[dayMapping[classItem.day]].push({
//             ...classItem,
//             startMinutes,
//             endMinutes,
//             startOffset: (startMinutes - slotStart) / 60,
//             endOffset: (endMinutes - slotStart) / 60,
            
//           });

//           // add to startTimeToNumClassesMap
//           const slotStartTimeDateString: string = classItem.start_time.toString() + classItem.day;
//           if (slotStartTimeDateString in startTimeDateToNumClassesMap) {
//             startTimeDateToNumClassesMap[slotStartTimeDateString] += 1;
//           } else {
//             startTimeDateToNumClassesMap[slotStartTimeDateString] = 1;
//           }
//         }
//       }
//     });
//   });
//   console.log(startTimeDateToNumClassesMap)

//   const timeSlotWidth = 120; // in px

//   // Define styles
//   const tableStyle: React.CSSProperties = {
//     width: '100%',
//     borderCollapse: 'collapse',
//     border: '1px solid #9e9e9e',
//     overflow: 'hidden',
//   };

//   const thStyle: React.CSSProperties = {
//     textAlign: 'center',
//     padding: '15px',
//     border: '1px solid #9e9e9e',
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//   };

//   const tdStyle: React.CSSProperties = {
//     textAlign: 'center',
//     // padding: '',
//     minWidth: '120px',
//     border: '1px solid #9e9e9e',
//     fontSize: '14px',
//     verticalAlign: 'middle',
//     height: `${rowHeight}px`,
//     overflow: 'visible'
//   };

//   const buttonStyle: React.CSSProperties = {
//     backgroundColor: '#34d399',
//     color: 'black',
//     border: '2px solid #524f4e',
//     padding: '0 5px',
//     borderRadius: '5px',
//     cursor: 'pointer',
//     fontSize: '14px',
//     fontWeight: '500',
//     transition: 'background-color 0.3s ease',
//     position: 'absolute',
//     width: '100%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   };
 
//   return (
//     <div style={{ overflowX: 'auto' }} className='table-auto'>
//       <table style={tableStyle}>
//         <thead>
//           <tr>
//             <th style={thStyle} className='rounded-tl-lg'></th>
//             <th style={thStyle}>Mon</th>
//             <th style={thStyle}>Tue</th>
//             <th style={thStyle}>Wed</th>
//             <th style={thStyle}>Thu</th>
//             <th style={thStyle}>Fri</th>
//           </tr>
//         </thead>
//         <tbody>
//           {fixedTimeSlots.map((slot, rowIndex) => (
//             <tr key={rowIndex} className={`${rowIndex % 2 === 0 && 'bg-gray-300'} bg-opacity-15`}>
//               <td style={tdStyle} id="timeRange" className='px-4 lg:px-0 font-bold bg-white dark:bg-black'>{slot}</td>
//               {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
//                 const classes: any = timetable[rowIndex][day];

//                 return (
//                   <td key={day} style={tdStyle}>
//                     {classes.map((classItem: any, index: number) => {
//                       const { startOffset, endOffset } = classItem;
//                       console.log(classItem);
//                       // Calculate the height of the button
//                       const buttonHeight = (endOffset - startOffset) * rowHeight;
//                       // console.log("classes displayed:", classes);

//                       const multiplier = startTimeDateToNumClassesMap[classItem.start_time + classItem.day]
                      
//                       return (
//                         <Popover key={index}>
//                           <div key={index} style={{ position: 'relative', height: `${rowHeight}px`, width: timeSlotWidth * multiplier, }} className='Z-10'>
//                             {/* <div style={{ position: 'relative'}}> */}
//                               <PopoverTrigger
//                                 style={{
//                                   ...buttonStyle,
//                                   top: `${startOffset * rowHeight}px`,
//                                   left: `${0}px`,
//                                   height: `${buttonHeight}px`,
//                                   backgroundColor: selectedClasses.has(classItem.id) ? '#bae6fd' : buttonStyle.backgroundColor,
//                                   width: timeSlotWidth,
//                                 }}
//                                 className='px-2'
//                                 // onClick={() => (onClassSelect(classItem))}
//                                 disabled={false}
//                               >
//                                 <div className='flex flex-col px-1'>
//                                   {("courseCode" in classItem && (
//                                     <div className='font-bold'>{classItem.courseCode}</div>
//                                   ))}
//                                   <div className='font-semibold'>{classItem.section}</div>
//                                   <div>{classItem.venue}</div>
//                                 </div>
//                               </PopoverTrigger>
//                             {/* </div> */}
//                           </div>
//                           <PopoverContent>
//                             {selectedClasses.has(classItem.id) ? (
//                               <div className="text-center">
//                                 <h3 className="font-semibold py-2">Remove {classItem.courseCode? `${classItem.courseCode} - ` : ""}{classItem.section} from Timetable?</h3>
//                                 <PopoverClose asChild>
//                                   <Button onClick={async () => {
//                                     await new Promise(resolve => setTimeout(resolve, 200)); // Wait for 200 ms
//                                     onClassSelect(classItem);
//                                   }}>
//                                     Remove
//                                   </Button>
//                                 </PopoverClose>
//                               </div>
//                             ) : (
//                               <div className="text-center">
//                                 <h3 className="font-semibold py-2">Add {classItem.section} to Timetable?</h3>
//                                 <PopoverClose asChild>
//                                   <Button onClick={async () => {
//                                     await new Promise(resolve => setTimeout(resolve, 200)); // Wait for 200 ms
//                                     onClassSelect(classItem);
//                                   }}>
//                                     Add
//                                   </Button>
//                                 </PopoverClose>
//                               </div>
//                             )}
//                           </PopoverContent>
//                         </Popover>
//                       );
//                     })}
//                   </td>
//                 );
//               })}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };
