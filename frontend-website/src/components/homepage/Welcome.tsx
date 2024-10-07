"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion'; // Import motion from framer-motion
import Link from 'next/link'; // Import Link from next/link
import { container } from "../../../public/motion"; // Ensure you update this path

const WelcomeMessage = () => {
  const { theme } = useTheme(); // Get the current theme
  const [textColor, setTextColor] = useState('white'); // State to manage text color
  const [screenSize, setScreenSize] = useState(window.innerWidth); // State to manage screen size

  // Use useEffect to change text color based on the theme
  useEffect(() => {
    if (theme === 'light') {
      setTextColor('black');
    } else {
      setTextColor('white');
    }
  }, [theme]); // Runs whenever theme changes

  // Use useEffect to detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth); // Update screen size state
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check the initial size

    return () => window.removeEventListener('resize', handleResize); // Cleanup listener
  }, []);

  // Determine device type based on screen size
  const isMobile = screenSize < 768; // Mobile
  const isTablet = screenSize >= 768 && screenSize < 1024; // Tablet

  return (
    <motion.div
      variants={container(0)} // Apply motion.js animation to the WelcomeMessage
      initial="hidden"
      animate="visible"
      style={{ 
        display: 'flex',  // Use flexbox to place items side by side
        alignItems: 'flex-start', // Align items to the top
        justifyContent: isMobile ? 'center' : 'space-between', // Center items on mobile
        padding: '2rem',
        color: textColor,
        flexDirection: isMobile ? 'column' : 'row', // Stack items vertically on mobile
      }}
    >
      {/* Text Section */}
      <div style={{ 
        flex: 1, 
        textAlign: isMobile ? 'center' : 'left', // Center text on mobile
        paddingBottom: isMobile ? '1rem' : '0' 
      }}>
        <h1 style={{
          fontSize: isMobile ? '3rem' : isTablet ? '5rem' : '6rem', // Adjust font size for mobile and tablet
          fontWeight: 'bold',
          lineHeight: '1.2',
          paddingTop: '1rem',
        }}>
          Welcome to <span style={{
            background: 'linear-gradient(135deg, #3C5AA6, #D4A76A)', // Brighter blue to gold gradient
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
          }}>
            SMU BidWise
          </span>
        </h1>
        <p style={{
          fontSize: isMobile ? '1.25rem' : isTablet ? '1.75rem' : '2rem', // Adjust font size for mobile and tablet
          lineHeight: '1.4',
        }}>
          Optimizing the module bidding process for SMU students.
        </p>
        {/* Button Section */}
        <Link href="/courses" passHref>
          <button style={{
            marginTop: '1rem', // Space above the button
            padding: '0.75rem 1.5rem', // Button padding
            fontSize: isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem', // Adjust font size for mobile and tablet
            backgroundColor: 'black', // Button color
            color: 'white', // Text color
            border: 'none',
            borderRadius: '1.75rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}>
            Start Searching Courses
          </button>
        </Link>
      </div>

      {/* Image Section */}
      <div style={{ 
        flex: '0 0 auto', 
        textAlign: isMobile ? 'center' : 'right', // Center text on mobile
        marginTop: isMobile ? '1rem' : '0' // Add margin on top for mobile
      }}> 
        <img 
          src="/images/lp2-removebg.png" 
          alt="Landing Page" 
          style={{ 
            width: '475px',  // Maintain a fixed width
            height: '450px', // Fixed height of 450px
            objectFit: 'cover', // Ensure the image covers the set dimensions
            margin: isMobile ? '0 auto' : '0', // Center image horizontally on mobile
            display: isMobile ? 'block' : 'inline-block', // Ensure the image behaves as a block for centering
          }} 
        />
      </div>
    </motion.div>
  );
};

export default WelcomeMessage;

