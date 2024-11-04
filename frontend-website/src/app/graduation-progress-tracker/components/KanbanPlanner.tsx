"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import AddCourseForm from './AddCourseForm';
import { KanbanBoard } from './kanbanBoardComponents/KanbanBoard';
import NoCoursesAddedCard from './NoCoursesAddedCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, CheckCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";
import createClient from '@/utils/supabase/client';
import { useUser } from '@clerk/clerk-react';
import KanbanTimeline from './KanbanTimeline';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type CheckListProps = {
    courseOptions: string[];
};

export type Course = {
    _clerk_user_id: string;
    columnId: string;
    content: string;
    completed: string;
    courseId: string;
}

export type Task = {
    _clerk_user_id: string;
    columnId: string;
    content: string;
    completed: boolean;
    courseId: string;
};

export default function KanbanPlanner({ courseOptions }: CheckListProps) {
    const { toast } = useToast();
    const [showCompleted, setShowCompleted] = useState<boolean>(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const supabase = createClient();
    const previousTasksRef = useRef<Task[]>([]);
    const { user } = useUser();
    const [showKanban, setShowKanban] = useState(true);
    const [KanbanKey, setKanbanKey] = useState(0);

    


    // Fetch tasks from Supabase on component mount
    useEffect(() => {
        const fetchTasks = async () => {
            if (!user || !user.id) {
                toast({ title: 'User not authenticated.' });
                return;
            }

            try {
                const { data: tasksData, error: tasksError } = await supabase
                    .from('tasks_roadmap')
                    .select('*')
                    .eq('_clerk_user_id', user.id);

                if (tasksError) {
                    throw tasksError;
                }

                // Map Supabase data to Task type
                const fetchedTasks: Task[] = await Promise.all(tasksData.map(async task => {
                    const { data: courseData, error: courseError } = await supabase
                        .from('course_info')
                        .select('course_code')
                        .eq('id', task.courseId as string);

                    if (courseError) {
                        throw courseError;
                    }

                    let courseCode = '';
                    if (courseData && courseData.length > 0) {
                        courseCode = courseData[0].course_code as string;
                    }

                    return {
                        _clerk_user_id: user?.id ?? '',
                        columnId: task.columnId as string,
                        completed: task.completed as boolean,
                        content: `${courseCode} - ${task.content}` as string,
                        courseId: task.courseId as string,
                    };
                }));

                setTasks(fetchedTasks);
                previousTasksRef.current = fetchedTasks; // Initialize previous tasks

                

                setTasks(fetchedTasks);
                previousTasksRef.current = fetchedTasks; // Initialize previous tasks
            } catch (error) {
                console.error('Error fetching tasks:', error);
                toast({ title: 'Error fetching tasks from Supabase.' });
            }
        };

        fetchTasks();
    }, [supabase, user, toast]);

  

    // Handler to add a new task (course)
const handleAddCourse = async (newCourse: Course) => {
    // Fetch the course_code directly
    const { data, error } = await supabase
    .from('course_info')
    .select('course_code')
    .eq('id', newCourse.courseId);

    if (error) {
        throw error;
    }

    let courseCode = '';
    if (data && data.length > 0) {
        courseCode = data[0].course_code as string;
    } else {
        courseCode = '';
    }

    if (tasks.some(task => task.courseId === newCourse.courseId)) {
        toast({ title: `${courseCode} Already Added` });
        return;
    }

    if (!user || !user.id) {
        toast({ title: 'User not authenticated.' });
        return;
    }

    try {
        // Fetch the course_code directly
        const { data, error } = await supabase
            .from('course_info')
            .select('course_code')
            .eq('id', newCourse.courseId);

        if (error) {
            throw error;
        }

        let courseCode = '';
        if (data && data.length > 0) {
            courseCode = data[0].course_code as string;
        } else {
            courseCode = '';
        }

        const newTask: Task = {
            _clerk_user_id: user?.id ?? '',
            courseId: newCourse.courseId,
            content: `${courseCode} - ${newCourse.content}`,
            completed: newCourse.completed === 'true',
            columnId: newCourse.columnId,
        };

        console.log('newTask', newTask);

        // Insert the new task into Supabase
        const { error: insertError } = await supabase.from('tasks_roadmap').insert([
            {
                _clerk_user_id: user.id,
                courseId: newTask.courseId,
                content: newTask.content,
                completed: newTask.completed,
                columnId: newTask.columnId,
            },
        ]);

        if (insertError) {
            throw insertError;
        }

        setTasks(prev => [...prev, newTask]);
        previousTasksRef.current = [...tasks, newTask];
        toast({ title: `${courseCode} Added Successfully` });
    } catch (error) {
        console.error('Error adding course:', error);
        toast({ title: 'Error adding course to Supabase.' });
    }
};

    // Handler to remove a task (course)
    const handleRemoveCourse = async (taskId: string) => {
        if (!user || !user.id) {
            toast({ title: 'User not authenticated.' });
            return;
        }

        try {
            const { error } = await supabase
                .from('tasks_roadmap')
                .delete()
                .eq('courseId', taskId)
                .eq('_clerk_user_id', user.id);

            if (error) {
                throw error;
            }

            setTasks(prev => prev.filter(task => task.courseId !== taskId));
            previousTasksRef.current = tasks.filter(task => task.courseId !== taskId);
            toast({ title: `Course removed` });
        } catch (error) {
            console.error('Error removing course:', error);
            toast({ title: 'Error removing course from Supabase.' });
        }
    };

    // Handler to toggle task completion
    const handleToggleCompletion = async (taskId: string) => {
        if (!user || !user.id) {
            toast({ title: 'User not authenticated.' });
            return;
        }

        const taskToUpdate = tasks.find(task => task.courseId === taskId);
        if (!taskToUpdate) {
            toast({ title: 'Task not found.' });
            return;
        }

        const updatedCompleted = !taskToUpdate.completed;

        try {
            const { error } = await supabase
                .from('tasks_roadmap')
                .update({ completed: updatedCompleted })
                .eq('courseId', taskId)
                .eq('_clerk_user_id', user.id);

            if (error) {
                throw error;
            }

            setTasks(prev =>
                prev.map(task =>
                    task.courseId === taskId ? { ...task, completed: updatedCompleted } : task
                )
            );
            previousTasksRef.current = tasks.map(task =>
                task.courseId === taskId ? { ...task, completed: updatedCompleted } : task
            );
            toast({ title: `Course marked as ${updatedCompleted ? 'completed' : 'incomplete'}` });
        } catch (error) {
            console.error('Error updating task completion:', error);
            toast({ title: 'Error updating task in Supabase.' });
        }
    };

    // Handler for when tasks change (e.g., moved between columns)
    const handleTasksChange = async (newTasks: Task[]) => {
        if (!user || !user.id) {
            toast({ title: 'User not authenticated.' });
            return;
        }

        const previousTasks = previousTasksRef.current;

        // Create maps for easy lookup
        const previousTasksMap = new Map(previousTasks.map(task => [task.courseId, task]));
        const newTasksMap = new Map(newTasks.map(task => [task.courseId, task]));

        // Detect added tasks
        const addedTasks = newTasks.filter(task => !previousTasksMap.has(task.courseId));

        // Detect removed tasks
        const removedTasks = previousTasks.filter(task => !newTasksMap.has(task.courseId));

        // Detect updated tasks (e.g., moved to a different column or toggled completion)
        const updatedTasks = newTasks.filter(task => {
            const prevTask = previousTasksMap.get(task.courseId);
            return prevTask && (prevTask.columnId !== task.columnId || prevTask.completed !== task.completed);
        });

        try {
            const insertPromises = [];
            const deletePromises = [];
            const updatePromises = [];

            // Handle added tasks
            if (addedTasks.length > 0) {
                insertPromises.push(
                    supabase.from('tasks_roadmap').insert(
                        addedTasks.map(task => ({
                            _clerk_user_id: user.id,
                            courseId: task.courseId,
                            content: task.content,
                            completed: task.completed,
                            columnId: task.columnId,
                        }))
                    )
                );
            }

            // Handle removed tasks
            if (removedTasks.length > 0) {
                deletePromises.push(
                    supabase
                        .from('tasks_roadmap')
                        .delete()
                        .in('courseId', removedTasks.map(task => task.courseId))
                        .eq('_clerk_user_id', user.id)
                );
            }

            // Handle updated tasks
            if (updatedTasks.length > 0) {
                updatePromises.push(
                    ...updatedTasks.map(task =>
                        supabase
                            .from('tasks_roadmap')
                            .update({
                                columnId: task.columnId,
                                completed: task.completed,
                                // content: task.content, // Include other fields if necessary
                            })
                            .eq('courseId', task.courseId)
                            .eq('_clerk_user_id', user.id)
                    )
                );
            }

            // Execute all promises concurrently
            const [insertResults, deleteResults, updateResults] = await Promise.all([
                insertPromises.length > 0 ? Promise.all(insertPromises) : Promise.resolve([]),
                deletePromises.length > 0 ? Promise.all(deletePromises) : Promise.resolve([]),
                updatePromises.length > 0 ? Promise.all(updatePromises) : Promise.resolve([]),
            ]);

            // Check for errors
            insertResults.forEach(result => {
                if (result.error) throw result.error;
            });
            deleteResults.forEach(result => {
                if (result.error) throw result.error;
            });
            updateResults.forEach(result => {
                if (result.error) throw result.error;
            });

            // Provide feedback
            if (addedTasks.length > 0) {
                toast({ title: `${addedTasks.length} course(s) added successfully.` });
            }
            if (removedTasks.length > 0) {
                toast({ title: `${removedTasks.length} course(s) removed successfully.` });
            }
            if (updatedTasks.length > 0) {
                toast({ title: `${updatedTasks.length} course(s) updated successfully.` });
            }

            // Update local state and previousTasksRef
            setTasks(newTasks);
            previousTasksRef.current = newTasks;
        } catch (error) {
            console.error('Error updating tasks:', error);
            toast({ title: 'Error updating tasks in Supabase.' });
        }
    };

    const completedTasks = tasks.filter(t => t.completed).length;
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user || !user.id) {
                toast({ title: 'User not authenticated.' });
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('tasks_roadmap')
                    .select('*')
                    .eq('_clerk_user_id', user.id);

                if (error) {
                    throw error;
                }

                // Map Supabase data to Task type
                const fetchedTasks: Task[] = data.map(task => ({
                    _clerk_user_id: user?.id ?? '' as string,
                    columnId: task.columnId as string,
                    completed: task.completed as boolean,
                    content: task.content as string,
                    courseId: task.courseId as string,
                }));

                setTasks(fetchedTasks);
                previousTasksRef.current = fetchedTasks; // Initialize previous tasks
            } catch (error) {
                console.error('Error fetching tasks:', error);
                toast({ title: 'Error fetching tasks from Supabase.' });
            }
        };
        
        fetchTasks();
        
      }, [showKanban]);

    const handleToggleKanban = (checked: boolean) => {
        setShowKanban(checked);
        if (!checked) {
            setKanbanKey((prevKey) => prevKey + 1);
          }
    };

    return (
        <>
            <Card>
                {/* <CardHeader>
                    <ProgressBar totalCourses={tasks.length} completedCourses={completedTasks} />
                </CardHeader> */}
                <CardContent>
                    <div className='py-2 flex flex-row justify-between'>
                        <AddCourseForm courseOptions={courseOptions} onAddCourse={(newCourse) => {
                            handleAddCourse(newCourse);
                            console.log('kanbanKey', KanbanKey)
                            setKanbanKey((prevKey) => prevKey + 1); // Rerender timeline
                            console.log('kanbanKey', KanbanKey)
                        }} />
                        <div className='flex py-4 space-x-1'>
                            <Label htmlFor="toggle-view">Roadmap View</Label>
                            <Switch
                                id="toggle-view"
                                checked={!showKanban} // When checked, show Roadmap
                                onCheckedChange={(checked) => handleToggleKanban(!checked)} // Fix the logic here
                            />
                        </div>
                    </div>
                    {tasks.length === 0 && (
                        <NoCoursesAddedCard />
                    )}

                    {showKanban === true ?
                        <>
                            <KanbanBoard
                                tasks={tasks}
                                onTasksChange={handleTasksChange} // Use the onTasksChange handler
                                onRemoveTask={handleRemoveCourse}
                                onToggleTaskCompletion={handleToggleCompletion}
                                kanbanKey={KanbanKey}
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
                                        <Separator />
                                        <ul>
                                            {tasks
                                                .filter(task => task.completed)
                                                .map(task => (
                                                    <li key={task.courseId} className='flex justify-between gap-1 py-2 border-b-1'>
                                                        <div className='my-auto'>{task.content} | {task.columnId}</div>
                                                        <div className='flex gap-1'>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => { handleToggleCompletion(task.courseId) }}
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
                                                                onClick={() => { handleRemoveCourse(task.courseId) }}
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
                        </>
                        :
                        <div className='flex flex-col overflow-hidden' style={{ width: '100%', height: '90vh' }}>
                           
                            <div className='relative container self-center flex-grow' style={{ height: 'inherit' }}>
                                <KanbanTimeline kanbanKey={KanbanKey}/>
                                <div
                                    className='fixed bottom-4 transform -translate-x-1/2 w-full max-w-md px-4 z-50'
                                    style={{
                                        left: window.innerWidth < 1024 ? '50%' : 'calc(50% + 135px)', // Adjust for the 270px sidebar if viewport is wider than 1024px
                                    }}
                                >
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className='rounded-full bg-[#252A34] text-[#EAEAEA] px-3 py-1.5 text-sm'>
                                                    <span className='text-[#F3C623]'>TIP</span> Drag and Drop your nodes to rearrange your modules!
                                                </div>
                                            </TooltipTrigger>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>
                    }

                </CardContent>
            </Card>
        </>
    )
    }
