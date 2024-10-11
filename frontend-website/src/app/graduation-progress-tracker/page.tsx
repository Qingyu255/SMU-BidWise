"use client";
import React, { useState , useEffect} from 'react';

const styles = {
    header: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center' as 'center',
        paddingBottom: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0',
       
      },

    leadText: {
    fontSize: '18px', // Larger font size
    fontWeight: '600', // Semi-bold to make it stand out
    color: '#555', // A darker shade of gray for prominence
    marginTop: '10px',
    marginBottom: '10px',
   // Center align the text
    },
   
  graduationTracker: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    fontFamily: "'Arial', sans-serif",
  },
  progressBarContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '15px',
    boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    backgroundColor: '#4caf50',
    height: '24px',
    borderRadius: '6px',
    transition: 'width 0.4s ease',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    fontWeight: 'bold',
    marginLeft: '10px',
  },
  buttonComplete: {
    backgroundColor: '#28a745',
    marginLeft: '10px',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
    fontWeight: 'bold',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0',
  },
  courseName: {
    fontSize: '16px',
    fontWeight: '500',
  },
  statusComplete: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  statusIncomplete: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  dropdownButton: {
    backgroundColor: '#f8f9fa',
    color: '#343a40',
    border: '1px solid #ddd',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
};

interface Course {
  id: number;
  name: string;
  completed: boolean;
}

interface GraduationProgressProps {
  totalCourses: number;
  completedCourses: number;
}

const GraduationProgress: React.FC<GraduationProgressProps> = ({ totalCourses, completedCourses }) => {
  const progressPercentage = (completedCourses / totalCourses) * 100;

  return (
    <div>
      <h2 style={styles.header}>Graduation Progress</h2>
      <div style={styles.progressBarContainer}>
        <div
          style={{
            ...styles.progressBar,
            width: `${progressPercentage}%`,
          }}
        />
      </div>
      <p style={styles.leadText}>
        {completedCourses} out of {totalCourses} CUs completed
      </p>
      <p style={styles.leadText}>
        Progress: {progressPercentage.toFixed(2)}%
      </p>
    </div>
  );
};

const GraduationTracker: React.FC = () => {
  const initialCourses: Course[] = [
    { id: 1, name: 'Statistics', completed: true },
    { id: 2, name: 'Computational Thinking and Programming', completed: true },
    { id: 3, name: 'Modeling & Data Analytics', completed: false },
    { id: 4, name: 'Managing', completed: false },
    { id: 5, name: 'Writing & Reasoning', completed: true },
    { id: 6, name: 'Internship', completed: false },
    { id: 7, name: 'Economics & Society', completed: false },
    { id: 8, name: 'Technology, Science & Society', completed: false },
    { id: 9, name: 'Cultures of the Modern World', completed: false },
    { id: 10, name: 'Ethics & Social Responsibility', completed: false },
    { id: 11, name: 'Big Questions', completed: true },
  ];

  // Load courses from localStorage or use initialCourses as default
  const [courses, setCourses] = useState<Course[]>(() => {
    const storedCourses = localStorage.getItem('courses');
    return storedCourses ? JSON.parse(storedCourses) : initialCourses;
  });

  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  useEffect(() => {
    // Save courses to localStorage whenever the courses array changes
    if (courses.length > 0) {
      localStorage.setItem('courses', JSON.stringify(courses));
    }
  }, [courses]);

  const totalCourses = courses.length;
  const completedCourses = courses.filter(course => course.completed).length;

  const toggleCourseCompletion = (id: number) => {
    const updatedCourses = courses.map(course =>
      course.id === id ? { ...course, completed: !course.completed } : course
    );
    setCourses(updatedCourses);
  };

  return (
    <div style={styles.graduationTracker}>
      <GraduationProgress totalCourses={totalCourses} completedCourses={completedCourses} />

      <h3 style={styles.header}>Courses</h3>

      {/* Incomplete Courses */}
      <ul>
        {courses
          .filter(course => !course.completed)
          .map(course => (
            <li key={course.id} style={styles.listItem}>
              <span style={styles.courseName}>{course.name}</span>
              <div>
                <span style={styles.statusIncomplete}>Incomplete</span>
                <button
                  style={styles.button}
                  onClick={() => toggleCourseCompletion(course.id)}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
                >
                  Mark Complete
                </button>
              </div>
            </li>
          ))}
      </ul>

      {/* Toggle Button for Completed Courses */}
      <button
        style={styles.dropdownButton}
        onClick={() => setShowCompleted(!showCompleted)}
      >
        {showCompleted ? 'Hide Completed Courses' : 'Show Completed Courses'}
      </button>

      {/* Completed Courses Dropdown */}
      {showCompleted && (
        <ul>
          {courses
            .filter(course => course.completed)
            .map(course => (
              <li key={course.id} style={styles.listItem}>
                <span style={styles.courseName}>{course.name}</span>
                <div>
                  <span style={styles.statusComplete}>Complete</span>
                  <button
                    style={styles.buttonComplete}
                    onClick={() => toggleCourseCompletion(course.id)}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
                  >
                    Mark Incomplete
                  </button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default GraduationTracker;