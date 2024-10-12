"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';
import { useToast } from "@/hooks/use-toast";
import AddCourseForm from './AddCourseForm';
import {KanbanBoard} from './kanbanBoardComponents/KanbanBoard';
import { semesters } from '../constants/semesters';
import { Task } from './kanbanBoardComponents/TaskCard';
import NoCoursesAddedCard from './NoCoursesAddedCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, CheckCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";

type CheckListProps = {
    courseOptions: string[];
};

export type Course = {
    id: string;
    courseCode: string,
    title: string,
    completed: boolean,
    semester: string;
}

export default function KanbanPlanner({ courseOptions }: CheckListProps) {
    const { toast } = useToast();
    const [showCompleted, setShowCompleted] = useState<boolean>(false);

    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const storedTasks = localStorage.getItem('gradPlannerTasks');
        setTasks(storedTasks ? JSON.parse(storedTasks) : []);
      }
    }, []);
  
    useEffect(() => {
      if (tasks.length > 0) {
        localStorage.setItem('gradPlannerTasks', JSON.stringify(tasks));
      }
    }, [tasks]);
  
    // Handler to add a new task (course)
    const handleAddCourse = (newCourse: Course) => {
      if (tasks.some(task => task.id === newCourse.courseCode)) {
        toast({ title: `${newCourse.courseCode} Already Added` });
        return;
      }
      const newTask: Task = {
        id: newCourse.courseCode,
        columnId: newCourse.semester,
        content: `${newCourse.courseCode} - ${newCourse.title}`,
        completed: newCourse.completed,
      };
      setTasks(prev => [...prev, newTask]);
    };
  
    // Handler to remove a task (course)
    const handleRemoveCourse = (taskId: string) => {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({ title: `Course removed` });
    };
  
    // Handler to toggle task completion
    const handleToggleCompletion = (taskId: string) => {
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        )
      );
    };
  
    const completedTasks = tasks.filter(t => t.completed).length;
  
    return (
        <>
            <Card>
                <CardHeader>
                    <ProgressBar totalCourses={tasks.length} completedCourses={completedTasks} />
                </CardHeader>
                <CardContent>
                    <div className='pb-2'>
                        <AddCourseForm courseOptions={courseOptions} onAddCourse={handleAddCourse} />
                    </div>
                    {tasks.length === 0 && (
                        <NoCoursesAddedCard/>
                    )}
                    <KanbanBoard 
                        tasks={tasks} 
                        onTasksChange={setTasks}
                        onRemoveTask={handleRemoveCourse}
                        onToggleTaskCompletion={handleToggleCompletion}
                    />
                    <div id='completedCourses' className='py-3'>
                        {/* Toggle Button for Completed Courses */}
                        {(completedTasks > 0) && (
                            <div className='text-right'>
                                <Button onClick={() => setShowCompleted(!showCompleted)}>
                                    {!showCompleted ? (
                                        <ChevronDown className="w-5 h-5" />
                                    ) : (
                                        <ChevronUp className="w-5 h-5" />
                                    )}
                                    {showCompleted ? 'Hide Completed' : 'Show Completed'}
                                </Button>
                            </div>
                        )}
                        {showCompleted && (
                            <div className='pt-3'>
                                <h3 className='text-left text-2xl font-bold pb-1'>Completed</h3>
                                <Separator/>
                                <ul>
                                    {tasks
                                    .filter(task => task.completed)
                                    .map(task => (
                                        <li key={task.id} className='flex justify-between gap-1 py-2 border-b-1'>
                                            <div className='my-auto'>{task.content} | {task.columnId}</div>
                                            <div className='flex gap-1'>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {handleToggleCompletion(task.id)}}
                                                className="ml-auto text-[#5A7BB5]"
                                            >
                                                {task.completed ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <Circle className="w-5 h-5" />
                                                )}
                                                <span className="sr-only">
                                                    {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                                                </span>
                                            </Button>
                                            {/* Remove Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {handleRemoveCourse(task.id)}}
                                                className="ml-2 text-red-500"
                                                >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="sr-only">Remove task</span>
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
        </>
    );
}
