import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import Link from "next/link";
import Rating from "@/components/Rating";

export interface CourseSummaryCardProps {
    course_id: string;
    course_code: string;
    title: string;
    career: string;
    description: string;
    enrolment_requirements: string;
    units: string;
}

export default function CourseSummaryCard({ course_id, course_code, title, career, description, enrolment_requirements, units }: CourseSummaryCardProps) {
    return (
        <div className="flex justify-center py-4">
            <Card className="w-full bg-background text-foreground">
                <div>
                <CardHeader>
                    <Link href={"courses/" + course_code}>
                        <CardTitle className="text-xl lg:text-2xl flex flex-row cursor-pointer hover:text-slate-500">
                            <span className="flex items-center">{course_code}</span>
                            <Separator className="mx-2 my-[5px] h-100 w-[2px]" orientation="vertical"/>
                            <span className="flex items-center">{title}</span>
                        </CardTitle>
                    </Link>
                    <CardDescription className="">
                        Career: {career}
                    </CardDescription>
                    <CardDescription>
                        Units: {units} CU
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <Separator className="mb-2"/>
                    <div className="flex flex-col md:flex-row">
                        <div>
                            <div className="mb-4">
                                <p className="text-sm font-semibold">Description</p>
                                <p className="text-sm">{description}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Enrolment Requirements</p>
                                <p className="text-sm">{enrolment_requirements}</p>
                            </div>
                        </div>
                        <div className='py-2 md:px-4 flex flex-row md:flex-col gap-x-3 gap-y-0 md:gap-y-2'>
                            <Rating
                                courseId={course_id}
                                ratingName='Fluff'
                                fillColour='#4c68ee' 
                                ratingDescription="The 'Fluff Rating' indicates how much non-technical content a course contains." 
                            />
                            <Rating
                                courseId={course_id}
                                ratingName='Workload'
                                fillColour='#f4a261'
                                ratingDescription="The 'Workload Rating' provides an estimate of the effort and time commitment required for the course." 
                            />
                        </div>
                    </div>
                </CardContent>
                </div>
                
            </Card>
            
        </div>
    )
}
