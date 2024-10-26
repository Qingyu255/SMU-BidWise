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
import { ExamItem } from '@/types';

type ExamInformationTableProps = {
  exams: ExamItem[],
  termName: string,
  courseCode: string,
}

export const ExamInformationTable = ({ courseCode, exams, termName }: ExamInformationTableProps) => {

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Section Information ({termName})</CardTitle>
      </CardHeader>    
      <CardContent>
        <CardDescription className='mb-1'>
          {`Exam Schedule for : ${courseCode} - ${exams[0]?.section}`}
        </CardDescription>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Venue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className='font-bold'>{exam.section}</TableCell>
                <TableCell>{exam.day}</TableCell>
                <TableCell>{exam.start_time}</TableCell>
                <TableCell>{exam.end_time}</TableCell>
                <TableCell>{exam.venue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
