import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const Benefits = () => {
    const { theme } = useTheme();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeIndex, setActiveIndex] = useState(0); // State for active carousel index

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePlayVideo = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.addEventListener('ended', handleVideoEnded);
            return () => video.removeEventListener('ended', handleVideoEnded);
        }
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
    const navBackgroundColor = theme === 'dark' ? '#1a1a1a' : 'white'; // Adjust background color for nav
    const navTextColor = theme === 'dark' ? 'white' : 'black'; // Text color for nav items

    const handleNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % 5); // Wrap around to the first index
    };

    const handlePrevious = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + 5) % 5); // Wrap around to the last index
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div>
                <p style={sectionSubTextStyle}>Why Choose SMU BidWise?</p>
                <h2 style={sectionHeadTextStyle}>Introduction to Our Features</h2>
            </div>

            <div style={{ marginTop: '10px' }}>
                {/* Navigation for carousel */}
                <div className="landing_nav">
                    <nav className="hidden md:flex w-full h-[40px] min-[1190px]:h-[50px] justify-between relative" style={{ backgroundColor: navBackgroundColor }}>
                        {/* Navigation items */}
                        {["Timetable", "Courses", "Bid Price Analytics", "Senior Roadmaps", "Community Threads"].map((item, index) => (
                            <div className="h-full flex items-center relative mx-4" key={index}> {/* Use flex for items to align properly */}
                                <button
                                    className={`font-medium md:text-[16px] lg:text-[18px] min-[1190px]:text-[1.5rem] ${activeIndex === index ? navTextColor : 'text-grey-400'} mb-1`} // Use dynamic text color
                                    onClick={() => setActiveIndex(index)} // Update active index on click
                                >
                                    {item}
                                </button>
                                {activeIndex === index && (
                                    <div className="absolute left-0 bottom-[-5px] w-full bg-accent h-[3px] min-[1190px]:h-[5px] rounded-full transition-all duration-200 ease-in-out"></div> // Adjusted bottom value
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Custom carousel implementation */}
                <div style={{ marginTop: '1rem' }}>
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
                        <div style={{ flexBasis: '40%', textAlign: windowWidth >= 768 ? 'left' : 'center' }}>
                            {activeIndex === 0 && (
                                <>
                                    <p style={{ fontSize: windowWidth >= 768 ? '30px' : '20px', fontWeight: '600', fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
                                        Timetable & Course Discovery
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

                        {activeIndex === 0 && (
                            <div style={{ flexBasis: '60%', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '1rem', backgroundColor: 'lightgrey' }}>
                                <video
                                    ref={videoRef}
                                    src={'./images/timetable.mp4'}
                                    width="100%"
                                    controls
                                    style={{ padding: '1rem' }}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Benefits;
