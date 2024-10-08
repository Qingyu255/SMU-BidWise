"use client";

import About from '../components/homepage/About';
import WelcomeMessage from '../components/homepage/Welcome'; 
import Cards from '../components/homepage/Cards';
import Benefits from '../components/homepage/Benefits';

export default function Home() {
  return (
    <div style={{ margin: '0', padding: '0', position: 'relative' }}>
      {/* Welcome Message Component */}
      <WelcomeMessage />

      {/* About Section */}
      <About />

      {/* Benefits Section */}
      <Benefits />
      
    </div>
  );
}
