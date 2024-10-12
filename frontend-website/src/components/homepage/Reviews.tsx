"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const Reviews = () => {
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
            <div>
                <p style={sectionSubTextStyle}>
                    Reviews
                </p>
                
                <h2 style={sectionHeadTextStyle}>
                    What Our Users Say
                </h2>
            </div>
            
        </div>
        
    );
}

export default Reviews;