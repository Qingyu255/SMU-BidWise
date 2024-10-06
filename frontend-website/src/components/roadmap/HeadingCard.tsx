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

const HeadingCard: React.FC<HeadingCardProps> = ({handleClick}) => {
  return (
    
    <Card >
        
        <CardHeader>
            <div className="flex flex-row">
                <Button variant="ghost" size="icon" onClick={handleClick}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="place-self-center">
                    Kylene
                </CardTitle>
            </div>
        </CardHeader>
            <div className="pl-9">
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <p>Card Footer</p>
                </CardFooter>
            </div>
            
    </Card>
    
  )
}

export default HeadingCard