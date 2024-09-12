import React, { useState, useEffect } from 'react'
import DropDown from '../DropDown';
import ErrorPopUp from '../ErrorPopUp';
import MultitypeChart from '../charts/MultitypeChart'
import { Spinner } from "@nextui-org/spinner"
import { chartAttributes } from '@/types';

export default function VisualiseTrendAcrossBiddingWindows({courseCode, width, height} : {courseCode: string, width: string, height: string}) {
    
    const apiURL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL

    const [error, setError] = useState<any>(null)

    const [courseInstructorsDropdownArr, setCourseInstructorsDropdownArr] = useState<string[]>()
    const [courseInstructorSelected, setCourseInstructorSelected] = useState<string>("")

    const [termDropdownArr, setTermDropdownArr] = useState<string[]>([])
    const [isTermDropdownVisible, setIsTermDropdownVisible] = useState<boolean>(false)
    const [selectedTerm, setTerm] = useState<string>("")

    const [hideDetailedCharts, setHideDetailedCharts] = useState<boolean>(false)

    // Manage state for filter by specified bidding window: to plot bid price against all regular terms for specified window
    const [chartDataAcrossBiddingWindow, setChartDataAcrossBiddingWindow] = useState<chartAttributes>()
    const [termsUpdated, setTermsUpdated] = useState<boolean>(false)

    const fetchAvailableTermsOfInstructorWhoTeachCourse = async (courseCode: string, instructorName: string) => {
        try {
            const response = await fetch(`${apiURL}/instructordata/terms_available/${courseCode}/${instructorName}`)
            const jsonPayload = await response.json()
            const biddingWindowDropdownOptions = jsonPayload.data
            setTermDropdownArr(biddingWindowDropdownOptions || [])
            setTermsUpdated(true)
        } catch (error: any) {
            // setError(error)
            // console.error(error)
            setTermDropdownArr(["No historic Terms"])
            setTermsUpdated(true)
        }
    }

    const handleInstructorSelect = async (instructorSelected: string) => {
        setCourseInstructorSelected(instructorSelected)
        // reset dropdown options
        setTerm("")
        setTermDropdownArr([])
        // as we need to fetch terms again
        setTermsUpdated(false)
        // hide charts until bidding window selected
        setHideDetailedCharts(true)
        // Now we fetch the windows in which this course has been bid for in the past
        await fetchAvailableTermsOfInstructorWhoTeachCourse(courseCode, instructorSelected)
        // Make bidding window dropdown visible
        setIsTermDropdownVisible(true)
    }
    const update_before_after_vacancy_data = async (chartDataInstructorsBiddingWindow: chartAttributes, term: string) => {
        try {
            const response = await fetch(`${apiURL}/coursedata/bidpriceacrosswindows/vacancies/${courseCode}/${term}/${courseInstructorSelected}`)
            // if (!response.ok) {
            //     throw new Error(`${response.status}`)
            // }
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
                // // added in logic to break up bidding window label for incoming freshmen or exchange windows as they are too long (in mobile view port)
                // let labelsTemp = chartDataInstructorsBiddingWindow.chartData.labels
                // try {
                //     for (let i = 0; i < labelsTemp.length; i++) {
                //         const label = labelsTemp[i].toLowerCase()
                //         if (label.includes("Incoming Exchange ")) {
                //             const round_string = label.split("Incoming Exchange ")[0]
                //             labelsTemp[i] = "Inc Exc " + round_string
                //         } 
                //         // else if (label.toLowerCase().includes("Incoming Freshmen ")) {
                //         //     const round_string = label.split("Incoming Freshmen ")[0]
                //         //     labelsTemp[i] = "Inc Freshie " + round_string
                //         // }
                //     }
                // } catch (error: any) {
                //     console.log(error)
                // }
                
                // setChartDataAcrossBiddingWindow(brokeUpLongWindowLabelStrings)
                setChartDataAcrossBiddingWindow(updatedVacanciesInChartData)
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
    const handleTermSelect = async (term: string) => {
        setTerm(term)
        try {
            const response = await fetch(`${apiURL}/coursedata/bidpriceacrosswindows/${courseCode}/${term}/${courseInstructorSelected}`)
            const jsonPayload = await response.json()
            update_before_after_vacancy_data(jsonPayload, term) // state change is made in this update function
            // show charts again
            setHideDetailedCharts(false)
        } catch (error: any) {
            setError(error)
            console.error(error)
        }
    }

    useEffect(() => {
        // Fetch dropdown options array for select instructor on page refresh
        const fetchInstructorsWhoTeachCourseCode = async () => {
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

        fetchInstructorsWhoTeachCourseCode()
    }, [apiURL, courseCode])

    useEffect(() => {
        // to load chart on first page load
        if (termsUpdated && termDropdownArr.length > 0) {
            handleTermSelect(termDropdownArr[0])
        }
    }, [termsUpdated, termDropdownArr])

    // useEffect(() => {
    //     if (chartDataAcrossBiddingWindow) {
    //         scrollToDiv("VisualiseTrendAcrossBiddingWindows")
    //     }
    // }, [chartDataAcrossBiddingWindow])

    return (
        <>
            <h1 id="VisualiseTrendAcrossBiddingWindows" className='text-xl md:text-2xl font-extrabold pb-5'>Bid Price Trend Across Bidding Windows For Specified Term</h1>
            {error ? (
                <ErrorPopUp errorMessage={error.message}/>
            ) 
            : (
                <div className='flex flex-col gap-y-5 pb-5'>
                    <p className='text-gray-500 text-xs sm:text-sm'>select instructor and term:</p>
                    <div className='inline items-center'>
                        <DropDown 
                            category='Instructor'
                            onSelect={handleInstructorSelect}
                            options={courseInstructorsDropdownArr}
                        />
                    
                    {(isTermDropdownVisible && termDropdownArr.length > 0) && (
                        <DropDown 
                            category='Term'
                            onSelect={handleTermSelect}
                            options={termDropdownArr}
                        />
                    )}
                    </div>
                    {(!hideDetailedCharts && selectedTerm && chartDataAcrossBiddingWindow) ? (
                        <div className='px-5 sm:px-8'>
                            <MultitypeChart 
                                type="line"
                                title={chartDataAcrossBiddingWindow.title}
                                chartData={chartDataAcrossBiddingWindow.chartData} 
                                width={width}
                                height={height}
                                key={`${width}-${height}`} // We are forcing a re-render whenever the width and height change since we need to display the updated canvas image
                                // Note: When the key changes, React will unmount the current component instance and mount a new one, effectively forcing a re-render
                            />
                        </div>
                        
                    ): (
                        <div className='flex justify-center items-center'>
                            <Spinner color="primary"/>
                        </div>   
                    )}
                </div>
            )}
        </>
    )
}


