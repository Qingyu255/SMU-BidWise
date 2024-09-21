import Timeline from '@/components/roadmap/Timeline';

export default async function Page() {


  return (
    // <div className='w-full h-full'>
       <div className='flex flex-col overflow-hidden' style={{ width: '100%', height: '100%'}}>
          <div>
            Hello, this is senior roadmap.
            <br/>
            Only Y1S1 clickable for now!!
          </div>
          
          <div className='container w-10/12 h-screen self-center flex-grow-0'>
            <Timeline seniorName='Senior3'/>
          </div>
            
          

        </div>
    // </div>
    
  );
}

