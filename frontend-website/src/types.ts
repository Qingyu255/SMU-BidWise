import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { Node, Position, XYPosition } from '@xyflow/react';
import { UUID } from 'crypto';
export interface SidebarItems {
  links: Array<{
    label: string;
    href: string;
    icon?: LucideIcon;
  }>;
  extras?: ReactNode;
}
export interface Dataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
}

export interface MultitypeChartDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  yAxisID: string
}

export interface ChartData {
  responsive: boolean;
  labels: string[];
  datasets: Dataset[];
}

export interface chartAttributes {
  type?: string
  title: string
  chartData: ChartData
  width: string
  height: string
}

export interface seniorsAttributes {
  id: number
  name: string
  email: string
}

export interface semestersAttributes {
  id: number
  senior_id: number
  semester_name: string
}

export interface enrollments {
  id:number
  senior_id : number
  semester_id : number
  course_id : number
}

export interface courses {
  id : number
  course_name : string
  course_code : string
  course_info : string

}

export interface courseInfo {
  id: UUID;
  course_code: string;
  title: string;
  career: string;
  units: string;
  grading_basis: string;
  description: string;
  enrolment_requirements: string;
};


export interface NodeData {
  id: string;
  type: string,
  position: XYPosition;
  label: React.ReactNode;
  data: {
    label: string;
  };
  targetPosition: Position; // Add this property
  sourcePosition: Position; // Add this property
  selected?: boolean;
  deletable?: boolean;
  selectable?: boolean;
  width?: number;
  height?: number;
  dragHandle?: string;
  draggable?: boolean;
  parentId?: string;
  style: {
    backgroundColor: string;
    border: string;
    borderRadius: string;
    fontWeight: string;
  };
}


export interface edgeData {
  id: string;
  source: string;
  type: string;
  target: string;
  animated: boolean;
  style: {
      stroke: string;
      strokeWidth: number;
      strokeDasharray: string;
  };
}


export interface SeniorData {
  id: string;
}

export interface SemesterData {
  id: string;
}

export interface EnrollmentData {
  course_id: string;
}

export interface CourseInfoData {
  course_code: string;
}

export interface TimelineProps {
  seniorName: string;
}

export interface Course {
  course_code: string;
}


export interface Availability {
  total_seats: number;
  reserved_seats: number;
  available_seats: number;
  current_enrolled: number;
}

// Interface for the class item
export interface ClassItem {
  id: string;
  section: string;
  day: string;
  start_time: string;
  end_time: string;
  instructor: string;
  venue: string;
  availability: Availability; // Nested object representing seat availability
  startMinutes: number;
  endMinutes: number;
  startOffset: number;
  endOffset: number;
  courseCode?: string;
  plannedBid?: number;
  courseTitle?: string;
}

export interface ExamItem {
  id: string;
  section: string;
  day: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue: string;
}

export interface SeniorRoadmap {
  name: string;
  title: string;
  description: string;
}

export interface RoadmapsProps {
  // roadmapInfo: RoadmapInfo[];
  page: number;
  // onClick: (name: string, roadmap: RoadmapInfo) => void;
}

export interface RoadmapCardProps {
  name: string;
  major: string;
  graduation_year: number;
  courses_summary: string;
  current_job: string;
  advice: string;
}


export interface SeniorName {
  name: string;
}


export interface HeadingCardProps {
  headingCardInfo: RoadmapInfo;
}

// export type FormStep = 1 | 2;

export type RoadmapFormProps = {
  setFormStep: React.Dispatch<React.SetStateAction<FormStep>>;
};



// TEST
// src/types/formTypes.ts

import { z } from "zod";

// Type Definitions
export type FormStep = 1 | 2;

export type RoadmapInfo = {
  name: string;
  major: string;
  graduation_year: number;
  courses_summary: string;
  current_job: string;
  advice: string;
  _clerk_user_id: string;
};

export type Module = {
  course_code: string;
  title: string;
};

export type ModuleSelection = {
  selectedModule: string; 
};

export type ModuleOption = {
  label: string;
  value: string;
};

export type SemestersObj = {
  [key: number]: string
}

export type Semester = {
  sem_count: number; // Added sem_count here
  semester_name: string;
  modules: ModuleSelection[];
};

export type RoadmapFormData = {
  roadmap: RoadmapInfo;
  semesters: Semester[];
};

// Zod Schemas
export const ModuleSchema = z.object({
  course_code: z.string().min(1, "Module code is required"),
  title: z.string().min(1, "Module name is required"),
});

export const ModuleSelectionSchema = z.object({
  selectedModule: z.string().nonempty("Module selection is required"),
});

export const SemesterSchema = z.object({
  sem_count: z.number().min(1, "Semester count must be at least 1").max(10, "Semester count cannot exceed 10"), // Added sem_count here
  semester_name: z.string().min(1, "Semester name is required"),
  modules: z.array(ModuleSelectionSchema).min(1, "At least one module is required"),
});

export const RoadmapInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  major: z.string().min(2, "Major must be at least 2 characters").max(80, "Major must be at most 80 characters"),
  graduation_year: z.coerce.number().min(2003, "Graduation year cannot be before 2003").max(new Date().getFullYear(), "Graduation year cannot be in the future"),
  courses_summary: z.string().min(2, "Summary must be at least 2 characters").max(300, "Summary must be at most 300 characters"),
  current_job: z.string().min(2, "Current job must be at least 2 characters").max(80, "Current job must be at most 80 characters"),
  advice: z.string().min(2, "Advice must be at least 2 characters").max(500, "Advice must be at most 500 characters"),
});

export const RoadmapFormSchema = z.object({
  roadmap: RoadmapInfoSchema,
  semesters: z.array(SemesterSchema).min(1, "At least one semester is required"),
});

export type RoadmapFormSchemaType = z.infer<typeof RoadmapFormSchema>;
