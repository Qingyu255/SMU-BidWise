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
        <div style={{ padding: '2rem', textAlign: 'center' }}> {/* Implemented the styling here */}
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
                Welcome to SMU BidWise, the platform designed to transform the module bidding experience for SMU students. With real-time bid analytics, personalized insights, and an intuitive timetable interface, SMU BidWise simplifies academic planning. Access tools like senior roadmaps, bid price trends, and a graduation tracker to make informed decisions. Stay ahead with up-to-date course availability and data visualizations, all in one seamless experience.
            </motion.p>
        </div>
    );
}

export default About;
