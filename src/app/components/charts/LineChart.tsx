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

type Dataset = {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
}

type ChartData = {
  responsive: boolean
  labels: string[]
  datasets: Dataset[]
}

type chartAttributes = {
  title: string
  chartData: ChartData
  width: string
  height: string
}

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
