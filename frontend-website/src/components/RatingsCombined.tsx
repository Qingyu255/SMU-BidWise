import React from 'react';
import Rating from './Rating';

export default function RatingsCombined({courseId, isRatingAllowed}: {courseId: string, isRatingAllowed?:boolean}) {
  return (
    <div className='py-2'>
        <Rating
            courseId={courseId}
            ratingName='Practicality'
            fillColour='#4c68ee' 
            ratingDescription="The 'Practicality' rating indicates how much practical/useful content a course contains." 
            isRatingAllowed={isRatingAllowed ? true : false}
        />
        <Rating
            courseId={courseId}
            ratingName='Workload'
            fillColour='#f4a261'
            ratingDescription="The 'Workload' rating provides an estimate of the effort and time commitment required for the course."
            isRatingAllowed={isRatingAllowed ? true : false}
        />
        <Rating
            courseId={courseId}
            ratingName='Interesting'
            fillColour='#e63946'
            ratingDescription="The 'Interesting' rating reflects how engaging and captivating students find the course content and delivery."
            isRatingAllowed={isRatingAllowed ? true : false}
        />
    </div>
  )
}
