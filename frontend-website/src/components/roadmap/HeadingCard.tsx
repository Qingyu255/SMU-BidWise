import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react';
import { HeadingCardProps } from "@/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"


const HeadingCard: React.FC<HeadingCardProps> = ({ headingCardInfo}) => {
  return (
    
    <Card >
        
        <CardHeader>
            <div className="flex flex-row">
                <Link href={"../../roadmaps"}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                
                <CardTitle className="place-self-center text-xl">
                    { headingCardInfo.name } •	<span className='font-light'>{headingCardInfo.degree}</span> {headingCardInfo.verified_seniors === 'VERIFIED' ? <Badge className='rounded-full' variant="secondary">verified</Badge> : ''}
                </CardTitle>
            </div>
        </CardHeader>
            <div className="pl-9">
                <CardContent>
                <CardDescription>
                Year of Graduation: {headingCardInfo.graduation_year}
                <br></br>
                Current Job: {headingCardInfo.current_job}
                </CardDescription>
                { headingCardInfo.advice.length > 250 ? `${headingCardInfo.advice.substring(0,250)}...` : headingCardInfo.advice } 
                </CardContent>
                
            </div>
            
    </Card>
    
  )
}

export default HeadingCard