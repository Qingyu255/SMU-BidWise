'use client'
import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  BarController,
  BarElement,
  Title,
  Legend,
  // elements
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { chartAttributes } from '@/types';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Tooltip,
  Title,
  Legend
)

export default function BarChart({ title, chartData, width, height }: chartAttributes) {

  const [isClickTimerRunning, setIsClickTimerRunning] = useState<boolean>(false) 
  const [clickCount, setClickCount] = useState<number>(0)

  // adjust bar colour accordingly
  chartData.datasets[0].backgroundColor = "#2463EB";
  chartData.datasets[1].backgroundColor = "#60A8FB";

  const handleClick = (event: any, elements: any) => {
    if (elements.length === 0) {
      return
    }
    
    const chart = elements[0].element.$context.chart
    if (chart.options.plugins.title.text !== "Median and Mean 'Median Bid' Price against Instructors (across all sections and windows for Round 1 Window 1 from AY 2019/20 onwards)") {
      return
      // as we only want double click functionality for the above title
    }
    // update click like this temporarily as using setClickCount(clickCount + 1) wont work -> state change will only register after the function is completely ran
    const currentClickCount = clickCount + 1

    if (currentClickCount === 1) {
      // here if first click made
      setIsClickTimerRunning(true)
      setTimeout(() => {
        setClickCount(0)
      }, 300) // 300ms timeout for detecting double-click
      setClickCount(currentClickCount)
    } else {
      if (isClickTimerRunning === true) {
        // meaning our currentClickCount is 1 and the second click is made within 300ms
        setClickCount(0)
        setIsClickTimerRunning(false)
        if (elements.length > 0) {
          const instructor_name = chart.data.labels[elements[0].index] as string;
          const link = "https://www.afterclass.io/professor/smu-" + instructor_name.replace(".", "").split(" ").join("-").toLowerCase()
          window.open(link, '_blank') // will open link in a new tab
        }
      }
    }
  }

  const options = {
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderRadius: 3
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        beforeUpdate(axis: any) {
          const labels = axis.chart.data.labels
          for (let i = 0; i < labels.length; i++) {
            const label = labels[i]
            if (typeof label === 'string' && label.length > 21) {
              labels[i] = label.substring(0, 21) + "..."
            }
          }  
        },
        ticks: {
          font: {
            size: 10
          },
          maxRotation: 60,
        }
      }
    },
    
    onClick: handleClick
  }

  return (
    <div className='flex flex-col'>
      <div>
        <Bar data={chartData} options={options} width={width} height={height}/>
      </div>
    </div>
  );
}
