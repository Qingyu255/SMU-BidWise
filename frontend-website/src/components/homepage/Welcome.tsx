"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion'; // Import motion from framer-motion
import { container } from "../../../public/motion"; // Ensure you update this path

const WelcomeMessage = () => {
  const { theme } = useTheme(); // Get the current theme
  const [textColor, setTextColor] = useState('white'); // State to manage text color

  // Use useEffect to change text color based on the theme
  useEffect(() => {
    if (theme === 'light') {
      setTextColor('black');
    } else {
      setTextColor('white');
    }
  }, [theme]); // Runs whenever theme changes

  return (
    <motion.div
      variants={container(0)} // Apply motion.js animation to the WelcomeMessage
      initial="hidden"
      animate="visible"
      style={{ 
        zIndex: 1,  // Ensure content is above the background
        color: textColor,  // Dynamic text color based on theme
        textAlign: 'center',
      }}
    >
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        lineHeight: '1.2',
      }}>Welcome to SMU BidWise</h1>
      <p style={{
        fontSize: '1.2rem',
        lineHeight: '1.4',
        margin: '0',
      }}>Optimizing the module bidding process for SMU students.</p>
    </motion.div>
  );
};

export default WelcomeMessage;
