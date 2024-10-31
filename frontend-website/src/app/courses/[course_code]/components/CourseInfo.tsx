import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChartNoAxesCombined } from 'lucide-react';
import RatingsCombined from "@/components/RatingsCombined";

export interface CourseInfoProps {
  id: string;
  course_code: string;
  title: string;
  career: string;
  units: string;
  grading_basis: string;
  description: string;
  enrolment_requirements: string;
}

export function CourseInfo({courseInfo, courseAreas, updated_at} : {courseInfo: CourseInfoProps, courseAreas: any, updated_at?: string}) {

  return (
    <Card className=" rounded-lg">
      <CardHeader>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0'>
        <div>
          <CardTitle className="text-xl md:text-2xl font-bold inline">{courseInfo.title}</CardTitle>
          <CardTitle className="text-base md:text-lg">
            <span className="font-semibold">Course Code:</span> {courseInfo.course_code}
          </CardTitle>
        </div>
        {(["undergraduate", "course career"].includes(courseInfo.career.toLowerCase())) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={"/bid-analytics?courseCode=" + courseInfo.course_code} className='w-fit'>
                  <Button className='text-xs font-semibold w-fit'>
                    <ChartNoAxesCombined className='inline'/><span className='inline-block px-2'>View Bid Analytics</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Analyse price trends for {courseInfo.course_code}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        </div>
        
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className='flex flex-row gap-5 md:gap-10'>
            <div className='flex flex-col gap-y-4'>
              <div>
                <p className="font-semibold">Career</p>
                <p className="text-sm ">{courseInfo.career}</p>
              </div>
              <div>
                <p className="font-semibold ">Units</p>
                <p className="text-sm ">{courseInfo.units}</p>
              </div>
            </div>
            <div>
              <p className="font-semibold ">Grading Basis</p>
              <p className="text-sm ">{courseInfo.grading_basis}</p>
            </div>
          </div>
          <div>
            <p className="text-base font-semibold ">Enrolment Requirements</p>
            <p className="text-base">{courseInfo.enrolment_requirements}</p>
          </div>
        </div>
        <p className="text-base font-semibold  mb-2">Description</p>
        <p className="text-base mb-4">{courseInfo.description}</p>

        <p className="text-base font-semibold  mb-2">Course Areas</p>
        <div>
          {courseAreas.map((area: string, index: number) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* <Button variant="outline"></Button> */}
                  <Link className='mr-2 hover:cursor-pointer' href={"/courses?area=" + encodeURIComponent(area)}>
                    <Badge>{area}</Badge>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View courses in area: {area}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <RatingsCombined 
          courseId={courseInfo.id}
          isRatingAllowed={true}
        />
        

      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        {updated_at ? (
          <p>Last synced with BOSS: {updated_at}</p>
        ) : (
          <p>Updated information based on the latest term on SMU BOSS</p>
        )}
      </CardFooter>
    </Card>
  );
}
