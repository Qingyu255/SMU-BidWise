"use client";

import About from '../components/homepage/About';
import WelcomeMessage from '../components/homepage/Welcome'; 
import ReadReviews from '../components/homepage/Test';
import Reviews from '../components/homepage/Reviews';

export default function Home() {
  return (
    <div style={{ margin: '0', padding: '0', position: 'relative' }}>
      {/* Welcome Message Component */}
      <div>
        <WelcomeMessage />
      </div>

      <div id='about-section'>
        <About />
      </div>

      <div id='reviews-section'>
        <Reviews />
      </div>

      {/* Global Style for Smooth Scrolling and Video Fade Animation */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes fadeEffect {
          0%, 80% {
            opacity: 1;
          }
          90%, 100% {
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}
