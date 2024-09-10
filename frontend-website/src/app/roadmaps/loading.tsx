import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

export default function loading() {
    return (
        <div className='h-[100vh]'>
            <div className='h-full flex items-center justify-center'>
                <ClipLoader loading={true} />
            </div>
        </div>
    )
}
