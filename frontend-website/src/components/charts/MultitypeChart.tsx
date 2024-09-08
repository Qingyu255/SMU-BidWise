"use client"
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Legend,
  LineController,
  BarController,
  ChartOptions,
  elements
} from "chart.js"
import { Chart }  from 'react-chartjs-2'
import { ChartType } from 'chart.js'
import { chartAttributes } from '@/types';


// Register ChartJS components using ChartJS.register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Title,
  Legend,
  LineController,
  BarController
)

export default function MultitypeChart( {type, title, chartData, width, height} : chartAttributes ) {
  const chartType: ChartType = "line" 
  const options = {
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderRadius: 3
      }
    },
    tooltips: {
      enabled: true,
      mode: 'label' as const,
    },
    plugins: {
      stacked: false,
      title: {
        display: true,
        text: title,
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: "Median 'Median Bid' Price",
          // color: 'rgb(0, 0, 0)',  // Color to match the line
        },
        ticks: {
          // color: 'rgb(0, 0, 0)',  // Color to match the line
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Vacancies',
          // color: 'rgb(0, 0, 0)',  // Color to match the bar
        },
        ticks: {
          color: 'rgb(255, 99, 132)',  // Color to match the bar
        },
      },
    },
  }

  return (
    <div className='flex flex-col justify-center items-center max-h-[750px]'>
      <Chart type={chartType} data={chartData} options={options} width={width} height={height}/>
    </div>
  )
}
