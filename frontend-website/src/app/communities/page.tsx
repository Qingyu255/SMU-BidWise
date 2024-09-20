// import React from 'react'

// export default function page() {
//     return (
//         <div>
//             Hello communities (threads? / discussions)
//         </div>
//     )
// }

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import Link from "next/link";
// import { format } from "date-fns"
//how to import new components? 


export default function communitypage() {
    return (
        <div className="flex p-4">
            <Card className="w-1/2 sm:w-full md:w-full lg:w-1/3 bg-background text-foreground">
                <CardHeader>
                    <Link href="#">
                        <CardTitle className="text-xl lg:text-2xl flex flex-row cursor-pointer hover:text-slate-500">
                            <span className="flex items-center">Thread title OR Course Name</span>
                            <Separator className="mx-2 my-[5px] h-100 w-[2px]" orientation="vertical" />
                            <span className="flex items-center">Related Course Code</span>
                        </CardTitle>
                    </Link>
                    <CardDescription className="">
                        Posted by: Original Poster Username
                    </CardDescription>
                    <CardDescription>
                        Date and Time Posted
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <p className="text-sm">
                            Content
                        </p>
                        <p className="text-xs">
                            Upvotes and replies
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

/*(to self)Next steps:
- figure out date/time module
- compile mock threads data?
- create thread?
- live commentting?
- start new thread?
- filter?
*/