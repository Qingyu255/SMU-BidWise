"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import Link from "next/link";


export interface CourseSummaryCardProps {
    course_code: string;
    title: string;
    career: string;
    description: string;
    enrolment_requirements: string;
    units: string;
}

export default function CourseSummaryCard({ course_code, title, career, description, enrolment_requirements, units }: CourseSummaryCardProps) {
    return (
        <div className="flex justify-center p-4">
            <Card className="w-full bg-background text-foreground">
                <CardHeader>
                    <Link href={"courses/" + course_code}>
                        <CardTitle className="text-xl lg:text-2xl flex flex-row cursor-pointer hover:text-muted">
                            <span className="flex items-center">{course_code}</span>
                            <Separator className="mx-2 my-[5px] h-100 w-[2px]" orientation="vertical"/>
                            <span className="flex items-center">{title}</span>
                        </CardTitle>
                    </Link>
                    <CardDescription className="text-base lg:text-lg">
                        Career: {career}
                    </CardDescription>
                    <CardDescription>
                        Units: {units} CU
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Separator className="mb-2"/>
                    <div className="mb-4">
                        <p className="text-sm font-semibold">Description</p>
                        <p className="text-sm">{description}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Enrolment Requirements</p>
                        <p className="text-sm">{enrolment_requirements}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
