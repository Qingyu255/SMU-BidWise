
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/Combobox';
import { semesters } from '../constants/semesters'
import { Course } from './KanbanPlanner';
import { Plus } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import createClient from '@/utils/supabase/client';

type AddCourseFormProps = {
    courseOptions: string[];
    onAddCourse: (course: Course) => void;
};

const AddCourseForm: React.FC<AddCourseFormProps> = ({ courseOptions, onAddCourse }) => {
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('');
    const { user } = useUser();
    const supabase = createClient();
  
    const handleAdd = async () => {
        if (selectedCourse && selectedSemester) {
            const [courseCode, title] = selectedCourse.split(' - ');

            const { data, error } = await supabase
            .from('course_info')
            .select('*')
            .eq('course_code', courseCode)
            .single();

           
            const newCourse: Course = {
                _clerk_user_id: user?.id ?? '',
                courseId: data?.id?.toString() ?? '',
                content: title,
                completed: 'false',
                columnId: selectedSemester,
            };

            console.log('title', title)
            onAddCourse(newCourse);
            setSelectedCourse('');
        }
    };
  
    return (
        <div className="py-2 space-y-2">
            <span className="text-sm font-bold">Add a Course:</span>
            <Combobox
                category="Course"
                options={courseOptions}
                selectedValue={selectedCourse}
                onSelect={(option) => setSelectedCourse(option)}
            />
            <Combobox
                category="Semester"
                options={semesters}
                selectedValue={selectedSemester}
                onSelect={(option) => setSelectedSemester(option)}
            />
            <Button onClick={handleAdd} disabled={!(selectedCourse && selectedSemester)}>
                <Plus className='w-4 h-4 pr-1'/>
                Add to Planner
            </Button>
        </div>
    );
  };
  
  export default AddCourseForm;
