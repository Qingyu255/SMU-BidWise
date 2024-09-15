import Cylinder_shape from '../components/cylinder-threejs/cylinder';
import About from '../components/homepage/About';
import WelcomeMessage from '../components/homepage/Welcome';  // Import the new WelcomeMessage component

export default function Home() {
  return (
    <div style={{ height: '100vh', margin: '0', padding: '0' }}>
      
      {/* Section with the background Cylinder */}
      <div style={{ 
        position: 'relative', 
        height: '50vh',  // Adjust height to limit cylinder background to half the screen
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-start',  // Align to top
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: '4rem',  // Adjust padding for spacing from the top
      }}>
        {/* Background Cylinder */}
        <div style={{
          position: 'absolute',
          top: 80,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}>
          <Cylinder_shape />
        </div>

        {/* Welcome Message Component */}
        <WelcomeMessage />
      </div>

      {/* About Section without background Cylinder */}
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <About />
      </div>
    
    </div>
  );
}
