"use client"
import React, { useEffect, useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useSupabaseClient } from '@/utils/supabase/authenticated/client'
import { courseInfo } from '@/types'
import { Combobox } from '../Combobox'

const roadmapSchema = z.object({
    semester_id: z.string().uuid(),
    course_id: z.string().uuid(),
})

const CreateRoadmapForm = () => {

    const supabase = useSupabaseClient();
    const {user} = useUser();
    const [coursesArr, setCoursesArr] = useState<string[]>([])
    const [selectedCourse, setSelectedCourse] = useState<string>('')
    const [semester, setSemester] = useState<string>('')
  
    useEffect(() => {
      const fetchCourses = async () => {
        const { data, error } = await supabase
          .from('course_info')
          .select('*');
        
        if (error) {
          console.log('Error fetching courses', error);
        } else if (data) {
        const mergedCourses = data.map(course => `${course.course_code} - ${course.title}`);
          setCoursesArr(mergedCourses);
        }
      };
  
      fetchCourses();
  
  
    }, [supabase]);

    // 1. Define your form.
    const form = useForm<z.infer<typeof roadmapSchema>>({
        resolver: zodResolver(roadmapSchema),
    })

    async function onSubmit(values: z.infer<typeof roadmapSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
    }    


  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">


            <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                <FormItem>
                    <FormControl>
                    <Combobox selectedValue={selectedCourse} onSelect={(selectedValue: string) => {setSelectedCourse(selectedValue);}} category='Courses' options={coursesArr}/>
                    </FormControl>
                </FormItem>
                )}
            />

            <Button type="submit">Submit</Button>
        </form>
    </Form>
  )
}

export default CreateRoadmapForm