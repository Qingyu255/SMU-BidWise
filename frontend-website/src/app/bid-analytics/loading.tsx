import React from 'react';
import {NextUIProvider} from "@nextui-org/react";
import { Spinner } from '@nextui-org/react';

export default function loading() {
    return (
        <NextUIProvider>
            <div className='h-[100vh]'>
                <div className='h-full flex items-center justify-center'>
                    <Spinner color="primary"/>
                </div>
            </div>
        </NextUIProvider>
    )
}
