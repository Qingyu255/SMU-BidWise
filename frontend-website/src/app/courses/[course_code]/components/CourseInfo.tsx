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
import { useRouter } from 'next/navigation';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface CourseInfoProps {
  course_code: string;
  title: string;
  career: string;
  units: string;
  grading_basis: string;
  description: string;
  enrolment_requirements: string;
}

export function CourseInfo({courseInfo} : {courseInfo: CourseInfoProps}) {
  const router = useRouter();
  return (
    <Card className=" rounded-lg">
      <CardHeader>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0'>
        <CardTitle className="text-xl md:text-2xl font-bold inline">{courseInfo.title}</CardTitle>
          <Button className='text-xs inline font-semibold w-fit' onClick={() => {router.push("/bid-analytics?courseCode=" + courseInfo.course_code)}}>
            View Bid Price Analytics
          </Button>
        </div>
        <CardTitle className="text-base md:text-lg">
          <span className="font-semibold">Course Code:</span> {courseInfo.course_code}
        </CardTitle>
        
        
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

      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        <p>Updated information based on the latest term on SMU BOSS</p>
      </CardFooter>
    </Card>
  );
}
