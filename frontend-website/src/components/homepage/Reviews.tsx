"use client";

import createClient from '@/utils/supabase/client';
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import "./Reviews.css";
import Image from 'next/image';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

// Define the Review type based on your 'reviews' table structure
type Review = {
  id: number;
  name: string;
  text: string;
  rating: number; // Assuming you have a rating field in your Supabase reviews
};

const Reviews = () => {
  const { theme } = useTheme(); // Get the current theme
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [windowWidth, setWindowWidth] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch reviews from Supabase
  const fetchReviews = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('reviews').select('*');

    if (error) {
      console.error('Error fetching reviews:', error);
    } else if (data) {
      console.log('Fetched reviews:', data);
      setReviews(data as Review[]);
    } else {
      console.log('No data returned.');
    }
    setLoading(false); // Set loading to false after fetching
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    
    // Ensure you're not inserting an 'id' field
    const { error } = await supabase.from('reviews').insert([{ name, text, rating }]);

    if (error) {
      console.error('Error inserting review:', error);
    } else {
      setName("");
      setText("");
      setRating(0);
      fetchReviews(); // Refresh the reviews after submitting
    }
  };

  // Styles based on window width and current theme
  const sectionHeadTextStyle: React.CSSProperties = {
    color: theme === "dark" ? "white" : "black",
    fontWeight: "bold",
    fontSize:
      windowWidth >= 640 ? "60px" : windowWidth >= 480 ? "50px" : "30px",
  };

  const sectionSubTextStyle: React.CSSProperties = {
    fontSize: windowWidth >= 640 ? "18px" : "14px",
    color: theme === "dark" ? "#6b7280" : "#333333",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };

  return (
    <div className="testimonial-container">
      <div className="title">
        <p style={sectionSubTextStyle}>Reviews</p>
        <h2 style={sectionHeadTextStyle}>What Our Users Say</h2>
      </div>

      <div className="slider-container">
        {loading ? (
          <p>Loading reviews...</p>
        ) : (
          <Splide options={{ perPage: 1 }}>
            {reviews.length > 0 ? (
              [...reviews].reverse().map((review) => (  // Reverses the reviews array
                <SplideSlide key={review.id}>
                  <img src="/images/user.png" className="review-img" alt="User icon" />
                  <div className="content">
                    <p className="text">{review.text}</p>
                    <div className="info">
                      <div className="rating">
                        {Array.from({ length: review.rating }, (_, index) => (
                          <span key={index} className="star">&#9733;</span>
                        ))}
                        {Array.from({ length: 5 - review.rating }, (_, index) => (
                          <span key={index} className="star">&#9734;</span>
                        ))}
                      </div>
                      <p className="user">{review.name}</p>
                    </div>
                  </div>
                </SplideSlide>
              ))
            ) : (
              <p>No reviews found.</p>
            )}
          </Splide>
        )}
      </div>

    <div className='text-right my-3'>
        <Button onClick={() => setShowReviewForm(!showReviewForm)}>
            {!showReviewForm ? (
                <Plus className="w-5 h-5" />
            ) : (
                <ChevronUp className="w-5 h-5" />
            )}
            {showReviewForm ? '' : ' Write a review!'}
        </Button>
    </div>
    {showReviewForm && (
        <form onSubmit={handleSubmit} className="review-form">
        <h3>Leave a Review</h3>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Your Review"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          required
        >
          <option value={0}>Rate Us</option>
          {[1, 2, 3, 4, 5].map((star) => (
            <option key={star} value={star}>{star} Star{star > 1 ? 's' : ''}</option>
          ))}
        </select>
        <button type="submit">Submit Review</button>
      </form>
    )}
    </div>
  );
};

export default Reviews;
