"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { container } from "../../../public/motion"; 

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
        alignItems: isMobile ? 'center' : 'center',
        justifyContent: isMobile ? 'center' : 'space-between',
        padding: '2rem',
        color: textColor,
        flexDirection: isMobile ? 'column' : 'row',
        maxWidth: '1280px', // Add a max-width to the container
        overflowX: 'hidden', // Prevent horizontal overflow
        margin: '0 auto' // Center container within the viewport
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
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link href="/courses" passHref>
            <button style={buttonStyles}>
              Get started
            </button>
          </Link>
          <Link href="#about-section">
            <button style={buttonStyles}>
              Learn more about us
            </button>
          </Link>
        </div>
      </div>



      {/* Image Section */}
      <div style={{ 
          textAlign: 'center',
          marginTop: isMobile ? '1rem' : '0',
          width: isMobile ? '100%' : 'auto',
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'flex-end',
          alignItems: 'center', // Center the image vertically
          height: '100%', // Maintain a specific height or define a fixed height
      }}> 
          <motion.img 
              src="/images/lp2-removebg.png" 
              alt="Landing Page" 
              animate={{
                  y: [0, -10, 0], // Moves image 10px up and down
              }}
              transition={{
                  duration: 2, // Duration of one up and down motion
                  repeat: Infinity, // Makes the animation loop indefinitely
                  ease: "easeInOut" // Smooth easing for the up and down motion
              }}
              style={{ 
                  width: isMobile ? '100%' : '40vw', // Adjust width based on viewport for larger screens
                  height: 'auto', // Height set to auto to maintain aspect ratio
                  maxWidth: '475px', // Set a max width to prevent the image from growing too large
                  maxHeight: '450px', // Set a max height to maintain the original aspect ratio
                  margin: 'auto', // Use auto to center the image within the flex container
                  display: 'block', // Ensures the image behaves like a block element
              }} 
          />
      </div>



    </motion.div>
  );
};

export default WelcomeMessage;
