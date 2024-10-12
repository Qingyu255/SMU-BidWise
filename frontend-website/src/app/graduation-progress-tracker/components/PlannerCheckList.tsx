"use client";
import React, { useState , useEffect} from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';
import { Combobox } from '@/components/Combobox';
import { useToast } from "@/hooks/use-toast";
import NoCoursesAddedCard from './NoCoursesAddedCard';
import { SquarePen, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type Course = {
  courseCode: string,
  title: string,
  completed: boolean,
}

type CheckListProps = {
    courseOptions: string[]
}

export default function PlannerCheckList({ courseOptions }: CheckListProps) {

    const { toast } = useToast();
    const [showCompleted, setShowCompleted] = useState<boolean>(false);
    const [completedCourses, setCompletedCourses] = useState<number>(0);
    // Load courses from localStorage or use initialCourses as default
    const [courses, setCourses] = useState<Course[]>(() => {
        const storedCourses = localStorage.getItem('gradPlannerCourses');
        return storedCourses ? JSON.parse(storedCourses) : [];
    });

    

    useEffect(() => {
        // Save courses to localStorage whenever the courses array changes
        if (courses.length > 0) {
            localStorage.setItem('gradPlannerCourses', JSON.stringify(courses));
        }
        setCompletedCourses(courses.filter(course => course.completed).length);
    }, [courses]);

    const totalCourses = courses.length;
    // const completedCourses = courses.filter(course => course.completed).length;

    const toggleCourseCompletion = (courseCode: string) => {
        const updatedCourses = courses.map(course =>
            course.courseCode === courseCode ? { ...course, completed: !course.completed } : course
        );
        setCourses(updatedCourses);
    };

    const handleAddCourse = (optionSelected: string) => {
        const coursesInPlanner = courses.map(obj => obj.courseCode);
        const [courseCode, title] = optionSelected.split(" - ");
        if (coursesInPlanner.includes(courseCode)) {
            toast({
                title: courseCode + " Already Added",
            })
            return;
        }
        setCourses(prev => [...prev, {courseCode: courseCode, title: title, completed: false}]);
    }

    const removeCourse = (courseCode: string) => {
        const updated = courses.filter(courseObj => courseObj.courseCode !== courseCode);
        setCourses(updated);
        toast({
            title: courseCode + " removed",
          });
    }

  return (
    <Card>
        <CardHeader>
            <ProgressBar totalCourses={totalCourses} completedCourses={completedCourses} />
        </CardHeader>
        <CardContent>
            
            <div id='incompleteCourses'>
                <h3 className='text-left text-2xl font-bold pb-1'>Incomplete Courses</h3>
                <Separator/>
                <div id='addCoursesDiv' className='py-2'>
                    <div className='inline-flex flex-col'>
                        <span className='text-sm font-bold'>Add a Course:</span>
                        <Combobox category='Course' options={courseOptions} selectedValue='' onSelect={handleAddCourse}/>
                    </div>
                </div>
                {((courses.length - completedCourses) == 0) && (
                    <NoCoursesAddedCard text={"incomplete"}/>
                )}
                <ul>
                    {courses
                    .filter(course => !course.completed)
                    .map(course => (
                        <li key={course.courseCode} className='flex justify-between gap-2 py-2 border-b-1'>
                            <div className='my-auto'>{course.courseCode}: {course.title}</div>
                            <div className='flex gap-1'>
                                <Button
                                    variant="secondary"
                                    onClick={() => toggleCourseCompletion(course.courseCode)}
                                >
                                    <SquarePen className='pr-1'/>
                                    Mark Complete
                                </Button>
                                <Button variant="ghost" onClick={() => removeCourse(course.courseCode)}>
                                    <Trash2 className="w-4"/>
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div id='completedCourses' className='py-3'>
                {/* Toggle Button for Completed Courses */}
                {(courses.length > 0) && (
                    <Button onClick={() => setShowCompleted(!showCompleted)}>
                        {showCompleted ? 'Hide Completed' : 'Show Completed'}
                    </Button>
                )}
                {showCompleted && (
                    <div className='pt-3'>
                        <h3 className='text-left text-2xl font-bold pb-1'>Complete Courses</h3>
                        <Separator/>
                        <ul>
                            {courses
                            .filter(course => course.completed)
                            .map(course => (
                                <li key={course.courseCode} className='flex justify-between gap-1 py-2 border-b-1'>
                                    <div className='my-auto'>{course.courseCode}: {course.title}</div>
                                    <div className='flex gap-1'>
                                        <Button
                                            variant="outline"
                                            onClick={() => toggleCourseCompletion(course.courseCode)}
                                        >
                                            Mark Incomplete
                                        </Button>
                                        <Button variant="ghost" onClick={() => removeCourse(course.courseCode)}>
                                            <Trash2 className="w-4"/>
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
