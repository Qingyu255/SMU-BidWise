import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
}

export const SectionInformationTable = ({ sections }: SectionInformationTableProps) => {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Section Information</CardTitle>
      </CardHeader>
      <CardContent>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
