import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const Benefits = () => {
    const { theme } = useTheme();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null); // Explicitly define the type

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

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div>
                <p style={sectionSubTextStyle}>Why Choose SMU BidWise?</p>
                <h2 style={sectionHeadTextStyle}>Introduction to Our Features</h2>
            </div>

            <div 
                style={{ 
                    display: 'flex', 
                    flexDirection: windowWidth < 768 ? 'column' : 'row',
                    border: `2px solid ${borderColor}`, 
                    borderRadius: '1rem', 
                    padding: '1rem', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '1rem',
                    backgroundColor: theme === 'dark' ? '#333' : '#f9f9f9' 
                }}
            >
                <div style={{ flexBasis: '40%', textAlign: windowWidth >= 768 ? 'left' : 'center' }}>
                    <p style={{
                        fontSize: windowWidth >= 768 ? '30px' : '20px',
                        fontWeight: '600',
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '1rem'
                    }}>
                        Timetable & Course Discovery
                    </p>
                    <p style={{
                        fontSize: windowWidth >= 768 ? '16px' : '14px',
                        color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                        marginBottom: '0.5rem'
                    }}>
                        Effortlessly browse and plan your courses. Our timetable feature allows you to visualize course availability, helping you build a schedule that fits your needs and preferences.
                    </p>
                </div>

                <div 
                    style={{ 
                        position: 'relative',
                        marginLeft: windowWidth >= 768 ? '1rem' : '0', 
                        backgroundColor: 'lightgrey', 
                        padding: '1rem', 
                        borderRadius: '1rem', 
                        marginTop: windowWidth < 768 ? '1rem' : '0',
                        flexBasis: '50%' 
                    }}
                >
                    <video 
                        ref={videoRef}
                        loop={windowWidth >= 768}
                        muted 
                        autoPlay={windowWidth >= 768}
                        controls={windowWidth >= 768} 
                        style={{ width: '100%', height: 'auto' }}
                    >
                        <source src="/images/timetable.mp4" type="video/mp4" />
                    </video>
                    
                    {!isPlaying && windowWidth < 768 && (
                        <button 
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '48px',
                                color: '#ff6347'
                            }}
                            onClick={handlePlayVideo}
                        >
                            ▶️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Benefits;
