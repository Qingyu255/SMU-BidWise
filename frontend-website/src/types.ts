import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { Position, XYPosition } from '@xyflow/react';
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
  position: XYPosition;
  data: {
    label: string;
  };
  targetPosition?: Position; // Add this property
  sourcePosition?: Position; // Add this property
  selected?: boolean;
  deletable?: boolean;
  selectable?: boolean;
  width?: number;
  height?: number;
  dragHandle?: string;
  draggable?: boolean;
  parentId?: string;
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