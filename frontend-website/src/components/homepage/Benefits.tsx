import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const Benefits = () => {
    const { theme } = useTheme();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [fadeIn, setFadeIn] = useState(true); // State for fade-in effect

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionHeadTextStyle = {
        color: theme === 'dark' ? 'white' : 'black',
        fontWeight: 'bold',
        fontSize: windowWidth >= 768 ? '60px' : windowWidth >= 480 ? '50px' : '30px',
    };

    const sectionSubTextStyle = {
        fontSize: windowWidth >= 768 ? '18px' : '14px',
        color: theme === 'dark' ? '#6b7280' : '#333333',
        textTransform: 'uppercase' as 'uppercase',
        letterSpacing: '0.1em',
    };

    const borderColor = theme === 'dark' ? 'white' : 'black';

    const navLinkStyle: React.CSSProperties = {
        fontSize: '15px',
        textTransform: 'uppercase',
        color: '#828282',
        textDecoration: 'none',
        position: 'relative',
        zIndex: '1',
        margin: '0 10px',
        paddingBottom: '1px',
        transition: 'color 0.3s ease, transform 0.3s ease', // Added transition for hover effect
    };

    // Style for active link with rounded underline
    const activeNavLinkStyle: React.CSSProperties = {
        ...navLinkStyle,
        borderBottom: `3px solid ${borderColor}`,
        borderRadius: '8px',
    };

    const hoverEffectStyle: React.CSSProperties = {
        ...navLinkStyle,
        color: theme === 'dark' ? '#f3f4f6' : '#000',
        transform: 'scale(1.05)', // Slight scale effect on hover
    };

    const handleNavClick = (index: number) => {
        setFadeIn(false); // Trigger fade-out
        setTimeout(() => {
            setActiveIndex(index);
            setFadeIn(true); // Trigger fade-in
        }, 300); // Match this to your transition duration
    };

    const handleNext = () => {
        handleNavClick((activeIndex + 1) % 5);
    };

    const handlePrevious = () => {
        handleNavClick((activeIndex + 4) % 5);
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div>
                <p style={sectionSubTextStyle}>Why Choose SMU BidWise?</p>
                <h2 style={sectionHeadTextStyle}>Introduction to Our Features</h2>
            </div>

            <div style={{ marginTop: '10px' }}>
                {/* Navigation for carousel */}
                {windowWidth >= 768 ? (
                    <nav
                        className="hidden md:flex w-full h-[60px] min-[1190px]:h-[60px] justify-between"
                        style={{
                            borderRadius: '8px',
                            alignItems: 'center',
                            boxShadow: '0px 2px 3px 1px rgba(0,0,0,.5)',
                            padding: '20px',
                        }}
                    >
                        {['Timetable', 'Courses', 'Bid Price Analytics', 'Senior Roadmaps', 'Community Threads'].map((label, index) => (
                            <button
                                key={index}
                                style={{
                                    ...activeIndex === index ? activeNavLinkStyle : { ...navLinkStyle, ...(hoverIndex === index ? hoverEffectStyle : {}) },
                                }}
                                onMouseEnter={() => setHoverIndex(index)} // Set hover index
                                onMouseLeave={() => setHoverIndex(null)} // Reset hover index
                                onClick={() => handleNavClick(index)}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '0 20px', marginTop: '10px' }}>
                        <button onClick={handlePrevious}>Previous</button>
                        <button onClick={handleNext}>Next</button>
                    </div>
                )}

                {/* Custom carousel implementation */}
                <div id="carousel-content" style={{ marginTop: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column', // Set to column for vertical layout
                        border: `2px solid ${borderColor}`,
                        borderRadius: '1rem',
                        padding: '1rem',
                        alignItems: 'center', // Center items horizontally
                        backgroundColor: theme === 'dark' ? '#333' : '#f9f9f9'
                    }}>
                        <div style={{
                            textAlign: 'center', // Center text
                            opacity: fadeIn ? 1 : 0,
                            transition: 'opacity 0.3s ease-in-out'
                        }}>
                            {activeIndex === 0 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Timetable
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Effortlessly browse and plan your courses. Our timetable feature allows you to visualize course availability, helping you build a schedule that fits your needs and preferences.
                                    </p>
                                    <video src="/images/slide1Vid.mp4"></video>
                                    <p style={{ fontSize: windowWidth >= 768 ? '40px' : '30px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                    <span style={{
                                        backgroundColor: '#4158D0',
                                        backgroundImage: 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
                                        WebkitBackgroundClip: 'text', // For Safari
                                        backgroundClip: 'text',
                                        color: 'transparent', // Makes the text transparent so only the gradient is visible
                                        fontWeight: 'bold', // Optional: make text bold
                                    }}>Concise. </span>
                                    <span style={{
                                        backgroundColor: '#4158D0',
                                        backgroundImage: 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
                                        WebkitBackgroundClip: 'text', // For Safari
                                        backgroundClip: 'text',
                                        color: 'transparent', // Makes the text transparent so only the gradient is visible
                                        fontWeight: 'bold', // Optional: make text bold
                                    }}>Flexible. </span>
                                    <span style={{
                                        backgroundColor: '#4158D0',
                                        backgroundImage: 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
                                        WebkitBackgroundClip: 'text', // For Safari
                                        backgroundClip: 'text',
                                        color: 'transparent', // Makes the text transparent so only the gradient is visible
                                        fontWeight: 'bold', // Optional: make text bold
                                    }}>Intuitive.</span>                                    
                                    </p>
                                </>
                            )}
                            {activeIndex === 1 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Courses
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Discover a wide range of courses offered by SMU. Our platform makes it easy to filter, compare, and select the best courses for your academic journey.
                                    </p>
                                </>
                            )}
                            {activeIndex === 2 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Bid Price Analytics
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Maximize your chances of securing your preferred modules with our bid price analytics tool. Gain insights into bidding trends and make informed decisions.
                                    </p>
                                </>
                            )}
                            {activeIndex === 3 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Senior Roadmaps
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Navigate your academic path with our senior roadmaps. Our guides help you plan your semesters efficiently, ensuring you meet all your graduation requirements.
                                    </p>
                                </>
                            )}
                            {activeIndex === 4 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Community Threads
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Engage with your peers through our community threads. Share insights, ask questions, and build connections with fellow students in a collaborative environment.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Benefits;
