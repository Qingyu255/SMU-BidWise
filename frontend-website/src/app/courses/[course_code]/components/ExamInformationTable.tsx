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
import NoExamsCard from './NoExamsCard';
import { sortBySection } from './utils';

type ExamInformationTableProps = {
  exams: ExamItem[],
  termName: string,
  courseCode: string,
}

export const ExamInformationTable = ({ courseCode, exams, termName }: ExamInformationTableProps) => {

  const sortedExams = sortBySection(exams);

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Exam Information ({termName})</CardTitle>
      </CardHeader>    
      <CardContent>
        {exams.length > 0 ? (
          <>
            <CardDescription className='mb-1'>
              {`${courseCode} Exam Schedule (all sections)`}
            </CardDescription>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Venue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className='font-bold'>{exam.section}</TableCell>
                    <TableCell>{exam.day}</TableCell>
                    <TableCell>{exam.start_date}</TableCell>
                    <TableCell>{exam.end_date}</TableCell>
                    <TableCell>{exam.start_time}</TableCell>
                    <TableCell>{exam.end_time}</TableCell>
                    <TableCell>{exam.venue? exam.venue : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <NoExamsCard/>
        )}
      </CardContent>
    </Card>
  );
};
