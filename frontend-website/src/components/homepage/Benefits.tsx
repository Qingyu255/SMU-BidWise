"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const Benefits = () => {
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

    // Define the border color based on the current theme
    const borderColor = theme === 'dark' ? 'white' : 'black';

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}> {/* Implemented the styling here */}
            <div>
                <p style={sectionSubTextStyle}>
                    Why Choose SMU BidWise?
                </p>
                
                <h2 style={sectionHeadTextStyle}>
                    Introduction to Our Features
                </h2>
            </div>

            <div 
                style={{ 
                    display: 'flex', 
                    flexDirection: windowWidth < 768 ? 'column' : 'row', // Stack on top for smaller screens
                    border: `2px solid ${borderColor}`, 
                    borderRadius: '1rem', 
                    padding: '1rem', 
                    justifyContent: 'space-between', 
                    marginTop: '1rem' 
                }}
            >
                <p style={{
                    fontSize: windowWidth >= 640 ? '40px' : '30px', // Adjust font size as needed
                    fontWeight: '600', // Slightly lighter than bold
                    fontFamily: 'Poppins, sans-serif', // Apply the Poppins font directly here
                    margin: 0, // Ensure no margin for proper alignment
                    textAlign: 'start'
                }}>
                    Timetable & Course Discovery
                </p>
                
                <div 
                    style={{ 
                        marginLeft: windowWidth >= 768 ? '1rem' : '0', // Remove left margin for smaller screens
                        backgroundColor: 'lightgrey', 
                        padding: '1rem', 
                        borderRadius: '1rem', 
                        marginTop: windowWidth < 768 ? '1rem' : '0' // Add margin-top for small screens
                    }}
                >
                    <video 
                        loop 
                        muted 
                        autoPlay 
                        style={{ width: '800px', height: 'auto' }} // Adjust dimensions as needed
                    >
                        <source src="/images/timetable.mp4" type="video/mp4" /> {/* Change the video source */}
                    </video>
                </div>
            </div>

            {/* Other content sections */}
            <div style={{ display: 'flex', border: `2px solid ${borderColor}`, borderRadius: '1rem', padding: '1rem', justifyContent: 'space-between', marginTop: '1rem' }}>
                <p style={{
                    fontSize: windowWidth >= 640 ? '40px' : '30px', // Adjust font size as needed
                    fontWeight: '600', // Slightly lighter than bold
                    fontFamily: 'Poppins, sans-serif', // Apply the Poppins font directly here
                    margin: 0, // Ensure no margin for proper alignment
                }}>
                    Timetable Interface
                </p>
            </div>

            <div style={{ display: 'flex', border: `2px solid ${borderColor}`, borderRadius: '1rem', padding: '1rem', justifyContent: 'space-between', marginTop: '1rem' }}>
                <p style={{
                    fontSize: windowWidth >= 640 ? '40px' : '30px', // Adjust font size as needed
                    fontWeight: '600', // Slightly lighter than bold
                    fontFamily: 'Poppins, sans-serif', // Apply the Poppins font directly here
                    margin: 0, // Ensure no margin for proper alignment
                }}>
                    Timetable Interface
                </p>
            </div>
        </div>
    );
}

export default Benefits;
