import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseInfoSkeleton() {
  return (
    <Card className="rounded-lg w-100">
      <CardHeader>
        <div className='flex flex-row justify-between'>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-8 w-1/4" />
        </div>
        <Skeleton className="h-6 w-1/4 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-row gap-5 md:gap-10">
            <div className="flex flex-col gap-y-4">
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32 mt-2" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
        </div>
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="text-sm ">
        <Skeleton className="h-3 w-1/2" />
      </CardFooter>
    </Card>
  );
}
