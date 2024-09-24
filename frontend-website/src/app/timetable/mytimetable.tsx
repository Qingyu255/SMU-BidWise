import React, { useState, useEffect } from 'react';
import { useTimetable } from '../../components/timetableProvider';
import { button } from '@nextui-org/react';

const dayMapping: { [key: string]: string } = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
};

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
  if (typeof time !== 'string') {
    console.error('Invalid time format, expected a string in hh:mm format:', time);
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes; // Convert to minutes
};

const parseTime = (time: string) => {
  if (typeof time !== 'string') {
    console.error('Invalid time format, expected a string in hh:mm:ss format:', time);
    return 0;
  }
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 60 + minutes + seconds / 60; // Convert to minutes
};
const rowHeight = 50; // Height of each row in pixels

const MyTimetable: React.FC = () => {
  const { selectedClasses } = useTimetable();
  const [timetable, setTimetable] = useState<any[]>([]);
  console.log(selectedClasses);
 
  // Initialize timetable structure
  useEffect(() => {
    const newTimetable: any = fixedTimeSlots.map((time) => ({
      time,
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    }));

    // Add selected classes to timetable
    selectedClasses.forEach((classItem: any) => {
      const startMinutes = parseTime(classItem.start_time);
      const endMinutes = parseTime(classItem.end_time);

      // Find relevant time slots for the class
      fixedTimeSlots.forEach((slot, index) => {
        const slotStart = parseTimeSlots(slot.split(' - ')[0]);
        const slotEnd = parseTimeSlots(slot.split(' - ')[1]);

        // Check if the slot overlaps with the class time
        if (startMinutes < slotEnd && endMinutes > slotStart) {
          const timeSlot: any = newTimetable[index];
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
    setTimetable(newTimetable);
  }, [selectedClasses])

  // Define styles
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '20px 0',
    // backgroundColor: '#d9d7d7',
    borderRadius: '10px',
    overflow: 'hidden',
    fontFamily: "'Roboto', sans-serif",
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#0056b3',
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const tdStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '0',
    border: '1px solid #9e9e9e',
    fontSize: '14px',
    // color: '#333333',
    verticalAlign: 'middle',
    position: 'relative',
    height: `${rowHeight}px`,
    // height: '100%'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    padding: '0',
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
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Monday</th>
            <th style={thStyle}>Tuesday</th>
            <th style={thStyle}>Wednesday</th>
            <th style={thStyle}>Thursday</th>
            <th style={thStyle}>Friday</th>
          </tr>
        </thead>
        <tbody>
        {fixedTimeSlots.map((slot, rowIndex) => (
            <tr key={rowIndex}>
              <td style={tdStyle}>{slot}</td>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                 const classes = timetable[rowIndex] ? timetable[rowIndex][day] : []

                return (
                  <td key={day} style={tdStyle}>
                    {classes.map((classItem: any, index: number) => {
                      const { startOffset, endOffset } = classItem;
                         // Calculate the height of the button
                         const buttonHeight = (endOffset - startOffset) * rowHeight;
                 
                      return (
                        <div key={index} style={{ position: 'relative', height: '50px' }}>
                          <div
                            style={{
                              ...buttonStyle,
                              top: `${startOffset * rowHeight}px`,
                              height: `${buttonHeight}px`,
                              backgroundColor: '#28a745', // Set desired color here
                            }}
                          >
                            {classItem.name}
                          </div>
                        </div>
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

export default MyTimetable;
