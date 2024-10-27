"use client"
import React from 'react';
import { useFormContext } from "react-hook-form";
import { RoadmapFormData } from '@/types';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Import the Button component

type RoadmapInfoFormProps = {
  setFormStep: React.Dispatch<React.SetStateAction<1 | 2>>;
};

const RoadmapInfoForm: React.FC<RoadmapInfoFormProps> = ({ setFormStep }) => {
    const {
      formState: { errors },
     } = useFormContext<RoadmapFormData>();
  
    
  return (
    <>
      <div className="space-y-6">
        {/* Name Field */}
        <FormField
          name="roadmap.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="roadmap.name">Name</FormLabel>
              <FormControl>
                <Input
                  id="roadmap.name"
                  placeholder="Alex Tan"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>This is your name.</FormDescription>
              <FormMessage>{errors.roadmap?.name?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* Major Field */}
        <FormField
              
              name="roadmap.degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <FormControl>
                    
                    <Select 
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a Degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Degree:</SelectLabel>
                          <SelectItem value="Bachelor of Integrative Studies">Bachelor of Integrative Studies</SelectItem>
                          <SelectItem value="Bachelor of Accountancy">Bachelor of Accountancy</SelectItem>
                          <SelectItem value="Bachelor of Business Management">Bachelor of Business Management</SelectItem>
                          <SelectItem value="Bachelor of Science (Economics)">Bachelor of Science (Economics)</SelectItem>
                          <SelectItem value="Bachelor of Science (Information Systems)">Bachelor of Science (Information Systems)</SelectItem>
                          <SelectItem value="Bachelor of Science (Computer Science)">Bachelor of Science (Computer Science)</SelectItem>
                          <SelectItem value="Bachelor of Science (Computing and Law)">Bachelor of Science (Computing and Law)</SelectItem>
                          <SelectItem value="Bachelor of Science (Software Engineering)">Bachelor of Science (Software Engineering)</SelectItem>
                          <SelectItem value="Bachelor of Laws">Bachelor of Laws</SelectItem>
                          <SelectItem value="Bachelor of Social Science">Bachelor of Social Science</SelectItem>


                        </SelectGroup>
                      </SelectContent>
                  </Select>
                  </FormControl>
                  <FormDescription>
                    This is the degree you graduated with.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

        {/* Graduation Year Field */}
        <FormField
          name="roadmap.graduation_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="roadmap.graduation_year">Graduation Year</FormLabel>
              <FormControl>
                <Input
                  id="roadmap.graduation_year"
                  type="number"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? '' : Number(value));
                  }}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>This is the year of graduation.</FormDescription>
              <FormMessage>{errors.roadmap?.graduation_year?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* Courses Summary Field */}
        <FormField
          name="roadmap.courses_summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="roadmap.courses_summary">Course Summary</FormLabel>
              <FormControl>
                <Input
                  id="roadmap.courses_summary"
                  placeholder="Focused on software engineering"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Short description of the type of modules you took in SMU.
              </FormDescription>
              <FormMessage>{errors.roadmap?.courses_summary?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* Current Job Field */}
        <FormField
          name="roadmap.current_job"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="roadmap.current_job">Current Job</FormLabel>
              <FormControl>
                <Input
                  id="roadmap.current_job"
                  placeholder="Software Engineer at Thalas"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>This is your current job title.</FormDescription>
              <FormMessage>{errors.roadmap?.current_job?.message}</FormMessage>
            </FormItem>
          )}
        />

        {/* Advice Field */}
        <FormField
          name="roadmap.advice"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="roadmap.advice">Advice</FormLabel>
              <FormControl>
                <Input
                  id="roadmap.advice"
                  placeholder="Work hard, Play harder"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>Word of advice on how to survive SMU.</FormDescription>
              <FormMessage>{errors.roadmap?.advice?.message}</FormMessage>
            </FormItem>
          )}
        />
      </div>

    </>
  );
};

export default RoadmapInfoForm;
