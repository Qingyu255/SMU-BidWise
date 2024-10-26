import { Squirrel } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

export default function NoExamsCard() {
    return (
        <Card className='flex flex-col p-5 my-3'>
            <div className='flex justify-left'>
                <Squirrel/>
                <CardTitle className='text-center my-auto px-2'>No Exam Information Found</CardTitle>
            </div>
            <p className="py-2 text-sm">yays</p>
        </Card>
    )
}
