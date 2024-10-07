import Cylinder_shape from '../components/cylinder-threejs/cylinder';
import About from '../components/homepage/About';
import WelcomeMessage from '../components/homepage/Welcome'; 
import Cards from '../components/homepage/Cards'

export default function Home() {
  return (
    <div style={{ height: '100vh', margin: '0', padding: '0' }}>
      
      {/* Welcome Message Component */}
        <WelcomeMessage />

      {/* About Section without background Cylinder */}
      <About />

      {/* Cards Section */}
      <Cards />

    
    </div>
  );
}
