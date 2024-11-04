
import React from 'react';
import { useFieldArray, Control, UseFormSetValue, FieldErrors, useWatch } from 'react-hook-form';
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
  // Use useFieldArray for modules within the semester
  const { fields: modules, append: appendModule, remove: removeModule } = useFieldArray({
    control,
    name: `semesters.${semesterIndex}.modules`,
  });

  // Watch all module selections in this semester
  const selectedModules = useWatch({
    control,
    name: `semesters.${semesterIndex}.modules`,
    defaultValue: [],
  });

  // Helper function to get available options for a module field by excluding already selected modules
  const getFilteredOptions = React.useCallback(
    (currentIndex: number): ModuleOption[] => {
      const selected = selectedModules
        .map((m, idx) => (idx !== currentIndex ? m.selectedModule : null))
        .filter((m) => m !== null && m !== '');
  
      const filtered = availableModules.filter((mod) => !selected.includes(mod.value));
      // console.log(`Filtered Options for Module ${currentIndex + 1}:`, filtered); // Debugging
  
      return filtered;
    },
    [selectedModules, availableModules]
  );
  
  return (
    <div className="border p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {semester.semester_name || `Semester ${semester.sem_count}`}
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

      {/* Hidden Semester Name Input */}
      <FormField
        name={`semesters.${semesterIndex}.semester_name`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="hidden"
                {...field}
                value={field.value || `Semester ${semester.sem_count}`}
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
                      options={getFilteredOptions(moduleIndex)}
                      selectedValue={field.value || ''}
                      onSelect={(selectedValue: string) => {
                        // Check for duplicates
                        const isDuplicate = selectedModules.some(
                          (m, idx) => m.selectedModule === selectedValue && idx !== moduleIndex
                        );
                        if (isDuplicate) {
                          toast({
                            title: 'Duplicate Module',
                            description: 'This module has already been added to the semester.',
                            variant: 'destructive',
                          });
                          return;
                        }
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
              toast({
                title: 'Maximum Modules Reached',
                description: 'You cannot add more than 6 modules to this semester.',
                variant: 'destructive',
              });
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
