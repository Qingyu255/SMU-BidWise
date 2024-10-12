"use client";
import React, { useState , useEffect} from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress"

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
      <div>
        <Progress value={progressPercentage}/>
      </div>
      <div className='pt-3'>
        <p className='font-semibold'>
          Progress: {progressPercentage.toFixed(2)}%
        </p>
        <p className='font-semibold'>
          {completedCourses} / {totalCourses} CUs completed
        </p>
      </div>
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
    <Card>
      <CardHeader>
        <GraduationProgress totalCourses={totalCourses} completedCourses={completedCourses} />
      </CardHeader>
      <CardContent>
        <div id='incompleteCourses'>
          <h3 className='text-left text-2xl font-bold'>Incomplete Courses</h3>
          <ul>
            {courses
              .filter(course => !course.completed)
              .map(course => (
                <li key={course.id} className='flex justify-between py-2 border-b-1'>
                  <span className='font-medium my-auto'>{course.name}</span>
                  <div>
                    <Button
                      variant="secondary"
                      onClick={() => toggleCourseCompletion(course.id)}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        <div id='completedCourses' className='py-3'>
          {/* Toggle Button for Completed Courses */}
          <Button onClick={() => setShowCompleted(!showCompleted)}>
            {showCompleted ? 'Hide Completed Courses' : 'Show Completed Courses'}
          </Button>
          {showCompleted && (
            <div className='pt-3'>
              <h3 className='text-left text-2xl font-bold'>Complete Courses</h3>
              <ul>
                {courses
                  .filter(course => course.completed)
                  .map(course => (
                    <li key={course.id} className='flex justify-between py-2 border-b-1'>
                      <span>{course.name}</span>
                      <div>
                        <Button
                          variant="outline"
                          onClick={() => toggleCourseCompletion(course.id)}
                        >
                          Mark Incomplete
                        </Button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GraduationTracker;
