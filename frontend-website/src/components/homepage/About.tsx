"use client";

import "./About.css";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Autoplay from "embla-carousel-autoplay";

const About = () => {
  const { theme } = useTheme(); // Get the current theme

  // Hook to handle window resizing
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Styles based on window width and current theme
  const sectionHeadTextStyle: React.CSSProperties = {
    color: theme === "dark" ? "white" : "black",
    fontWeight: "bold",
    fontSize:
      windowWidth >= 640 ? "60px" : windowWidth >= 480 ? "50px" : "30px",
  };

  const sectionSubTextStyle: React.CSSProperties = {
    fontSize: windowWidth >= 640 ? "18px" : "14px",
    color: theme === "dark" ? "#6b7280" : "#333333",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };

  const carouselHeaderColor = theme === "dark" ? "#2C3531" : "#4b5563";

  // Benefits section state and styles
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [fadeIn, setFadeIn] = useState(true); // State for fade-in effect

  const benefitsNavLinkStyle: React.CSSProperties = {
    fontSize: "15px",
    textTransform: "uppercase",
    color: "#828282",
    textDecoration: "none",
    position: "relative",
    zIndex: "1",
    margin: "0 10px",
    paddingBottom: "1px",
    transition: "color 0.3s ease, transform 0.3s ease", // Added transition for hover effect
  };

  const benefitsActiveNavLinkStyle: React.CSSProperties = {
    ...benefitsNavLinkStyle,
    borderBottom: `3px solid ${theme === "dark" ? "white" : "black"}`,
    borderRadius: "8px",
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

  const autoplay = Autoplay({ delay: 3000 }); // Set your desired autoplay delay

  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center", height: "100%" }}>
      {/* About Section */}
      <div style={{}}>
        <p style={sectionSubTextStyle}>Introduction</p>
        <h2 style={sectionHeadTextStyle}>Overview</h2>
        <p>
          Welcome to SMU BidWise! Transform your module bidding experience with
          real-time analytics, personalized insights, and an intuitive
          timetable. Access senior roadmaps, bid price trends, and a graduation
          tracker to make informed decisions. Stay updated on course
          availability and enjoy seamless data visualizations—all in one place!
        </p>
      </div>

      {/* Benefits Section */}
      <div style={{ marginTop: "4rem" }}>
        <p style={sectionSubTextStyle}>Why Choose SMU BidWise?</p>
        <h2 style={sectionHeadTextStyle}>Introduction to Our Features</h2>

        {/* Navigation for carousel */}
        <nav
          className="hidden md:flex w-full h-[60px] min-[1190px]:h-[60px] justify-between"
          style={{
            borderRadius: "8px",
            alignItems: "center",
            boxShadow: "0px 2px 3px 1px rgba(0,0,0,.5)",
            padding: "20px",
          }}
        >
          {[
            "Timetable",
            "Courses",
            "Bid Price Analytics",
            "Senior Roadmaps",
            "Community Threads",
          ].map((label, index) => (
            <button
              key={index}
              style={{
                ...(activeIndex === index
                  ? benefitsActiveNavLinkStyle
                  : benefitsNavLinkStyle),
                ...(hoverIndex === index
                  ? {
                      color: theme === "dark" ? "#f3f4f6" : "#000",
                      transform: "scale(1.05)",
                    }
                  : {}),
              }}
              onMouseEnter={() => setHoverIndex(index)} // Set hover index
              onMouseLeave={() => setHoverIndex(null)} // Reset hover index
              onClick={() => handleNavClick(index)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Custom carousel implementation */}
        <div id="carousel-content" style={{ marginTop: "1rem" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: `2px solid ${theme === "dark" ? "white" : "black"}`,
              borderRadius: "1rem",
              padding: "1rem",
              alignItems: "center",
              backgroundColor: theme === "dark" ? "#ddd8d5" : "#f9f9f9",
              height: "auto",
              minHeight: "300px", // Set your minimum height here
              maxHeight: "900px", // Set your maximum height here
            }}
          >
            <div
              style={{
                textAlign: "center",
                opacity: fadeIn ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
                width: "100%",
              }}
            >
              {activeIndex === 0 && (
                <>
                  <p
                    style={{
                      fontSize: windowWidth >= 768 ? "40px" : "20px",
                      fontWeight: "600",
                      color: carouselHeaderColor,
                    }}
                  >
                    Timetable
                  </p>
                  <div className="header-text">
                    <span
                      style={{
                        backgroundColor: "#4158D0",
                        backgroundImage:
                          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: windowWidth >= 768 ? "30px" : "20px",
                        fontWeight: "600",
                        margin: "0 10px",
                      }}
                    >
                      Concise.
                    </span>
                    <span
                      style={{
                        backgroundColor: "#4158D0",
                        backgroundImage:
                          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: windowWidth >= 768 ? "30px" : "20px",
                        fontWeight: "600",
                        margin: "0 10px",
                      }}
                    >
                      Flexible.
                    </span>
                    <span
                      style={{
                        backgroundColor: "#4158D0",
                        backgroundImage:
                          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: windowWidth >= 768 ? "30px" : "20px",
                        fontWeight: "600",
                        margin: "0 10px",
                      }}
                    >
                      Intuitive.
                    </span>
                  </div>
                  {/* <p
                    style={{
                      fontSize: windowWidth >= 768 ? "16px" : "14px",
                      color: theme === "dark" ? "#8c8c8c" : "#4b5563",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Explore a diverse selection of courses at SMU. Our platform
                    simplifies the process of filtering, comparing, and choosing
                    the ideal courses for your academic path, while also
                    providing ratings for each course.
                  </p> */}

                  {windowWidth >= 768 ? (
                    // Display cards in a row for larger screens
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "stretch", // Ensures cards stretch to equal height
                      }}
                    >
                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Sync to Cloud</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Access your schedule anytime, anywhere, with
                            seamless cloud integration
                          </p>
                          <img src="/images/cloud.gif" alt="Sync to Cloud" />
                        </CardContent>
                      </Card>

                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Customize</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Add or remove modules with just a few clicks,
                            keeping your schedule flexible and up-to-date
                          </p>
                          <img src="/images/calendar.gif" alt="Customize" />
                        </CardContent>
                      </Card>

                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Module Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Instantly see a clear summary of all your modules,
                            helping you stay organized
                          </p>
                          <img src="/images/look.gif" alt="Module Overview" />
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // Display cards in a carousel for small screens
                    <Carousel plugins={[autoplay]} style={{ width: "100%" }}>
                      <CarouselContent>
                        {/* Ratings Card in Carousel */}
                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Sync to Cloud
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p
                                style={{
                                  marginBottom: "auto",
                                  fontSize: "12px",
                                  color: "black", // Paragraph text color
                                }}
                              >
                                Access your schedule anytime, anywhere, with
                                seamless cloud integration
                              </p>
                              <img
                                src="/images/cloud.gif"
                                alt="Sync to Cloud"
                              />
                            </CardContent>
                          </Card>
                        </CarouselItem>

                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Customize
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p
                                style={{
                                  marginBottom: "20px",
                                  fontSize: "12px",
                                  color: "black", // Paragraph text color
                                }}
                              >
                                Add or remove modules with just a few clicks,
                                keeping your schedule flexible and up-to-date
                              </p>
                              <img src="/images/calendar.gif" alt="Customize" />
                            </CardContent>
                          </Card>
                        </CarouselItem>

                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Module Overview
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p
                                style={{
                                  marginBottom: "10px",
                                  fontSize: "12px",
                                  color: "black", // Paragraph text color
                                }}
                              >
                                Instantly see a clear summary of all your
                                modules, helping you stay organized
                              </p>
                              <img
                                src="/images/look.gif"
                                alt="Module Overview"
                              />
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  )}

                  <Button style={{ marginTop: "15px" }}>
                    <a href="/courses">Search Courses</a>
                  </Button>
                </>
              )}
              {activeIndex === 1 && (
                <>
                  <p
                    style={{
                      fontSize: windowWidth >= 768 ? "40px" : "20px",
                      fontWeight: "600",
                      color: carouselHeaderColor,
                    }}
                  >
                    Courses
                  </p>
                  <div className="header-text">
                    <span
                      style={{
                        backgroundColor: "#4158D0",
                        backgroundImage:
                          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: windowWidth >= 768 ? "30px" : "20px",
                        fontWeight: "600",
                        margin: "0 10px",
                      }}
                    >
                      Comprehensive.
                    </span>
                    <span
                      style={{
                        backgroundColor: "#4158D0",
                        backgroundImage:
                          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: windowWidth >= 768 ? "30px" : "20px",
                        fontWeight: "600",
                        margin: "0 10px",
                      }}
                    >
                      Convenient.
                    </span>
                    <span
                      style={{
                        backgroundColor: "#4158D0",
                        backgroundImage:
                          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: windowWidth >= 768 ? "30px" : "20px",
                        fontWeight: "600",
                        margin: "0 10px",
                      }}
                    >
                      Insightful.
                    </span>
                  </div>
                  {/* <p
                    style={{
                      fontSize: windowWidth >= 768 ? "16px" : "14px",
                      color: theme === "dark" ? "#8c8c8c" : "#4b5563",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Explore a diverse selection of courses at SMU. Our platform
                    simplifies the process of filtering, comparing, and choosing
                    the ideal courses for your academic path, while also
                    providing ratings for each course.
                  </p> */}

                  {windowWidth >= 768 ? (
                    // Display cards in a row for larger screens
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "stretch", // Ensures cards stretch to equal height
                      }}
                    >
                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Filter Options</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Easily filter courses based on various criteria
                          </p>
                          <img src="/images/filter.gif" alt="Filter" />
                        </CardContent>
                      </Card>

                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Course Ratings</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            View practicality, workload, and interest ratings
                            for each course
                          </p>
                          <img src="/images/review.gif" alt="Ratings" />
                        </CardContent>
                      </Card>

                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Course Information</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Access course descriptions and enrollment
                            requirements in one view
                          </p>
                          <img src="/images/info.gif" alt="CourseInfo" />
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // Display cards in a carousel for small screens
                    <Carousel plugins={[autoplay]} style={{ width: "100%" }}>
                      <CarouselContent>
                        {/* Ratings Card in Carousel */}
                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Course Ratings
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p
                                style={{
                                  marginBottom: "auto",
                                  fontSize: "12px",
                                  color: "black", // Paragraph text color
                                }}
                              >
                                View practicality, workload, and interest
                                ratings for each course
                              </p>
                              <img src="/images/review.gif" alt="Ratings" />
                            </CardContent>
                          </Card>
                        </CarouselItem>

                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Filter Options
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p
                                style={{
                                  marginBottom: "20px",
                                  fontSize: "12px",
                                  color: "black", // Paragraph text color
                                }}
                              >
                                Easily filter courses based on various criteria
                              </p>
                              <img src="/images/filter.gif" alt="Filter" />
                            </CardContent>
                          </Card>
                        </CarouselItem>

                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Course Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p
                                style={{
                                  marginBottom: "10px",
                                  fontSize: "12px",
                                  color: "black", // Paragraph text color
                                }}
                              >
                                Access course descriptions and enrollment
                                requirements in one view
                              </p>
                              <img src="/images/info.gif" alt="Courses" />
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  )}

                  <Button style={{ marginTop: "15px" }}>
                    <a href="/courses">Search Courses</a>
                  </Button>
                </>
              )}

              {activeIndex === 2 && (
                <>
                  <p
                    style={{
                      fontSize: windowWidth >= 768 ? "40px" : "20px",
                      fontWeight: "600",
                      color: carouselHeaderColor,
                    }}
                  >
                    Bid Price Analytics
                  </p>
                  <span
                    style={{
                      backgroundColor: "#4158D0",
                      backgroundImage:
                        "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: windowWidth >= 768 ? "30px" : "20px",
                      fontWeight: "600",
                      margin: "0 10px",
                    }}
                  >
                    Strategic.{" "}
                  </span>
                  <span
                    style={{
                      backgroundColor: "#4158D0",
                      backgroundImage:
                        "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: windowWidth >= 768 ? "30px" : "20px",
                      fontWeight: "600",
                      margin: "0 10px",
                    }}
                  >
                    Empowering.{" "}
                  </span>
                  {/* <p
                    style={{
                      fontSize: windowWidth >= 768 ? "16px" : "14px",
                      color: theme === "dark" ? "#8c8c8c" : "#4b5563",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Maximize your chances of securing your preferred modules
                    with our bid analytics tool. Gain insights into bidding
                    trends and make informed choices
                  </p> */}

                  {windowWidth >= 768 ? (
                    // Display cards in a row for larger screens
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "stretch", // Ensures cards stretch to equal height
                      }}
                    >
                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Historical Bidding Trends</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Gain insights into past bidding patterns to
                            determine your optimal bid amounts
                          </p>
                          <img
                            src="/images/analytics.png"
                            alt="Historical Bidding Trends"
                          />
                        </CardContent>
                      </Card>

                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Bid Smarter</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Avoid the pitfalls of overbidding and underbidding
                            with our smart insights into bidding trends
                          </p>
                          <img src="/images/happiness.png" alt="Filter" />
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // Display cards in a carousel for small screens
                    <Carousel plugins={[autoplay]} style={{ width: "100%" }}>
                      <CarouselContent>
                        {/* Ratings Card in Carousel */}
                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Historical Bidding Trends
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="card-content">
                              <p
                                style={{
                                  marginBottom: "auto",
                                  fontSize: "12px",
                                  color: "black",
                                }}
                              >
                                Gain insights into past bidding patterns to
                                determine your optimal bid amounts
                              </p>
                              <img
                                src="/images/analytics.png"
                                alt="Historical Bidding trends"
                              />
                            </CardContent>
                          </Card>
                        </CarouselItem>

                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Bid Smarter
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="card-content">
                              <p
                                style={{
                                  marginBottom: "auto",
                                  fontSize: "12px",
                                  color: "black", // Paragraph text color
                                }}
                              >
                                Avoid the pitfalls of overbidding and
                                underbidding with our smart insights into
                                bidding trends
                              </p>
                              <img
                                src="/images/happiness.png"
                                alt="Bid Smarter"
                              />
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  )}

                  <Button style={{ marginTop: "15px" }}>
                    <a href="/bid-analytics">View Analytics</a>
                  </Button>
                </>
              )}

              {activeIndex === 3 && (
                <>
                  <p
                    style={{
                      fontSize: windowWidth >= 768 ? "40px" : "20px",
                      fontWeight: "600",
                      color: carouselHeaderColor,
                    }}
                  >
                    Senior Roadmaps
                  </p>
                  <span
                    style={{
                      backgroundColor: "#4158D0",
                      backgroundImage:
                        "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: windowWidth >= 768 ? "30px" : "20px",
                      fontWeight: "600",
                      margin: "0 10px",
                    }}
                  >
                    Guidance.{" "}
                  </span>
                  <span
                    style={{
                      backgroundColor: "#4158D0",
                      backgroundImage:
                        "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: windowWidth >= 768 ? "30px" : "20px",
                      fontWeight: "600",
                      margin: "0 10px",
                    }}
                  >
                    Insight.{" "}
                  </span>
                  {/* <p
                    style={{
                      fontSize: windowWidth >= 768 ? "16px" : "14px",
                      color: theme === "dark" ? "#8c8c8c" : "#4b5563",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Maximize your chances of securing your preferred modules
                    with our bid analytics tool. Gain insights into bidding
                    trends and make informed choices
                  </p> */}

                  {windowWidth >= 768 ? (
                    // Display cards in a row for larger screens
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "stretch", // Ensures cards stretch to equal height
                      }}
                    >
                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Unlock Your Path to Success</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Discover your senior&apos;s course selections and
                            strategies, empowering you to make informed
                            decisions and navigate your academic path with
                            confidence
                          </p>
                          <img
                            src="/images/unlock.gif"
                            alt="Unlock Your Path to Sucess"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // Display cards in a carousel for small screens
                    <Carousel plugins={[autoplay]} style={{ width: "100%" }}>
                      <CarouselContent>
                        {/* Ratings Card in Carousel */}
                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Unlock Your Path to Success
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="card-content">
                              <p
                                style={{
                                  marginBottom: "auto",
                                  fontSize: "12px",
                                  color: "black",
                                }}
                              >
                                Discover your senior&apos;s course selections
                                and strategies, empowering you to make informed
                                decisions and navigate your academic path with
                                confidence
                              </p>
                              <img
                                src="/images/unlock.gif"
                                alt="Unlock Your Path to Sucess"
                              />
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  )}

                  <Button style={{ marginTop: "15px" }}>
                    <a href="/roadmaps">Discover Senior Roadmaps</a>
                  </Button>
                </>
              )}

              {activeIndex === 4 && (
                <>
                  <p
                    style={{
                      fontSize: windowWidth >= 768 ? "40px" : "20px",
                      fontWeight: "600",
                      color: carouselHeaderColor,
                    }}
                  >
                    Community Threads
                  </p>
                  <div className="header-text">
                    <span
                      style={{
                        backgroundColor: "#4158D0",
                        backgroundImage:
                          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: windowWidth >= 768 ? "30px" : "20px",
                        fontWeight: "600",
                        margin: "0 10px",
                      }}
                    >
                      Connect.
                    </span>
                    <span
                      style={{
                        backgroundColor: "#4158D0",
                        backgroundImage:
                          "linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: windowWidth >= 768 ? "30px" : "20px",
                        fontWeight: "600",
                        margin: "0 10px",
                      }}
                    >
                      Discuss.
                    </span>
                  </div>
                  {/* <p
                    style={{
                      fontSize: windowWidth >= 768 ? "16px" : "14px",
                      color: theme === "dark" ? "#8c8c8c" : "#4b5563",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Explore a diverse selection of courses at SMU. Our platform
                    simplifies the process of filtering, comparing, and choosing
                    the ideal courses for your academic path, while also
                    providing ratings for each course.
                  </p> */}

                  {windowWidth >= 768 ? (
                    // Display cards in a row for larger screens
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "stretch", // Ensures cards stretch to equal height
                      }}
                    >
                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Share Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Gain valuable advice and tips from peers, helping you make informed decisions
                          </p>
                          <img src="/images/share.gif" alt="Share Insights" />
                        </CardContent>
                      </Card>

                      <Card className={`card ${theme}`}>
                        <CardHeader className={`card-header ${theme}`}>
                          <CardTitle>Collaborate</CardTitle>
                        </CardHeader>
                        <CardContent className="card-content">
                          <p className={theme}>
                            {/* Pass the theme for paragraph color */}
                            Discuss challenges & exchange resources, boosting your success
                          </p>
                          <img src="/images/teamwork.gif" alt="Collaborate" />
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // Display cards in a carousel for small screens
                    <Carousel plugins={[autoplay]} style={{ width: "100%" }}>
                      <CarouselContent>
                        {/* Ratings Card in Carousel */}
                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Share Insights
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p
                                style={{
                                  marginBottom: "auto",
                                  fontSize: "12px",
                                  color: "black", // Paragraph text color
                                }}
                              >
                                Gain valuable advice and tips from peers, helping you make informed decisions
                              </p>
                              <img
                                src="/images/share.gif"
                                alt="Share Insights"
                              />
                            </CardContent>
                          </Card>
                        </CarouselItem>

                        <CarouselItem
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            className="card"
                            style={{ backgroundColor: "#f0f0f0" }}
                          >
                            <CardHeader>
                              <CardTitle
                                style={{ fontSize: "16px", color: "black" }}
                              >
                                Collaborate
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p
                                style={{
                                  marginBottom: "20px",
                                  fontSize: "12px",
                                  color: "black", // Paragraph text color
                                }}
                              >
                                Discuss challenges & exchange resources, boosting your success
                              </p>
                              <img src="/images/teamwork.gif" alt="Collaborate" />
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  )}

                  <Button style={{ marginTop: "15px" }}>
                    <a href="/communities">View Threads</a>
                  </Button>
                </>
              )}
            </div>

            {/* Next and Previous Buttons for smaller screens */}
            {windowWidth < 768 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  marginTop: "1rem",
                }}
              >
                <button
                  onClick={handlePrevious}
                  disabled={activeIndex === 0}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: theme === "dark" ? "#4B5563" : "#E5E7EB",
                    color: theme === "dark" ? "white" : "black",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    opacity: activeIndex === 0 ? 0.5 : 1,
                    transition: "opacity 0.3s",
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={activeIndex === 4}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: theme === "dark" ? "#4B5563" : "#E5E7EB",
                    color: theme === "dark" ? "white" : "black",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    opacity: activeIndex === 4 ? 0.5 : 1,
                    transition: "opacity 0.3s",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
