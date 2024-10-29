"use client";
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import RoadmapInfoForm from '@/components/roadmap/forms/RoadmapInfoForm';
import SemestersForm from '@/components/roadmap/forms/SemestersForm';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/utils/supabase/authenticated/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Spinner } from '@nextui-org/react';

// Define your validation schema
const overallSchema = z.object({
  roadmap: z.object({
    name: z.string().min(2).max(50),
    degree: z.string().min(2).max(80),
    graduation_year: z.number().min(2003).max(new Date().getFullYear()),
    courses_summary: z.string().min(2).max(300),
    current_job: z.string().min(2).max(80),
    advice: z.string().min(2).max(500),
  }),
  semesters: z.array(
    z.object({
      sem_count: z.number().min(1).max(10),
      semester_name: z.string().min(1, "Semester name is required"),
      modules: z.array(
        z.object({
          selectedModule: z.string().min(1,"Module selection is required"),
        })
      ).min(1, "At least one module must be selected"),
    })
  ).min(1, "At least one semester is required"),
});

type OverallFormData = z.infer<typeof overallSchema>;

const Page: React.FC = () => {
  const methods = useForm<OverallFormData>({
    resolver: zodResolver(overallSchema),
    defaultValues: {
      roadmap: {
        name: "",
        degree: "",
        graduation_year: new Date().getFullYear(),
        courses_summary: "",
        current_job: "",
        advice: "",
      },
      semesters: [
        {
          sem_count: 1,
          semester_name: "Semester 1",
          modules: [
            {
              selectedModule: "", // Initialize as empty string
            },
          ],
        },
      ],
    },
  });

  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);

  const onSubmit = async (data: OverallFormData) => {
    setLoading(true);
    console.log("Final Form Data:", data);

    if (!user) {
      alert("You must be logged in to submit the form.");
      return;
    }

    try {
      // Upsert into 'roadmap_info'
      const roadmapPayload = {
        name: data.roadmap.name,
        degree: data.roadmap.degree,
        graduation_year: data.roadmap.graduation_year,
        courses_summary: data.roadmap.courses_summary,
        current_job: data.roadmap.current_job,
        advice: data.roadmap.advice,
        _clerk_user_id: user.id,
      };

      const { error: roadmapError } = await supabase
        .from('roadmap_info')
        .upsert(roadmapPayload, { onConflict: '_clerk_user_id' });

      if (roadmapError) throw roadmapError;

      // Upsert into 'seniors'
      const seniorPayload = {
        name: data.roadmap.name,
        _clerk_user_id: user.id,
      };

      const { error: seniorError } = await supabase
        .from('seniors')
        .upsert(seniorPayload, { onConflict: '_clerk_user_id' });

      if (seniorError) throw seniorError;

      const { data: seniorData, error: seniorDataError } = await supabase
          .from('seniors')
          .select('id') // To get the inserted row with 'id'
          .eq('_clerk_user_id', user.id)
          .single();

        if (seniorDataError) throw seniorDataError;

      // Insert semesters and modules
      for (const semester of data.semesters) {
      //   const semesterPayload = {
      //     sem_count: semester.sem_count,
      //     semester_name: semester.semester_name,
      //     _clerk_user_id: user.id,
      //   };

        const { data: semesterData, error: semesterError } = await supabase
          .from('semesters')
          .select('id') // To get the inserted row with 'id'
          .eq('sem_count', semester.sem_count)
          .single();

        if (semesterError) throw semesterError;


        console.log('SM', semester.modules)
        for (const moduleSelection of semester.modules) {
          if (moduleSelection.selectedModule) {

            const { data: courseData, error: courseError } = await supabase
            .from('course_info')
            .select('id') // To get the inserted row with 'id'
            .eq('course_code', moduleSelection.selectedModule)
            .single();

          if (courseError) throw courseError;


            const modulePayload = {
              course_id: courseData.id,
              _clerk_user_id: user.id,
              senior_id: seniorData.id,
              semester_id: semesterData.id, // Assuming 'semesters' table has an 'id' primary key
            };

            const { error: moduleError } = await supabase
              .from('enrollments') // Adjust table name as per your schema
              .insert(modulePayload);

            if (moduleError) throw moduleError;
          }
        }
      }

      alert("Form submitted successfully!");
      methods.reset();
      setFormStep(1);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to submit the form. Please try again.");
    } finally {
      router.push('../roadmaps')
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto p-8">
        {loading ?
        <div className='flex justify-center'>
        <Spinner color="default"/> Submitting Form...
        </div>
        : 
        <>
         {formStep === 1 && <RoadmapInfoForm setFormStep={setFormStep} />}
        {formStep === 2 && <SemestersForm setFormStep={setFormStep} />}

        {/* Navigation Buttons */}
        {formStep === 1 && (
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormStep(2)}
            >
              Next
            </Button>
          </div>
        )}
        {formStep === 2 && (
          <div className="flex justify-between mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setFormStep(1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={methods.handleSubmit(onSubmit)}
            >
              Submit
            </Button>
          </div>
        )}
         </>
         }
        
      </div>
    </FormProvider>
  );
};

export default Page;
