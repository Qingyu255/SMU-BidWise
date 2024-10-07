"use client"
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { courseInfo, NodeData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import Link from "next/link";
import Rating from "@/components/Rating";
import { ScrollArea } from "@/components/ui/scroll-area"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import createClient  from '@/utils/supabase/client';

type CourseNodeProps = {
  data: {
    course_code: string
  }
}


const CourseNode = ({ data }: CourseNodeProps) => {

  const supabase = createClient();

    const [courseData, setCourseData] = useState<courseInfo[]>([]);

    useEffect(() => {
      const fetchCourseData = async () => {
        const { data: courseData, error } = await supabase
          .from('course_info')
          .select('*')
          .eq('course_code', data.course_code);

          if (error) {
            console.error(error);
          } else if (courseData) {
            
            setCourseData(courseData as unknown as courseInfo[]);
          }
      };
      fetchCourseData();
    }, [data.course_code, supabase]);

  // console.log(courseData)

    

     
    return (
      

          <Sheet>
            <SheetTrigger asChild>
              <div style={{
                padding: '10px 40px',
                
              }}>
                <div>{data.course_code}</div>
                

                
                {/* Define 4 different source handles */}
                <Handle
                  type="source"
                  position={Position.Left}
                  style={{ width: '0',
                    height: '0',
                    background: 'transparent',
                    border: 'none' }}
                  id='l-src'
                />
                <Handle
                  type="source"
                  position={Position.Right}
                  style={{ width: '0',
                    height: '0',
                    background: 'transparent',
                    border: 'none' }}
                  id='r-src'
                />
                <Handle
                  type="source"
                  position={Position.Top}
                  style={{ width: '0',
                    height: '0',
                    background: 'transparent',
                    border: 'none' }}
                  id='t-src'
                />
                <Handle
                  type="source"
                  position={Position.Bottom}
                  style={{ width: '0',
                    height: '0',
                    background: 'transparent',
                    border: 'none' }}
                  id='b-src'
                />
                
                {/*Target handle to allow incoming edges */}
                <Handle
                  type="target"
                  position={Position.Left}
                  style={{ width: '0',
                    height: '0',
                    background: 'transparent',
                    border: 'none' }}
                  id='l-target'
                />
                <Handle
                  type="target"
                  position={Position.Right}
                  style={{ width: '0',
                    height: '0',
                    background: 'transparent',
                    border: 'none' }}
                  id='r-target'
                />
                <Handle
                  type="target"
                  position={Position.Top}
                  style={{width: '0',
                    height: '0',
                    background: 'transparent',
                    border: 'none' }}
                  id='t-target'
                />
                <Handle
                  type="target"
                  position={Position.Bottom}
                  style={{ width: '0',
                    height: '0',
                    background: 'transparent',
                    border: 'none' }}
                  id='b-target'
                />
              </div>
            </SheetTrigger>

            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>{courseData[0]?.title}</SheetTitle>
              </SheetHeader>
              <ScrollArea>
              <div className="flex justify-center py-4">
              <Card className="w-full bg-background text-foreground">
                <div>
                <CardHeader>
                    <Link href={"courses/" + courseData[0]?.course_code}>
                        <CardTitle className="text-xl lg:text-2xl flex flex-row cursor-pointer hover:text-slate-500">
                            <span className="flex items-center">{courseData[0]?.course_code}</span>
                            <Separator className="mx-2 my-[5px] h-100 w-[2px]" orientation="vertical"/>
                            <span className="flex items-center">{courseData[0]?.title}</span>
                        </CardTitle>
                    </Link>
                    <CardDescription className="">
                        Career: {courseData[0]?.career}
                    </CardDescription>
                    <CardDescription>
                        Units: {courseData[0]?.units} CU
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <Separator className="mb-2"/>
                    <div className="flex flex-col">
                        <div>
                            <div className="mb-4">
                                <p className="text-sm font-semibold">Description</p>
                                <p className="text-sm">{courseData[0]?.description}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Enrolment Requirements</p>
                                <p className="text-sm">{courseData[0]?.enrolment_requirements}</p>
                            </div>
                        </div>
                        <div className='py-2 md:px-4 flex flex-row md:flex-col gap-x-3 gap-y-0 md:gap-y-2'>
                            <Rating
                                courseId={courseData[0]?.id}
                                ratingName='Fluff'
                                fillColour='#4c68ee' 
                                ratingDescription="The 'Fluff Rating' indicates how much non-technical content a course contains." 
                            />
                            <Rating
                                courseId={courseData[0]?.id}
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
            </ScrollArea>

              <SheetFooter>
                <SheetClose asChild>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

      
    );
  };
  
  export default CourseNode;