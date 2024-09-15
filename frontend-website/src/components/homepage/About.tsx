"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from 'framer-motion';
import { container } from '../../../public/motion';

const About = () => {
    const { theme } = useTheme(); // Get the current theme

    // Hook to handle window resizing
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Styles based on window width and current theme
    const sectionHeadTextStyle: React.CSSProperties = {
        color: theme === 'dark' ? 'white' : 'black', // Toggle text color based on theme
        fontWeight: 'bold', // Equivalent to font-black in Tailwind CSS
        fontSize: windowWidth >= 640 ? '60px' : windowWidth >= 480 ? '50px' : '30px',
    };

    const sectionSubTextStyle: React.CSSProperties = {
        fontSize: windowWidth >= 640 ? '18px' : '14px',
        color: theme === 'dark' ? '#6b7280' : '#333333', // Adjust secondary color based on theme
        textTransform: 'uppercase', // Use valid values for textTransform
        letterSpacing: '0.1em', // Equivalent to tracking-wider in Tailwind CSS
    };

    return (
        <>
            <motion.div>
                
                <motion.p 
                    variants={container(1)}
                    initial="hidden"
                    animate="visible"
                    style={sectionSubTextStyle}
                >
                    Introduction
                </motion.p>
                
                <motion.h2 
                    variants={container(1.5)}
                    initial="hidden"
                    animate="visible"                    
                    style={sectionHeadTextStyle}
                >
                    Overview
                </motion.h2>
            
            </motion.div>
            
            <motion.p
                    variants={container(2)}
                    initial="hidden"
                    animate="visible"         
            >
                Welcome to SMOODS, the innovative platform crafted to revolutionize the module bidding experience for Singapore Management University (SMU) students. Designed with cutting-edge technology and user-centric features, SMOODS simplifies and enhances the academic planning process. Our platform offers real-time bid analytics, an intuitive timetable interface, and personalized academic tracking to empower students in making informed decisions. Seamlessly integrate your academic journey with advanced data visualizations, community discussions, and up-to-date information on course availability and bidding trends. SMOODS consolidates essential tools, including visually engaging timetables, senior roadmaps, bid price analytics, and a graduation tracker, into one cohesive experience. Elevate your academic planning and stay on track with SMOODS, where technology meets academic success.
            </motion.p>
        </>
    );
}

export default About;


