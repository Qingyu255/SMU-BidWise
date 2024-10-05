"use client"
import React, { useState, useEffect } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import ErrorPopUp from '@/components/ErrorPopUp'
import BarChart from '@/components/charts/BarChart'
import adjustChartWidthHeight from '@/components/charts/chartUtils/adjustChartWidthHeight'
import VisualiseTrendAcrossSemesters from '@/components/interactiveCharts/VisualiseTrendAcrossSemesters'
import VisualiseTrendAcrossBiddingWindows from '@/components/interactiveCharts/VisualiseTrendAcrossBiddingWindows'
import VisualiseBidPriceForSpecificInstructorTermSection from '@/components/interactiveCharts/VisualiseBidPriceForSpecificInstructorTermSection'
import { Spinner, user } from '@nextui-org/react'
import { ChartData, Dataset, chartAttributes } from '@/types';
import { SearchBox } from './components/SearchBox';
import { Button } from '@/components/ui/button';
import Link from 'next/link'
import { BookText } from 'lucide-react';

export default function Page() {
    const apiURL = process.env.NEXT_PUBLIC_ANALYTICS_API_URL
    // const courseCode: string = params.courseCode.toUpperCase()
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const courseCodeParam = searchParams.get('courseCode');
    const defaultCourseCode = "COR-STAT1202";
    const [courseCode, setCourseCode] = useState<string>(courseCodeParam ? courseCodeParam.toUpperCase() : defaultCourseCode); // default
    const [courseName, setCourseName] = useState<string>("")
    const [chartDataOverview, setChartDataOverview] = useState<chartAttributes>()
    const [chartDataInstructorOverview, setChartDataInstructorOverview] = useState<chartAttributes>()
    const [error, setError] = useState<any>(null)
    const [chartWidthHeightArr, setChartWidthHeightArr] = useState<string[]>(["", ""])
    const [isSCISCourse, setIsSCISCourse] = useState<boolean>(false)

    

    useEffect(() => {
        setCourseCode(courseCodeParam ? courseCodeParam.toUpperCase() : defaultCourseCode);
    }, [courseCodeParam]);

    useEffect(() => {
        const fetchCourseName = async () => {
            try {
                const response = await fetch(`${apiURL}/coursename/${courseCode}`)
                if (!response.ok) {
                    const errorResponse = await response.json()
                    throw new Error(`${response.status}: ${errorResponse.detail}`) 
                }
                const courseName = await response.json()
                setCourseName(courseName)
                // courseCode should be in upper case
                if (courseCode.slice(0, 2) == "IS" || courseCode.slice(0, 2) == "CS" || courseCode.slice(0, 6) == "COR-IS" ) {
                    // show button for scis students to navigate to official course description
                    setIsSCISCourse(true)
                }
            } catch (error: any) {
                setCourseName("Not Found")
                setError(error)
                console.error(error)
            }
        }
        const fetchCourseMinMaxMeanMedianMedianData = async () => {
            try {
                // try to fetch from api end point for the Course Min Max Mean Median Median Data
                const response = await fetch(`${apiURL}/coursedata/overview/${courseCode}`)
                if (!response.ok) {
                    const errorResponse = await response.json()
                    throw new Error(`${response.status}: ${errorResponse.detail}`)                }
                const chartData = await response.json()
                setChartDataOverview(chartData)
            } catch (error: any) {
                setError(error)
                console.error(error)
            }
        }
        const fetch_all_instructor_median_median_bid_by_course_code = async () => {
            try {
                // try to fetch from api end point for the Course Min Max Mean Median Median Data
                const response = await fetch(`${apiURL}/coursedata/overview/instructor_median_bid_chart/${courseCode}`)
                if (!response.ok) {
                    const errorResponse = await response.json()
                    throw new Error(`${response.status}: ${errorResponse.detail}`)
                }
                const chartDataInstructorOverview = await response.json()
                setChartDataInstructorOverview(chartDataInstructorOverview)
            } catch (error: any) {
                setError(error)
                console.error(error)
            }
        }
        fetchCourseName()
        fetchCourseMinMaxMeanMedianMedianData()
        fetch_all_instructor_median_median_bid_by_course_code()
        
    }, [courseCode, courseCodeParam, apiURL]);

    useEffect(() => {
        const handleResize = () => {
            // Use ref to get the latest chart data
            const updatedWidthHeightArr: string[] = adjustChartWidthHeight()
            setChartWidthHeightArr(updatedWidthHeightArr) 
        }
        // Mount resize event listener
        window.addEventListener('resize', handleResize)
        // call handle resize immediately on page load
        handleResize()
        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const navigateToISCourseDescriptionPage = (courseCode: string) => {
        window.open("https://smu.sg/cdd-" + courseCode.toUpperCase(), "_blank")
    }

    return (
        <>
            <div className='flex flex-col pb-5'>
                <div className='lg:w-1/2'>
                    <SearchBox/>
                </div>
                <div className='flex flex-col md:flex-row md:justify-between md:items-center'>
                    <div>
                        <p className='py-3 md:py-8 text-lg sm:text-xl md:text-2xl font-bold'>{courseCode} - {courseName}</p>
                    </div>
                    <Link href={"/courses/" + courseCode}>
                        <Button className='text-xs font-semibold w-fit'>
                            <BookText/>
                            <span className='px-2'>Course Information</span>
                        </Button>
                    </Link>       
                </div>
                {/* <p className='py-3 md:py-8 text-lg sm:text-xl md:text-2xl font-bold'>{courseCode} - {courseName}</p> */}
                {error ? (
                    <ErrorPopUp errorMessage={error.message}/>
                ) 
                : (chartDataOverview && chartDataInstructorOverview ? (
                    <>
                        {isSCISCourse && (
                            <Button key={isSCISCourse.toString()} onClick={() => navigateToISCourseDescriptionPage(courseCode)} className='flex justify-left p-1 px-1.5 mb-2 sm:mb-4 w-fit text-xs sm:text-sm'>
                                View SMU Course Document
                            </Button>
                        )}
                        <div className='flex flex-col gap-y-5'>
                            <div className='flex flex-col'>
                                <BarChart
                                    title={chartDataInstructorOverview.title} 
                                    chartData={chartDataInstructorOverview.chartData} 
                                    width={chartWidthHeightArr[0]} 
                                    height={chartWidthHeightArr[1]}
                                    key={`${chartWidthHeightArr[0]}-${chartWidthHeightArr[1]}-2`} // to force re-render
                                />
                                <p className='text-gray-500 text-xs sm:text-sm pt-3 sm:pt-5'>*Double click bar to see instructor&apos;s Afterclass reviews (if it exists)</p>
                            </div>
                            <hr></hr>
                            <div>
                                <VisualiseBidPriceForSpecificInstructorTermSection
                                    key={courseCode} // force re-render on courseCode change (temp fix)
                                    courseCode={courseCode} 
                                    width={chartWidthHeightArr[0]}  
                                    height={chartWidthHeightArr[1]}
                                />
                                <VisualiseTrendAcrossSemesters 
                                    courseCode={courseCode} 
                                    width={chartWidthHeightArr[0]}  
                                    height={chartWidthHeightArr[1]}
                                />
                                <VisualiseTrendAcrossBiddingWindows
                                    courseCode={courseCode} 
                                    width={chartWidthHeightArr[0]}  
                                    height={chartWidthHeightArr[1]}
                                />
                            </div>
                            <hr></hr>
                            <h1 className='text-xl md:text-2xl font-extrabold pb-5'>Bid Price Overview for {courseCode}</h1>
                            <BarChart 
                                title={chartDataOverview.title} 
                                chartData={chartDataOverview.chartData} 
                                width={chartWidthHeightArr[0]} 
                                height={chartWidthHeightArr[1]}
                                key={`${chartWidthHeightArr[0]}-${chartWidthHeightArr[1]}-1`} // We are forcing a re-render whenever the width and height change since we need to display the updated canvas image
                                // Note: When the key changes, React will unmount the current component instance and mount a new one, effectively forcing a re-render
                            />
                        </div>
                    </>
                ) : (
                    <div className='flex justify-center items-center pb-8'>
                        <Spinner color="default"/>
                    </div>   
                ))}
            </div>
        </>
    )
}
