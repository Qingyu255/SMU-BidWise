import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton";


export default function CourseSummaryCardSkeleton() {
    return (
        <>
            {Array.from({length: 10}).map((_, index) => (
                <div key={index} className="flex justify-center py-4">
                    <Card className="w-full bg-inherit">
                        <CardHeader>
                            <CardTitle className="text-xl lg:text-2xl flex flex-row">
                                <Skeleton className="h-6 w-1/2" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-20 mt-2" />
                            </CardDescription>
                            <CardDescription>
                                <Skeleton className="h-4 w-20 mt-2" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Separator className="mb-2" />
                            <div className="mb-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4 mt-2" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4 mt-2" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </>
    )
}
