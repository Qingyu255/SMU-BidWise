// SemesterComponent.tsx
import React from 'react';
import { useFieldArray, Control, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { RoadmapFormData, ModuleOption } from '@/types';
import { FormCombobox } from './FormCombobox';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface SemesterComponentProps {
  semester: any;
  semesterIndex: number;
  control: Control<RoadmapFormData>;
  setValue: UseFormSetValue<RoadmapFormData>;
  removeSemester: (index: number) => void;
  availableModules: ModuleOption[];
  errors: FieldErrors<RoadmapFormData>;
}

const SemesterComponent: React.FC<SemesterComponentProps> = ({
  semester,
  semesterIndex,
  control,
  setValue,
  removeSemester,
  availableModules,
  errors,
}) => {
  // Use useFieldArray for modules at the top level of the component
  const { fields: modules, append: appendModule, remove: removeModule } = useFieldArray({
    control,
    name: `semesters.${semesterIndex}.modules`,
  });

  return (
    <div className="border p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {semester.semester_name || 'Semester 1'}
        </h3>
        {semester.sem_count > 0 && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => removeSemester(semesterIndex)}
          >
            Remove Semester
          </Button>
        )}
      </div>

      {/* Semester Name */}
      <FormField
        name={semester.semester_name || 'Semester 1'}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="hidden"
                {...field}
                value={field.value || 'Semester 1'}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Modules */}
      <div className="space-y-4">
        {modules.map((module, moduleIndex) => (
          <div
            key={module.id || `module-${moduleIndex}`}
            className="flex items-center space-x-4"
          >
            <FormField
              name={`semesters.${semesterIndex}.modules.${moduleIndex}.selectedModule`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Module {moduleIndex + 1}</FormLabel>
                  <FormControl>
                    <FormCombobox
                      category="Module"
                      options={availableModules}
                      selectedValue={field.value || ''}
                      onSelect={(selectedValue: string) => {
                        field.onChange(selectedValue);
                      }}
                      clearOptionText="Clear Selection"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {modules.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeModule(moduleIndex)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add Module Button */}
      <div className="mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (modules.length < 6) {
              appendModule({ selectedModule: '' });
            } else {
              toast({ title: 'Maximum 6 modules per semester'})
            }
          }}
        >
          Add Module
        </Button>
      </div>
    </div>
  );
};

export default SemesterComponent;
