import Timeline from '@/components/roadmap/Timeline';

export default async function Page() {


  return (
    <div className='flex flex-col overflow-hidden' style={{ width: '100vw', height: '100vh'}}>
      <div>
        Hello, this is senior roadmap.
        <br/>
        Only Y1S1 clickable for now!!
      </div>
      
      <div className='container w-full h-full'>
        <Timeline/>

      </div>
        
      

    </div>
  );
}

