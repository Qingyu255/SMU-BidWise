"use client";
import React, { useEffect } from 'react';
import { useFormContext, useFieldArray } from "react-hook-form";
import { RoadmapFormData, ModuleOption, SemestersObj } from '@/types';
import { Button } from '@/components/ui/button';
import { useSupabaseClient } from '@/utils/supabase/authenticated/client';
import SemesterComponent from '@/components/roadmap/SemesterComponent';

type SemestersFormProps = {
  setFormStep: React.Dispatch<React.SetStateAction<1 | 2>>;
};

const SemestersForm: React.FC<SemestersFormProps> = ({ setFormStep }) => {
  const { control, setValue, getValues, formState: { errors } } = useFormContext<RoadmapFormData>();
  const supabase = useSupabaseClient();

  // Field array for semesters
  const { fields: semesters, append: appendSemester, remove: removeSemester } = useFieldArray({
    control,
    name: "semesters",
  });

  // Fetch available modules from Supabase
  const [availableModules, setAvailableModules] = React.useState<ModuleOption[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      const { data, error } = await supabase
        .from('course_info')
        .select('course_code, title');

      if (error) {
        console.error('Error fetching modules:', error);
        alert('Failed to load modules. Please try again later.');
      } else if (data) {
        const transformedModules: ModuleOption[] = data.map((course: any) => ({
          label: `${course.course_code} - ${course.title}`,
          value: course.course_code,
        }));
        setAvailableModules(transformedModules);
      }
    };

    fetchModules();
  }, [supabase]);

  const [semestersObj, setSemestersObj] = React.useState<SemestersObj>({})

  useEffect(() => {
    const fetchSemesters = async () => {
      const { data, error } = await supabase
        .from('semesters')
        .select('semester_name, sem_count');

      if (error) {
        console.log('Error fetching semesters:', error);
        alert('Failed to load semesters. Please try again later.');
      } else if (data) {
          const semester = data.reduce((acc: SemestersObj, sem) => {
            acc[sem.sem_count] = sem.semester_name;
            return acc;
          }, {});
          setSemestersObj(semester)
      }
    }

    fetchSemesters();
  }, [supabase]);


  // Function to append a new semester
  const handleAddSemester = () => {
    if (semesters.length >= 10) {
      alert("You can add up to 10 semesters only.");
      return;
    }

    appendSemester({
      sem_count: semesters.length + 1,
      semester_name: semestersObj[semesters.length + 1],
      modules: [
        {
          selectedModule: "",
        },
      ],
    });
  };

  // Function to remove a semester and update sem_count
  const handleRemoveSemester = (index: number) => {
    removeSemester(index);
    // Update sem_count of remaining semesters
    const updatedSemesters = getValues('semesters').map((sem, idx) => ({
      ...sem,
      sem_count: idx + 1,
      semester_name: semestersObj[idx + 1],
    }));
    setValue('semesters', updatedSemesters);
  };

  return (
    <div className="space-y-6">
      {semesters.map((semester, semesterIndex) => (
        <SemesterComponent
          key={semester.id || `semester-${semesterIndex}`}
          semester={semester}
          semesterIndex={semesterIndex}
          control={control}
          setValue={setValue}
          removeSemester={handleRemoveSemester} // Use the updated remove function
          availableModules={availableModules}
          errors={errors}
        />
      ))}

      {/* Add Semester Button */}
      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddSemester}
        >
          Add Semester
        </Button>
      </div>
    </div>
  );
};

export default SemestersForm;
