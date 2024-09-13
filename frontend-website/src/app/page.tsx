import Cylinder_shape from './cylinder-threejs/cylinder';

export default function Home() {
  return (
    <div>
      <div>
        Hello SMU BidWise, this is the home page
      </div>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Cylinder_shape />
      </div>
    </div>
  );
}