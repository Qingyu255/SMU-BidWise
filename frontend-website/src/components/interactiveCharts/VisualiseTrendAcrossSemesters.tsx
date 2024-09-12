import React, { useState, useEffect } from 'react'
import DropDown from '../DropDown';
import ErrorPopUp from '../ErrorPopUp';
import MultitypeChart from '../charts/MultitypeChart'
import { Spinner } from "@nextui-org/spinner"
import { chartAttributes } from '@/types';

export default function VisualiseTrendAcrossSemesters({courseCode, width, height} : {courseCode: string, width: string, height: string}) {
    
    const apiURL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL

    const [error, setError] = useState<any>(null)

    const [courseInstructorsDropdownArr, setCourseInstructorsDropdownArr] = useState<string[]>()
    const [courseInstructorSelected, setCourseInstructorSelected] = useState<string>("")

    const [biddingWindowDropdownArr, setBiddingWindowDropdownArr] = useState<string[]>([])
    const [isBiddingWindowDropdownVisible, setIsBiddingWindowDropdownVisible] = useState<boolean>(false)
    const [selectedBiddingWindow, setSelectedBiddingWindow] = useState<string>("")

    const [hideDetailedCharts, setHideDetailedCharts] = useState<boolean>(false)

    // Manage state for filter by specified bidding window: to plot bid price against all regular terms for specified window
    const [chartDataInstructorsBiddingWindow, setChartDataInstructorsBiddingWindow] = useState<chartAttributes>()
    const [windowsUpdated, setWindowsUpdated] = useState<boolean>(false)

    const fetchAvailableBiddingWindowsOfInstructorWhoTeachCourse = async (courseCode: string, instructorName: string) => {
        try {
            const response = await fetch(`${apiURL}/instructordata/bidding_windows_available/${courseCode}/${instructorName}`)
            const jsonPayload = await response.json()
            const biddingWindowDropdownOptions = jsonPayload.data
            setBiddingWindowDropdownArr(biddingWindowDropdownOptions || [])
            setWindowsUpdated(true)
        } catch (error: any) {
            // setError(error)
            // console.error(error)
            setBiddingWindowDropdownArr(["No historic bidding windows"])
            setWindowsUpdated(true)
        }
    }

    const handleInstructorSelect = async (instructorSelected: string) => {
        setCourseInstructorSelected(instructorSelected)
        // reset dropdown options
        setSelectedBiddingWindow("")
        setBiddingWindowDropdownArr([])
        // as we need to fetch windows again
        setWindowsUpdated(false)
        // hide charts until bidding window selected
        setHideDetailedCharts(true)
        // Now we fetch the windows in which this course has been bid for in the past
        await fetchAvailableBiddingWindowsOfInstructorWhoTeachCourse(courseCode, instructorSelected)
        // Make bidding window dropdown visible
        setIsBiddingWindowDropdownVisible(true)
    }
    const update_before_after_vacancy_data = async (chartDataInstructorsBiddingWindow: chartAttributes, biddingWindow: string) => {
        try {
            const response = await fetch(`${apiURL}/coursedata/bidpriceacrossterms/vacancies/${courseCode}/${biddingWindow}/${courseInstructorSelected}`)
            if (!response.ok) {
                throw new Error(`${response.status}`)
            }
            const jsonPayload = await response.json()
            const vacanciesDatasets = jsonPayload.data

            // we will update the existing chart data with the extra vacancies data
            if (chartDataInstructorsBiddingWindow && chartDataInstructorsBiddingWindow.chartData) {
                // this makes sure datasets is defined and is an array
                // const currentDatasets = chartDataInstructorsBiddingWindow.chartData.datasets || []
                const firstDatasetUpdated = {
                    ...chartDataInstructorsBiddingWindow.chartData.datasets[0],
                    type: 'line',
                    yAxisID: "y"
                }
                const updatedVacanciesInChartData = {
                    ...chartDataInstructorsBiddingWindow,
                    chartData: {
                        ...chartDataInstructorsBiddingWindow.chartData,
                        datasets: [firstDatasetUpdated, ...chartDataInstructorsBiddingWindow.chartData.datasets.slice(1), ...vacanciesDatasets]
                    }
                }
                setChartDataInstructorsBiddingWindow(updatedVacanciesInChartData)
            } else {
                console.error("chartData or chartDataInstructorsBiddingWindow is undefined")
            }
        } catch (error: any) {
            setError(error)
            console.error(error)
        }
    }

    // const scrollToDiv = (id: string) => {
    //     const element = document.getElementById(id)
    //     if (element) {
    //         element.scrollIntoView({ behavior: 'smooth' })
    //     }
    // }

    // Note that we can only handle winding window after courseInstructorSelected is set
    const handleBiddingWindowSelect = async (biddingWindow: string) => {
        setSelectedBiddingWindow(biddingWindow)
        try {
            const response = await fetch(`${apiURL}/coursedata/bidpriceacrossterms/${courseCode}/${biddingWindow}/${courseInstructorSelected}`)
            const jsonPayload = await response.json()
            update_before_after_vacancy_data(jsonPayload, biddingWindow) // state change is made in this update function
            // show charts again
            setHideDetailedCharts(false)
            // scrollToDiv("VisualiseTrendAcrossSemesters")
        } catch (error: any) {
            setError(error)
            console.error(error)
        }
    }

    useEffect(() => {
        // Fetch dropdown options array for select instructor on page refresh
        const fetch_instructors_who_teach_course_code = async () => {
            try {
                const response = await fetch(`${apiURL}/instructordata/instructor/${courseCode}`)
                if (!response.ok) {
                    const errorResponse = await response.json()
                    throw new Error(`${response.status}: ${errorResponse.detail}`)
                }
                const jsonPayload = await response.json()
                const instructors = jsonPayload.data
                setCourseInstructorsDropdownArr(instructors)

                // since we want to pre-populate data on first page load
                // set to first instructor in instructor array
                await handleInstructorSelect(instructors[0]) 
            } catch (error: any) {
                setError(error)
                console.error(error)
            }
        }
        fetch_instructors_who_teach_course_code()
    }, [apiURL, courseCode])

    useEffect(() => {
        // to load chart on first page load
        if (windowsUpdated && biddingWindowDropdownArr.length > 0) {
            handleBiddingWindowSelect(biddingWindowDropdownArr[0])
        }
    }, [windowsUpdated, biddingWindowDropdownArr])

    // useEffect(() => {
    //     if (chartDataInstructorsBiddingWindow) {
    //         scrollToDiv("VisualiseTrendAcrossSemesters")
    //     }
    // }, [chartDataInstructorsBiddingWindow])

    return (
        <>
            <h1 id="VisualiseTrendAcrossSemesters" className='text-xl md:text-2xl font-extrabold pb-5'>Bid Price Trend Across Semesters For Specified Window</h1>
            {error ? (
                <ErrorPopUp errorMessage={error.message}/>
            ) 
            : (
                <div className='flex flex-col gap-y-5 pb-5'>
                    <p className='text-gray-500 text-xs sm:text-sm'>select instructor and bidding window:</p>
                    <div className='inline items-center'>
                        <DropDown 
                            category='Instructor'
                            onSelect={handleInstructorSelect}
                            options={courseInstructorsDropdownArr}
                        />
                    
                    {(isBiddingWindowDropdownVisible && biddingWindowDropdownArr.length > 0) && (
                        <DropDown 
                            category='Bidding Window'
                            onSelect={handleBiddingWindowSelect}
                            options={biddingWindowDropdownArr}
                        />
                    )}
                    </div>
                    {(!hideDetailedCharts && selectedBiddingWindow && chartDataInstructorsBiddingWindow) ? (
                        <div className='px-5 sm:px-8'>
                            <MultitypeChart 
                                type="line"
                                title={chartDataInstructorsBiddingWindow.title}
                                chartData={chartDataInstructorsBiddingWindow.chartData} 
                                width={width}
                                height={height}
                                key={`${width}-${height}`} // We are forcing a re-render whenever the width and height change since we need to display the updated canvas image
                                // Note: When the key changes, React will unmount the current component instance and mount a new one, effectively forcing a re-render
                            />
                        </div>
                        
                    ): (
                        <div className='flex justify-center items-center'>
                            <Spinner color="default"/>
                        </div>   
                    )}
                </div>
            )}
        </>
    )
}


