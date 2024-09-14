import Cylinder_shape from '../components/cylinder-threejs/cylinder';

export default function Home() {
  return (
    <div>
      <div>
        Hello SMU BidWise, this is the home page
      </div>
      <div style={{ width: '100%', height: '100vh' }}>
        <Cylinder_shape />
      </div>
    </div>
  );
}