"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import Link from 'next/link';
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

  // Button styles based on theme
  const buttonStyles = {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    fontSize: isMobile ? '1rem' : isTablet ? '1.05rem' : '1.25rem',
    backgroundColor: theme === 'dark' ? 'white' : 'black', // Set background color
    color: theme === 'dark' ? 'black' : 'white', // Set text color
    border: 'none',
    borderRadius: '1.75rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, color 0.3s ease', // Add transition for color changes
  };

  return (
    <motion.div
      variants={container(0)} // Apply motion.js animation to the WelcomeMessage
      initial="hidden"
      animate="visible"
      style={{ 
        display: 'flex',
        alignItems: isMobile ? 'center' : 'flex-start',
        justifyContent: isMobile ? 'center' : 'space-between',
        padding: '4.5rem',
        color: textColor,
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {/* Text Section */}
      <div style={{ 
        flex: 1, 
        textAlign: isMobile ? 'center' : 'left',
        paddingBottom: isMobile ? '1rem' : '0' 
      }}>
        <h1 style={{
          fontSize: isMobile ? '3rem' : isTablet ? '5rem' : '6rem',
          fontWeight: 'bold',
          lineHeight: '1.2',
          paddingTop: '1rem',
        }}>
          Welcome to <span style={{
            background: 'linear-gradient(135deg, #3C5AA6, #D4A76A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
          }}>
            SMU BidWise
          </span>
        </h1>
        <p style={{
          fontSize: isMobile ? '1.25rem' : isTablet ? '1.75rem' : '2rem',
          lineHeight: '1.4',
        }}>
          Optimizing the module bidding process for SMU students.
        </p>
        {/* Button Section */}
        <Link href="/courses" passHref>
          <button style={buttonStyles}>
            Get Started
          </button>
        </Link>
      </div>

      {/* Image Section */}
      <div style={{ 
        flex: '0 0 auto', 
        textAlign: 'center',
        marginTop: isMobile ? '1rem' : '0',
        width: isMobile ? '100%' : 'auto',
        display: 'flex',
        justifyContent: isMobile ? 'center' : 'flex-end',
      }}> 
        <img 
          src="/images/lp2-removebg.png" 
          alt="Landing Page" 
          style={{ 
            width: '475px',
            height: '450px',
            objectFit: 'cover',
            margin: '0 auto',
            display: 'block', 
          }} 
        />
      </div>
    </motion.div>
  );
};

export default WelcomeMessage;
