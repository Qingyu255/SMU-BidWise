"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  LineController,
  BarController,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { chartAttributes } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  LineController,
  BarController,
);

const colors = [
  { line: "#2563eb", fill: "#2563eb" },
  { line: "#0ea5e9", fill: "#0ea5e9" },
  { line: "#93c5fd", fill: "rgba(147,197,253,0.75)" },
  { line: "#bae6fd", fill: "rgba(186,230,253,0.8)" },
];

export default function MultitypeChart({ chartData }: chartAttributes) {
  const data = {
    ...chartData,
    datasets: chartData.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: colors[index]?.line || "#64748b",
      backgroundColor: colors[index]?.fill || "#94a3b8",
      borderWidth: index < 2 ? 2.5 : 1,
      borderDash: index === 1 ? [5, 4] : [],
      tension: 0.32,
      pointRadius: index < 2 ? 3 : 0,
      pointHoverRadius: 5,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 18,
          color: "#64748b",
          font: { size: 11 },
        },
      },
      tooltip: { backgroundColor: "#17203c", padding: 12, cornerRadius: 10 },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#64748b", maxRotation: 45, font: { size: 11 } },
      },
      y: {
        type: "linear" as const,
        position: "left" as const,
        beginAtZero: true,
        border: { display: false },
        grid: { color: "#e2e8f0" },
        ticks: { color: "#64748b", font: { size: 11 } },
        title: { display: true, text: "Bid price", color: "#64748b" },
      },
      y1: {
        type: "linear" as const,
        position: "right" as const,
        beginAtZero: true,
        border: { display: false },
        grid: { drawOnChartArea: false },
        ticks: { color: "#64748b", font: { size: 11 } },
        title: { display: true, text: "Vacancies", color: "#64748b" },
      },
    },
  };

  return (
    <div className="h-[380px] min-w-[360px] w-full sm:h-[440px]">
      <Chart type="line" data={data} options={options} />
    </div>
  );
}
