import React, { useState, useEffect } from 'react'
import DropDown from '../DropDown';
import ErrorPopUp from '../ErrorPopUp';
import MultitypeChart from '../charts/MultitypeChart';

type MultitypeChartDataset = {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    fill: boolean
    yAxisID: string
}

type ChartData = {
    responsive: boolean
    labels: string[]
    datasets: MultitypeChartDataset[]
}

type chartAttributes = {
    type?: string
    title: string
    chartData: ChartData
    width: string
    height: string
  }

export default function VisualiseBidPriceForSpecificInstructorTermSection({courseCode, width, height} : {courseCode: string, width: string, height: string}) {

    const apiURL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL

    const [error, setError] = useState<any>(null)

    const [courseInstructorsDropdownArr, setCourseInstructorsDropdownArr] = useState<string[]>()
    const [courseInstructorSelected, setCourseInstructorSelected] = useState<string>("")

    const [termDropdownArr, setTermDropdownArr] = useState<string[]>([])
    const [isTermDropdownVisible, setIsTermDropdownVisible] = useState<boolean>(false)
    const [selectedTerm, setTerm] = useState<string>("")
    const [selectedSection, setSection] = useState<string>("")

    const [sectionDropdownArr, setSectionDropdownArr] = useState<string[]>([])
    const [isSectionDropdownVisible, setIsSectionDropdownVisible] = useState<boolean>(false)

    const [hideDetailedCharts, setHideDetailedCharts] = useState<boolean>(false)

    // Manage state for filter by specified bidding window: to plot bid price against all regular terms for specified window
    const [chartDataAcrossBiddingWindow, setChartDataAcrossBiddingWindow] = useState<chartAttributes>()

    const fetchAvailableTermsOfInstructorWhoTeachCourse = async (courseCode: string, instructorName: string) => {
        try {
            const response = await fetch(`${apiURL}/instructordata/terms_available/${courseCode}/${instructorName}`)
            const jsonPayload = await response.json()
            const biddingWindowDropdownOptions = jsonPayload.data
            setTermDropdownArr(biddingWindowDropdownOptions || [])
        } catch (error: any) {
            // setError(error)
            // console.error(error)
            setTermDropdownArr(["No historic Terms"])
        }
    }

    const fetchAvailableSections = async (term: string) => {
        try {
            const response = await fetch(`${apiURL}/instructordata/sections_available/${courseCode}/${courseInstructorSelected}/${term}`)
            const jsonPayload = await response.json()
            setSectionDropdownArr(jsonPayload.data|| [])
            setIsSectionDropdownVisible(true)
        } catch (error: any) {
            // setError(error)
            // console.error(error)
            setSectionDropdownArr(["Error: No historic Sections Found"])
        }
    }

    const handleInstructorSelect = (instructorSelected: string) => {
        setCourseInstructorSelected(instructorSelected)
        // reset dropdown options
        // setTerm("")
        setTermDropdownArr([])
        // hide charts until bidding window selected
        setHideDetailedCharts(true)
        // Now we fetch the windows in which this course has been bid for in the past
        fetchAvailableTermsOfInstructorWhoTeachCourse(courseCode, instructorSelected)
        setIsSectionDropdownVisible(false)
        // Make bidding window dropdown visible
        setIsTermDropdownVisible(true)
    }

    const handleTermSelect = async (term: string) => {
        setTerm(term)
        try {
            setSectionDropdownArr([])
            fetchAvailableSections(term)
        } catch (error: any) {
            setError(error)
            console.error(error)
        }
    }

    const update_before_after_vacancy_data = async (chartDataInstructorsBiddingWindow: chartAttributes, section: string) => {
        try {
            const response = await fetch(`${apiURL}/coursedata/sectionbidpriceacrosswindows/vacancies/${courseCode}/${selectedTerm}/${courseInstructorSelected}/${section}`)
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
                console.log(updatedVacanciesInChartData)
                setChartDataAcrossBiddingWindow(updatedVacanciesInChartData)
            } else {
                console.error("chartData or chartDataInstructorsBiddingWindow is undefined")
            }
        } catch (error: any) {
            setError(error)
            console.error(error)
        }
    }

    const scrollToDiv = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // Note that we can only handle winding window after courseInstructorSelected is set
    const handleSectionSelect = async (section: string) => {
        setSection(section)
        try {
            const response = await fetch(`${apiURL}/coursedata/sectionbidpriceacrosswindows/${courseCode}/${selectedTerm}/${courseInstructorSelected}/${section}`)
            const jsonPayload = await response.json()
            update_before_after_vacancy_data(jsonPayload, section) // state change is made in this update function
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
                setCourseInstructorsDropdownArr(jsonPayload.data)
            } catch (error: any) {
                setError(error)
                console.error(error)
            }
        }

        fetchInstructorsWhoTeachCourseCode()
    }, [apiURL, courseCode])

    useEffect(() => {
        if (chartDataAcrossBiddingWindow) {
            scrollToDiv("VisualiseBidPriceForSpecificInstructorTermSection")
        }
    }, [chartDataAcrossBiddingWindow])

    return (
        <>
            <h1 id="VisualiseBidPriceForSpecificInstructorTermSection" className='text-xl md:text-2xl font-extrabold pb-5'>Bid Price Across Bidding Windows For Specified Term and Section</h1>
            {error ? (
                <ErrorPopUp error={error}/>
            ) 
            : (
                <div className='flex flex-col gap-y-5 pb-5'>
                    <div className='flex flex-row justify-left items-center gap-x-5'>
                        <DropDown 
                            category='Instructor'
                            onSelect={handleInstructorSelect}
                            options={courseInstructorsDropdownArr}
                            showFirstOption={false}
                        />

                    {(isTermDropdownVisible && termDropdownArr.length > 0) && (
                        <DropDown 
                            category='Term'
                            onSelect={handleTermSelect}
                            options={termDropdownArr}
                            showFirstOption={false}
                        />
                    )}
                    {(isSectionDropdownVisible && sectionDropdownArr.length > 0) && (
                        <DropDown 
                            category='Section'
                            onSelect={handleSectionSelect}
                            options={sectionDropdownArr}
                            showFirstOption={false}
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
                    ) : (
                        <div className='flex justify-center items-center w-full border-2 rounded-xl h-36 text-gray-400 text-xs md:text-md'>
                            Select Fields to View Chart!
                        </div>
                    )}
                </div>
            )}
        </>
    )
}