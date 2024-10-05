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
import { useTimetable } from '@/components/timetableProvider';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';

export interface AvailabilityProps {
    total_seats: number;
    current_enrolled: number;
    reserved_seats: number;
    available_seats: number;
  }
  
export interface SectionProps {
  courseCode?: string,
  id: string;
  section: string;
  day: string;
  start_time: string;
  end_time: string;
  instructor: string;
  venue: string;
  availability: AvailabilityProps | null; // availability can be null
}

export interface TimetableSummaryTableProps {
  sections: SectionProps[];
}

const sortBySection = (sections: SectionProps[]): SectionProps[] => {
  return sections.sort((a, b) => {
    const numA = parseInt(a.section.replace(/^\D+/g, ''), 10);
    const numB = parseInt(b.section.replace(/^\D+/g, ''), 10);
    
    return numA - numB; // Sort by numeric value
  });
}

export const TimetableSummaryTable = ({ sections }: TimetableSummaryTableProps) => {
  let temp: string = "";
  const sortedSections = sortBySection(sections);
  const { selectedClasses, addClass, removeClass } = useTimetable();
  const { toast } = useToast();
  const router = useRouter();
  
  const handleRemoveClass = (classItem: any) => {
    console.log("Class selected:", classItem);
    const isSelected = selectedClasses.has(classItem.id);
    if (isSelected) {
      removeClass(classItem);
    } else {
      console.error("Attempting to remove class not selected in timetable provider");
    }
  }

  return (
    <Card className="rounded-lg my-2">
      <CardHeader>
        <CardTitle className="text-xl xl:text-2xl font-semibold">Timetable Summary</CardTitle>
      </CardHeader>    
      <CardContent>
        {/* {singleProfOnly ? (
          <CardDescription className='mb-1'>
            Showing sections for {sections[0].instructor}
          </CardDescription>
        ) : (
        <CardDescription className='mb-1'>
          Showing all sections
        </CardDescription>
        )} */}
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
              <TableHead>Venue</TableHead>
              <TableHead>Total Seats</TableHead>
              <TableHead>Reserved Seats</TableHead>
              <TableHead>Available Seats</TableHead>
              <TableHead>Current Enrolled</TableHead>
              <TableHead>Planned Bid</TableHead>
              <TableHead>View Bid Analytics</TableHead>
              <TableHead>Remove From Timetable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell className='font-semibold'>{section.courseCode}</TableCell>
                <TableCell>{section.section}</TableCell>
                <TableCell>{section.day}</TableCell>
                <TableCell>{section.start_time}</TableCell>
                <TableCell>{section.end_time}</TableCell>
                <TableCell>{section.instructor}</TableCell>
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
                    <Input type='number' placeholder='10.00'/>
                    <span className='text-gray-600 px-1 ps-2'>e$</span>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className='text-xs font-semibold w-fit' onClick={() => {router.push("/bid-analytics?courseCode=" + section.courseCode)}}>
                          <ChartNoAxesCombined/>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Analyse price trends for {section.courseCode}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => {
                        handleRemoveClass(section);
                        toast({
                          title: `Removed ${"courseCode"} - ${section.section} to Timetable`,
                        })
                      }}>
                        <CalendarMinus/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {`Remove ${section.section} from Timetable`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
