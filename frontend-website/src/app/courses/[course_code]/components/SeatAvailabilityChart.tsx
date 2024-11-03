"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type SeatAvailabilityData = {
  section: string;
  availableSeats: number;
  currentEnrolled: number;
  reserved: number;
};

const chartConfig = {
  currentEnrolled: {
    label: "Current Enrolled",
    color: "#93c5fd",
  },
  availableSeats: {
    label: "Available Seats",
    color: "#2563eb",
  },
  reserved: {
    label: "Reserved",
    color: "#60a5fa",
  },
} satisfies ChartConfig

type SeatAvailabilityChartProps = {
  chartData: SeatAvailabilityData[],
}

export function SeatAvailabilityChart({ chartData } : SeatAvailabilityChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="section"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          dataKey="availableSeats"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="availableSeats" fill="var(--color-availableSeats)" radius={4} />
        {/* <Bar dataKey="currentEnrolled" fill="var(--color-currentEnrolled)" radius={4} /> */}
        <Bar dataKey="reserved" fill="var(--color-reserved)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
