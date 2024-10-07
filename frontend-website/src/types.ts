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
  plannedBid?: number
}
export interface SeniorRoadmap {
  name: string;
  title: string;
  description: string;
}

export interface RoadmapsProps {
  seniorRoadmaps: SeniorRoadmap[];
  onClick: (seniorName: string) => void;
}

export interface RoadmapCardProps {
  title: string;
  description: string;
  onClick: () => void;
}


export interface SeniorName {
  name: string;
}


export interface HeadingCardProps {
  handleClick: () => void;
}