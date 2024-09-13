// src/components/ClassTimetable.js
import React from 'react';

function ClassTimetable({ classes, onClassSelect }) {
  return (
    <div>
      <h2>Class Timetable</h2>
      {classes.length === 0 ? (
        <p>Select a professor to view their classes.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Day</th>
              <th>Time</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem.id}>
                <td>{classItem.name}</td>
                <td>{classItem.day}</td>
                <td>{classItem.time}</td>
                <td>
                  <button onClick={() => onClassSelect(classItem)}>Select</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClassTimetable;