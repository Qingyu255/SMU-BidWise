import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarPlus, CalendarMinus, ChartNoAxesCombined } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimetable } from '@/components/providers/timetableProvider';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { Info } from 'lucide-react';
import { ClassItem } from '@/types';
import Image from 'next/image';

export interface TimetableSummaryTableProps {
  sections: ClassItem[];
}

const sortByCourseCode = (sections: ClassItem[]): ClassItem[] => {
  return sections.sort((a, b) => {
    const courseCodeA = a.courseCode ? a.courseCode : '';
    const courseCodeB = b.courseCode ? b.courseCode : '';

    const numA = parseInt(courseCodeA.replace(/^\D+/g, ''), 10);
    const numB = parseInt(courseCodeB.replace(/^\D+/g, ''), 10);
    
    return numA - numB; // Sort by numeric value
  });
}

export const TimetableSummaryTable = ({ sections }: TimetableSummaryTableProps) => {
  let temp: string = "";
  const sortedSections = sortByCourseCode(sections);
  const { selectedClasses, addClass, removeClass, updatePlannedBid } = useTimetable();
  const { toast } = useToast();
  
  const handleRemoveClass = (classItem: any) => {
    console.log("Class selected:", classItem);
    const isSelected = selectedClasses.has(classItem.id);
    if (isSelected) {
      removeClass(classItem, true);
    } else {
      console.error("Attempting to remove class not selected in timetable provider");
    }
  }

  const handlePlannedBidUpdate = (e: React.ChangeEvent<HTMLInputElement>, sectionId: string) => {
    const plannedBid = parseFloat(e.target.value);
    if (!isNaN(plannedBid)) {
      updatePlannedBid(sectionId, plannedBid);
    }
  }

  return (
    <Card className="rounded-lg my-2">
      <CardHeader>
        <CardTitle className="text-xl xl:text-2xl font-semibold">Timetable Summary</CardTitle>
      </CardHeader>    
      <CardContent>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              {/* <TableHead>Instructor</TableHead> */}
              <TableHead>Professor</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Total Seats</TableHead>
              <TableHead>Reserved Seats</TableHead>
              <TableHead>Available Seats</TableHead>
              <TableHead>Current Enrolled</TableHead>
              <TableHead>Planned Bid <br/>
                <Info className='inline w-3 h-3 my-auto mr-1 text-muted-foreground'/><span className='text-xs'>(for your planning!)</span>
                </TableHead>
              <TableHead>View Bid Analytics</TableHead>
              <TableHead>Remove From Timetable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(sections.length == 0) && (
              <TableRow>
                <TableCell colSpan={14} className='text-center text-sm md:text-base'>
                  <div className='opacity-60 py-4'>
                    <Info className="inline w-5 h-5 text-gray-600" />
                    <span className='px-2'>No courses added to timetable</span>
                  </div>
                  <Link href="/courses">
                    <Button>
                      View Courses
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )}
            {sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell>
                  <Link href={"courses/" + section.courseCode} className='font-semibold lg:text-[16px] hover:underline hover:cursor-pointer'>
                    {section.courseCode}
                  </Link>
                  {section.courseTitle && " - " + section.courseTitle}
                </TableCell>
                <TableCell>{section.section}</TableCell>
                <TableCell>{section.day}</TableCell>
                <TableCell>{section.start_time}</TableCell>
                <TableCell>{section.end_time}</TableCell>
                <TableCell> 
                  {section.instructor}
                </TableCell>
                <TableCell>
                  <Link className='flex justify-center' href={`https://www.afterclass.io/professor/smu-${section?.instructor.replace(".", "").split(" ").join("-").toLowerCase()}`} target='_blank'>
                    <Image
                      src="/images/afterclassIcon.png"
                      alt="afterclassIcon"
                      width={18}
                      height={18}
                    />
                  </Link>
                </TableCell>
                <TableCell>{section.venue}</TableCell>
                <TableCell>
                  {section.availability ? section.availability.total_seats : 'N/A'}
                </TableCell>
                <TableCell>
                  {section.availability ? section.availability.reserved_seats : 'N/A'}
                </TableCell>
                <TableCell>
                  {section.availability ? section.availability.available_seats : 'N/A'}
                </TableCell>
                <TableCell>
                  {section.availability ? section.availability.current_enrolled : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className='flex flex-row items-center'>
                  <span className='text-gray-600 pe-2'>e$</span>
                    <Input 
                      type='number' 
                      placeholder='10.00' 
                      className='min-w-[70px]' 
                      value={section.plannedBid || ''}
                      onInput={(e: any) => {handlePlannedBidUpdate(e, section.id)}}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={"/bid-analytics?courseCode=" + section.courseCode}>
                          <Button className='text-xs font-semibold w-fit'>
                            <ChartNoAxesCombined/>
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Analyse price trends for {section.courseCode}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                <Popover key={section.id}>
                    <PopoverTrigger>
                      <Button>
                        <CalendarMinus/>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="text-center">
                        <h3 className="font-semibold py-2">
                          Remove {section.courseCode} - {section.section} from Timetable?
                        </h3>
                        <PopoverClose asChild>
                          <Button
                            onClick={async () => {
                              await new Promise((resolve) => setTimeout(resolve, 200));
                              handleRemoveClass(section);
                              toast({
                                title: `Removed ${section.courseCode} - ${section.section} from Timetable`,
                              })
                            }}
                          >
                            Remove
                          </Button>
                        </PopoverClose>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(sections.length > 0) && (
          <CardDescription className='pt-1 mb-1 text-xs'>
              Protip: Click
              <Image
                className='inline'
                src="/images/afterclassIcon.png"
                alt="afterclassIcon"
                width={16}
                height={16}
              />
            to view reviews on afterclass
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};
