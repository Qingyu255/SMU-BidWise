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
import { CalendarPlus, CalendarMinus, ChartNoAxesCombined } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimetable } from '@/components/providers/timetableProvider';
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PopoverClose } from "@radix-ui/react-popover";
import { ClassItem } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { sortBySection } from './utils';
import { groupSections } from './utils';

export type SectionInformationTableProps = {
  sections: ClassItem[],
  termName: string,
  onClassSelect: (e: any) => void,
  singleProfOnly: boolean,
  courseCode: string,
  allowAddRemoveSections? : boolean
}

export const SectionInformationTable = ({ courseCode, sections, termName, onClassSelect, singleProfOnly, allowAddRemoveSections = true }: SectionInformationTableProps) => {
  let temp: string = "";
  const groupedSections = groupSections(sections);
  const sortedGroupedSections = sortBySection(groupedSections);
  const { selectedClasses, addClass, removeClass } = useTimetable();
  const { toast } = useToast();

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Section Information ({termName})</CardTitle>
      </CardHeader>    
      <CardContent>
        {singleProfOnly ? (
          <CardDescription className='mb-1'>
            Showing sections for {sections[0].instructor}
          </CardDescription>
        ) : (
        <CardDescription className='mb-1'>
          Showing all sections
        </CardDescription>
        )}
        <Table className="w-full">
          <TableHeader>
            <TableRow>
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
              <TableHead>View Bid Analytics</TableHead>
              {(allowAddRemoveSections) && (
                <TableHead>Add to Timetable</TableHead>
              )}
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGroupedSections.map((section) => (
              <TableRow key={section.id}>
                <TableCell className='font-bold'>{section.section}</TableCell>
                <TableCell>
                  {section.days ? section.days.join(', ') : section.day}
                </TableCell>
                <TableCell>
                  {section.start_times ? section.start_times.join(', ') : section.start_time}
                </TableCell>
                <TableCell>
                  {section.end_times ? section.end_times.join(', ') : section.end_time}
                </TableCell>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={"/bid-analytics?courseCode=" + courseCode + "&instructor=" + encodeURIComponent(section.instructor)}>
                          <Button variant="secondary" className='text-xs font-semibold w-fit'>
                            <ChartNoAxesCombined/>
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Analyse price trends for {courseCode} - {section.instructor}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                {allowAddRemoveSections && (
                  <TableCell>
                    <Popover key={section.id}>
                      <PopoverTrigger>
                        <Button variant={selectedClasses.has(section.id) ? "outline" : "default"}>
                          {selectedClasses.has(section.id) ? (
                            <CalendarMinus/>
                          ) : (
                            <CalendarPlus/>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        {selectedClasses.has(section.id) ? (
                          <div className="text-center">
                            <h3 className="font-semibold py-2">
                              Remove {courseCode} - {section.section} from Timetable?
                            </h3>
                            <PopoverClose asChild>
                              <Button
                                onClick={async () => {
                                  await new Promise((resolve) => setTimeout(resolve, 200));
                                  onClassSelect(section);
                                  toast({
                                    title: `Removed ${courseCode} - ${section.section} from Timetable`,
                                  })
                                }}
                              >
                                Remove
                              </Button>
                            </PopoverClose>
                          </div>
                        ) : (
                          <div className="text-center">
                            <h3 className="font-semibold py-2">
                              Add {section.section} to Timetable?
                            </h3>
                            <PopoverClose asChild>
                              <Button
                                onClick={async () => {
                                  await new Promise((resolve) => setTimeout(resolve, 200));
                                  onClassSelect(section);
                                  toast({
                                    title: `Added ${courseCode} - ${section.section} to Timetable`,
                                  })
                                }}
                              >
                                Add
                              </Button>
                            </PopoverClose>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CardDescription className='pt-1 mb-1 text-xs'>
          Tip: Click
          <Image
            className='inline'
            src="/images/afterclassIcon.png"
            alt="afterclassIcon"
            width={16}
            height={16}
          />
          to view reviews on afterclass
        </CardDescription>
      </CardContent>
    </Card>
  );
};
