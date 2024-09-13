import React from 'react';

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

const parseTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes; // Convert to minutes
};

const MyTimetable = ({ selectedClasses }) => {
  // Initialize timetable structure
  const timetable = fixedTimeSlots.map((time) => ({
    time,
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  }));

  // Add selected classes to timetable
  selectedClasses.forEach((classItem) => {
    const [classStart, classEnd] = classItem.time.split(' - ');
    const startMinutes = parseTime(classStart);
    const endMinutes = parseTime(classEnd);

    // Find relevant time slots for the class
    fixedTimeSlots.forEach((slot, index) => {
      const slotStart = parseTime(slot.split(' - ')[0]);
      const slotEnd = parseTime(slot.split(' - ')[1]);

      // Check if the slot overlaps with the class time
      if (startMinutes < slotEnd && endMinutes > slotStart) {
        const timeSlot = timetable[index];
        if (timeSlot) {
          timeSlot[classItem.day].push({ ...classItem, startMinutes, endMinutes });
        }
      }
    });
  });

  // Styling
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '20px 0',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
    fontFamily: "'Roboto', sans-serif",
  };

  const thStyle = {
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#0056b3',
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const tdStyle = {
    textAlign: 'center',
    padding: '0',
    border: '1px solid #e0e0e0',
    fontSize: '14px',
    color: '#333333',
    verticalAlign: 'middle',
    height: '50px',
    position: 'relative',
  };

  const classBlockStyle = {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={{ overflowX: 'auto', padding: '0 10px' }}>
      <h2>My Timetable</h2>
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
          {timetable.map((entry, rowIndex) => (
            <tr key={rowIndex}>
              <td style={tdStyle}>{entry.time}</td>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                const classes = timetable[rowIndex][day];

                return (
                  <td key={day} style={tdStyle}>
                    {classes.map((classItem, index) => {
                      const { startMinutes, endMinutes } = classItem;

                      // Calculate start and end positions within the slot
                      const slotStartMinutes = parseTime(fixedTimeSlots[rowIndex].split(' - ')[0]);
                      const slotEndMinutes = parseTime(fixedTimeSlots[rowIndex].split(' - ')[1]);

                      // Calculate proportion of the block's height within the slot
                      const startOffset = (startMinutes - slotStartMinutes) / 60;
                      const endOffset = (endMinutes - slotStartMinutes) / 60;
                      const blockHeight = (endOffset - startOffset) * 50; // Use the same rowHeight

                      return (
                        <div key={index} style={{ position: 'relative', height: '50px' }}>
                          <div
                            style={{
                              ...classBlockStyle,
                              top: `${startOffset * 50}px`,
                              height: `${blockHeight}px`,
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
