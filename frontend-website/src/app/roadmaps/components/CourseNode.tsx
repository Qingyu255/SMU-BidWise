"use client"
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { courseInfo, NodeData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import Link from "next/link";
import Rating from "@/components/Rating";
import { ScrollArea } from "@/components/ui/scroll-area"
import CourseSummaryCard from '@/app/courses/components/CourseSummaryCard';

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
            console.log(courseData)
          }
      };
      fetchCourseData();
    }, [data.course_code, supabase]);
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const nodeStyle: React.CSSProperties = {
    borderRadius: '8px', 
    fontWeight: '600',
    padding: '10px 10px',
    width: '250px',
    height: '70px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #906f46',
    color: '#E1D9D1',
    
  }
    

     
    return (
      

          <Sheet>
            <SheetTrigger asChild>
              <div 
                style={{
                  ...nodeStyle,
                  backgroundColor: isHovered ? '#D9A633' : '#c69214'
                }}              
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>{courseData[0] ? courseData[0].title : '' }</div>
                

                
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
                <CourseSummaryCard
                    course_id = {courseData[0]?.id}
                    course_code={courseData[0]?.course_code}
                    title={courseData[0]?.title}
                    career={courseData[0]?.career}
                    description={courseData[0]?.description}
                    enrolment_requirements={courseData[0]?.enrolment_requirements}
                    units={courseData[0]?.units}
                />
              </ScrollArea>
              <SheetFooter>
                <SheetClose asChild>
                  <button>Close</button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

      
    );
  };
  
  export default CourseNode;