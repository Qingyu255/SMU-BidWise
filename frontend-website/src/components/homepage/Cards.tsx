"use client";

import React from "react";
import Tilt from "react-parallax-tilt";
import { motion, Variants } from "framer-motion";
import { useTheme } from "next-themes"; // Importing theme hook
import { useRouter } from "next/navigation"; // Importing useRouter for navigation

// Define the type for card variants
const cardVariants: Variants = {
    hidden: { opacity: 0, x: -50 }, // Start off-screen to the left
    visible: (index: number) => ({
      opacity: 1,
      x: 0, // Slide in to its original position
      transition: {
        delay: 2.5 + index * 0.3, // 2 seconds base delay plus incremental delay based on index
        duration: 0.6, // Duration of the animation
      },
    }),
  };

const Cards = () => {
  const { theme } = useTheme(); // Get the current theme
  const router = useRouter(); // Hook for navigation

  // Styles based on current theme
  const cardBackgroundColor = theme === 'dark' ? 'bg-white' : 'bg-gray-800'; // White for dark mode, gray for light mode
  const textColor = theme === 'dark' ? 'text-black' : 'text-white'; // Black text for dark mode, white for light mode

  // Handler for button click
  const handleClick = (page: string) => {
    router.push(page); // Navigate to the specified page
  };

  const cards = [
    { title: 'Timetable', description: 'Additional details about card 1...', path: '/timetable' },
    { title: 'Courses', description: 'Additional details about card 2...', path: '/courses' },
    { title: 'Bid Price Analytics', description: 'Additional details about card 3...', path: '/bid-analytics' },
    { title: 'Senior Roadmaps', description: 'Additional details about card 4...', path: '/roadmaps' },
    { title: 'Graduation Progress Tracker', description: 'Additional details about card 5...', path: '/graduation-progress-tracker' },
    { title: 'Community Threads', description: 'Additional details about card 6...', path: '/communities' },
  ];

  return (
    <div className="mt-20 flex flex-wrap gap-10 justify-center">
      {cards.map((card, index) => (
        <Tilt
          key={index}
          className="xs:w-[250px] w-[350px]"
          tiltMaxAngleX={20}
          tiltMaxAngleY={20}
          scale={1}
          transitionSpeed={450}
        >
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            className={`w-full green-pink gradient p-[1px] rounded-[20px] shadow-card ${cardBackgroundColor}`}
          >
            <div className={`p-5 rounded-[20px] py-10 px-12 min-h-[280px] ${cardBackgroundColor} ${textColor}`}>
              <h3 className="text-xl font-bold">{card.title}</h3>
              <p>{card.description}</p>
              <button
                onClick={() => handleClick(card.path)}
                className={`mt-4 px-4 py-2 rounded bg-blue-500 text-white ${textColor}`}
              >
                View
              </button>
            </div>
          </motion.div>
        </Tilt>
      ))}
    </div>
  );
};

export default Cards;
