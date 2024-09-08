import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

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