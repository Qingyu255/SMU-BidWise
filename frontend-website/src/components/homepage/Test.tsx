"use client";

import createClient from '@/utils/supabase/client';
import React, { useEffect, useState } from "react";
import "@splidejs/splide/dist/css/splide.min.css";
import "./Reviews.css";

// Define the Review type based on your 'reviews' table structure
type Review = {
  id: number;
  image: string;
  name: string;
  text: string;
};

export default function ReadReviews() {
  // Initialize Supabase client outside the component
  const supabase = createClient();

  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      console.log("Supabase client:", supabase); // Check the client initialization

      const { data, error } = await supabase
        .from('reviews')
        .select('*');

      if (error) {
        console.error('Error fetching reviews:', error); // Use console.error for error logging
      } else if (data) {
        // Log the fetched data to the console
        console.log('Fetched reviews:', data);

        // Type assertion to convert the data to Review[]
        setReviews(data as Review[]);
      } else {
        console.log('No data returned.');
      }
    };

    fetchReviews();
  }, [supabase]);

  return (
    <div>
      <h1>Reviews</h1>
      {/* Render reviews */}
      {reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <h2>{review.name}</h2>
              <img src={review.image} alt={review.name} />
              <p>{review.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews found.</p>
      )}
    </div>
  );
}
