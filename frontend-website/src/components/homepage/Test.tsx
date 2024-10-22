"use client";

import createClient  from '@/utils/supabase/client';
import React, { useEffect } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import "./Reviews.css";
import { Box } from "lucide-react";

// Initialize Supabase client outside the component


export default function ReadReviews() {
  async function fetchData() {
    const supabase = createClient();
    let { data: reviews, error } = await supabase.from("reviews").select("*");

    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      console.log(reviews); // You should see your data here
    }
  }

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}
