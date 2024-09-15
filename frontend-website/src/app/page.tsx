import Cylinder_shape from '../components/cylinder-threejs/cylinder';

export default function Home() {
  return (
    <div>
      <div style={{ display: 'flex', height: '100vh', paddingTop: '0' }}>
        {/* Welcome message */}
        <div style={{ flex: 0.3, padding: '20px' }}> {/* Adjust flex to make it smaller */}
          <h1 style={{
          fontSize: '2.5rem', // Larger font size for heading
          fontWeight: 'bold',
          lineHeight: '1.2',
        }}>Welcome to SMOODS</h1>
          <p style={{
          fontSize: '1.2rem', // Slightly larger font size for paragraph
          lineHeight: '1.4', // Reduced line height for closer line spacing
          margin: '0',
        }}>Optimizing the module bidding process for SMU students.</p>
        </div>

        {/* Rotating cylinder */}
        <div style={{ flex: 0.7, display: 'flex', alignItems: 'flex-start' }}> {/* Adjust flex to make it larger */}
          <div style={{ width: '100%', height: '100%', padding: '0', margin: '0' }}>
            <Cylinder_shape />
          </div>
        </div>
      </div>
    </div>
  );
}
