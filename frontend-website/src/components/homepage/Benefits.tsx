import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const Benefits = () => {
    const { theme } = useTheme();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [activeIndex, setActiveIndex] = useState(0);
    const [fadeIn, setFadeIn] = useState(false); // State for fade-in effect

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

    const navLinkStyle: React.CSSProperties = {
        fontSize: '15px',
        textTransform: 'uppercase',
        color: 'white',
        textDecoration: 'none',
        position: 'relative',
        zIndex: '1',
        margin: '0 10px'
    };

    const borderColor = theme === 'dark' ? 'white' : 'black';

    const handleNavClick = (index: number) => {
        setFadeIn(false); // Trigger fade-out
        setTimeout(() => {
            setActiveIndex(index);
            setFadeIn(true); // Trigger fade-in
        }, 300); // Match this to your transition duration
    };

    // Handle next and previous carousel navigation
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
                {/* Conditionally render the nav or carousel controls based on screen size */}
                {windowWidth >= 768 ? (
                    <nav className="hidden md:flex w-full h-[40px] min-[1190px]:h-[50px] justify-between relative" style={{ backgroundColor: '#34495e', borderRadius: '8px', alignItems: 'center', boxShadow: '0 2px 3px 0 rgba(0,0,0,.1)', padding: '10px' }}>
                        <button style={navLinkStyle} onClick={() => handleNavClick(0)}>Timetable</button>
                        <button style={navLinkStyle} onClick={() => handleNavClick(1)}>Courses</button>
                        <button style={navLinkStyle} onClick={() => handleNavClick(2)}>Bid Price Analytics</button>
                        <button style={navLinkStyle} onClick={() => handleNavClick(3)}>Senior Roadmaps</button>
                        <button style={navLinkStyle} onClick={() => handleNavClick(4)}>Community Threads</button>
                    </nav>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginTop: '10px' }}>
                        <button onClick={handlePrevious}>Previous</button>
                        <button onClick={handleNext}>Next</button>
                    </div>
                )}

                {/* Custom carousel implementation */}
                <div id="carousel-content" style={{ marginTop: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: windowWidth < 768 ? 'column' : 'row',
                        border: `2px solid ${borderColor}`,
                        borderRadius: '1rem',
                        padding: '1rem',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: theme === 'dark' ? '#333' : '#f9f9f9'
                    }}>
                        <div style={{ flexBasis: '40%', textAlign: windowWidth >= 768 ? 'left' : 'center', opacity: fadeIn ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}>
                            {activeIndex === 0 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Timetable
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Effortlessly browse and plan your courses. Our timetable feature allows you to visualize course availability, helping you build a schedule that fits your needs and preferences.
                                    </p>
                                </>
                            )}
                            {activeIndex === 1 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Courses
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Explore a wide range of courses available to enhance your skills and knowledge.
                                    </p>
                                </>
                            )}
                            {activeIndex === 2 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Bid Price Analytics
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Utilize advanced analytics to optimize your bidding strategy.
                                    </p>
                                </>
                            )}
                            {activeIndex === 3 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Senior Roadmaps
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Access personalized senior roadmaps to guide your academic journey.
                                    </p>
                                </>
                            )}
                            {activeIndex === 4 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Community Threads
                                    </p>
                                    <p style={{ fontSize: windowWidth >= 768 ? '16px' : '14px', color: theme === 'dark' ? '#d1d5db' : '#4b5563', marginBottom: '0.5rem' }}>
                                        Join discussions and collaborate with peers in community threads.
                                    </p>
                                </>
                            )}
                        </div>
                        <div style={{ flexBasis: '60%', textAlign: windowWidth >= 768 ? 'right' : 'center', padding: '10px', margin:'10px' , backgroundColor: 'lightgrey', borderRadius: '10px', opacity: fadeIn ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}>
                            {activeIndex === 0 && (
                                <video
                                    src="./images/timetable.mp4"
                                    controls
                                    autoPlay
                                    loop
                                    style={{ width: '100%', borderRadius: '8px' }}
                                    onError={() => console.error('Error loading video')}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Benefits;
