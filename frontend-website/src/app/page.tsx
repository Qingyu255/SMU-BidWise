"use client";

import About from '../components/homepage/About';
import WelcomeMessage from '../components/homepage/Welcome'; 
import Cards from '../components/homepage/Cards';

export default function Home() {
  return (
    <div style={{ margin: '0', padding: '0', position: 'relative' }}>
      {/* Welcome Message Component */}
      <WelcomeMessage />

      {/* About Section */}
      <About />

      {/* Cards Section */}
      <div id="cards-section">
        <Cards />
      </div>
    </div>
  );
}
