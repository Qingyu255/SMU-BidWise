import React from "react";
import { Progress } from "@/components/ui/progress";

interface GraduationProgressProps {
    totalCourses: number;
    completedCourses: number;
}  

export const ProgressBar = ({ totalCourses, completedCourses }: GraduationProgressProps) => {
    let progressPercentage = (completedCourses / totalCourses) * 100;
    if (isNaN(progressPercentage)) {
        progressPercentage = 0;
    }
    return (
      <div>
        <div>
          <Progress value={progressPercentage}/>
        </div>
        <div className='pt-3'>
          <p className='font-semibold'>
            Progress: {progressPercentage.toFixed(1)}%
          </p>
          <p className='font-semibold'>
            {completedCourses} / {totalCourses} CUs completed
          </p>
        </div>
      </div>
    );
  };