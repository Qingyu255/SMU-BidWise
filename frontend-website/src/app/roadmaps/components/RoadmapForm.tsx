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


const formSchema = z.object({
  name: z.string().min(2).max(50),
  major: z.string().min(2).max(80),
  graduation_year: z.coerce.number().min(2003).max(new Date().getFullYear()),
  courses_summary: z.string().min(2).max(300),
  current_job: z.string().min(2).max(80),
  advice: z.string().min(2).max(500),

})


const RoadmapForm = () => {

  const supabase = useSupabaseClient();
  const {user} = useUser();
  const [courses, setCourses] = useState<courseInfo[]>([])

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('course_info')
        .select('*');
      
      if (error) {
        console.log('Error fetching courses', error);
      } else if (data) {
        setCourses(data);
      }
    };

    fetchCourses();


  }, [supabase]);


    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    
    if(user) {
      const roadmapPayload = { ...values, _clerk_user_id: user.id }
      
      const { error: roadmapError } = await supabase
      .from('roadmap_info')
      .upsert(roadmapPayload, { onConflict: '_clerk_user_id'});
  
      if(roadmapError) {
        console.log('Roadmap posting error: ', roadmapError)
      }

      const seniorPayload = {name: values.name, _clerk_user_id: user.id}

      const { error: seniorError } = await supabase
      .from('seniors')
      .upsert(seniorPayload, { onConflict: '_clerk_user_id'});

      form.reset()

      if (seniorPayload) {
        console.log('Senior posting error: ', seniorError)
      }
      
    } else {
      console.log('User id not found')
    }


    
    console.log(values)
    }

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">


            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Alex Tan" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Major</FormLabel>
                  <FormControl>
                    <Input placeholder="major" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the major you graduated with.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="graduation_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Graduation Year</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder="2020" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the year of graduation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courses_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Summary</FormLabel>
                  <FormControl>
                    <Input placeholder="Focused on software engineering" {...field} />
                  </FormControl>
                  <FormDescription>
                    Short description of the type of modules you took in SMU.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current_job"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Job</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer at Thalas" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your current job title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="advice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advice</FormLabel>
                  <FormControl>
                    <Input placeholder="Work hard, Play harder" {...field} />
                  </FormControl>
                  <FormDescription>
                    Word of advice on how to survive SMU.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            


            <Button type="submit">Submit</Button>
          </form>
        </Form>
      )
}

export default RoadmapForm