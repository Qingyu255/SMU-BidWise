"use client"
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  PointElement,
  LineElement,
  Title,
  Legend
} from "chart.js"
import { Line }  from 'react-chartjs-2'
import { ChartData, Dataset, chartAttributes } from '@/types';

// Register ChartJS components using ChartJS.register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Title,
  Legend
)


export default function LineChart( {title, chartData, width, height} : chartAttributes ) {

  const options = {
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      maintainAspectRatio: false
    }
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <Line data={chartData} options={options} width={width} height={height}/>
    </div>
  )
}
