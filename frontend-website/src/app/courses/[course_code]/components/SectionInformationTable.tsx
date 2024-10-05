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
import { CalendarPlus, CalendarMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimetable } from '@/components/timetableProvider';
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";

export interface AvailabilityProps {
    total_seats: number;
    current_enrolled: number;
    reserved_seats: number;
    available_seats: number;
  }
  
export interface SectionProps {
  id: string;
  section: string;
  day: string;
  start_time: string;
  end_time: string;
  instructor: string;
  venue: string;
  availability: AvailabilityProps | null; // availability can be null
}

export interface SectionInformationTableProps {
  sections: SectionProps[];
  latestTerm: string;
  singleProfOnly: boolean;
  courseCode: string;
}

const sortBySection = (sections: SectionProps[]): SectionProps[] => {
  return sections.sort((a, b) => {
    const numA = parseInt(a.section.replace(/^\D+/g, ''), 10);
    const numB = parseInt(b.section.replace(/^\D+/g, ''), 10);
    
    return numA - numB; // Sort by numeric value
  });
}

export const SectionInformationTable = ({ courseCode, sections, latestTerm, singleProfOnly }: SectionInformationTableProps) => {
  let temp: string = "";
  const sortedSections = sortBySection(sections);
  const { selectedClasses, addClass, removeClass } = useTimetable();
  const { toast } = useToast();

  const handleClassSelect = (section: any) => {
    console.log("Class selected:", section);
    const isSelected = selectedClasses.has(section.id);
    if (isSelected) {
      removeClass(section);
    } else {
      section["courseCode"] = courseCode;
      addClass(section);
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Section Information ({latestTerm})</CardTitle>
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
              <TableHead>Venue</TableHead>
              <TableHead>Total Seats</TableHead>
              <TableHead>Reserved Seats</TableHead>
              <TableHead>Available Seats</TableHead>
              <TableHead>Current Enrolled</TableHead>
              <TableHead>Add to Timetable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <TableRow key={section.id}>
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
                  <Popover key={section.id}>
                    <PopoverTrigger>
                      <Button>
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
                                handleClassSelect(section);
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
                                handleClassSelect(section);
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
