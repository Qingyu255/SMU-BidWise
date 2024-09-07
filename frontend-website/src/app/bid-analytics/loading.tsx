import React from 'react';
import { Spinner } from '@nextui-org/react';

export default function loading() {
    return (
        <div className='h-full w-full flex items-center justify-center'>
            <Spinner />
        </div>
    )
}
