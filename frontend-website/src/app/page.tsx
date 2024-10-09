"use client";

import About from '../components/homepage/About';
import WelcomeMessage from '../components/homepage/Welcome'; 
import Benefits from '../components/homepage/Benefits';
import Reviews from '../components/homepage/Reviews';



export default function Home() {
  return (
    
    <div style={{ margin: '0', padding: '0', position: 'relative' }}>
      {/* Welcome Message Component */}
      <div style={{ height: 'calc(100vh - 70px)', border:'2px solid black', display:'flex', paddingBottom:'10rem'}}>
        <WelcomeMessage />
      </div>

      {/* About + Benefits Section */}
      <div id='about-section' style={{ height: '100vh', display: 'flex', flexDirection: 'column', border: '2px solid black' }}>
        <About />
        <Benefits />
      </div>

      <div id='reviews-section' style={{ height: '100vh', display: 'flex', flexDirection: 'column', border: '2px solid black' }}>
        <Reviews />
      </div>

      {/* Global Style for Smooth Scrolling */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      
    </div>
  );
}
