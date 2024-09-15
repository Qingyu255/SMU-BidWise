import React, { useState } from 'react';

const Timetable = ({ professorClasses, onClassSelect }: any) => {
  const [selectedClasses, setSelectedClasses] = useState(new Set());

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
  ];

  // Convert time to a comparable format
  const parseTimeSlots = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes; // Convert to minutes
  };

  const parseTime = (time: string) => {
    const [hours, minutes,seconds] = time.split(':').map(Number);
    return hours * 60 + minutes +seconds/60; // Convert to minutes
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
  professorClasses.forEach((classItem: any) => {
    const startMinutes = parseTime(classItem.start_time);
    const endMinutes = parseTime(classItem.end_time);
    
    // Find relevant time slots for the class
    fixedTimeSlots.forEach((slot, index) => {
      const slotStart = parseTimeSlots(slot.split(' - ')[0]);
      const slotEnd = parseTimeSlots(slot.split(' - ')[1]);
      
      // Check if the slot overlaps with the class time
      if (startMinutes < slotEnd && endMinutes > slotStart) {
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
    margin: '20px 0',
    backgroundColor: '#ffffff',
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
    border: '1px solid #e0e0e0',
    fontSize: '14px',
    color: '#333333',
    verticalAlign: 'middle',
    position: 'relative',
    height: `${rowHeight}px`,
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

  const buttonHoverStyle: React.CSSProperties = {
    backgroundColor: '#218838',
  };

  const handleClassSelect = (classItem: any) => {
    if (!selectedClasses.has(classItem.id)) { // Assuming classItem has a unique `id`
      setSelectedClasses(new Set(selectedClasses.add(classItem.id)));
      onClassSelect(classItem);
    }
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
                const classes: any = timetable[rowIndex][day];

                return (
                  <td key={day} style={tdStyle}>
                    {classes.map((classItem: any, index: number) => {
                      const { startOffset, endOffset } = classItem;

                      // Calculate the height of the button
                      const buttonHeight = (endOffset - startOffset) * rowHeight;

                      return (
                        <div key={index} style={{ position: 'relative', height: `${rowHeight}px` }}>
                          <button
                            style={{
                              ...buttonStyle,
                              top: `${startOffset * rowHeight}px`,
                              height: `${buttonHeight}px`,
                              backgroundColor: selectedClasses.has(classItem.id) ? '#6c757d' : buttonStyle.backgroundColor,
                            }}
                            onMouseEnter={(e: any) => {
                              e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
                              e.target.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e: any) => {
                              e.target.style.backgroundColor = selectedClasses.has(classItem.id) ? '#6c757d' : buttonStyle.backgroundColor;
                              e.target.style.transform = 'translateY(0)';
                            }}
                            onClick={() => handleClassSelect(classItem)}
                            disabled={selectedClasses.has(classItem.id)}
                          >
                            {classItem.name}
                            <div>{`Section: ${classItem.section}`} {`Section: ${classItem.venue}`}</div>
                          </button>
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

export default Timetable;
