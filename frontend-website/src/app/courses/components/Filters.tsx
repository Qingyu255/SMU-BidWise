"use client"
import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Combobox } from '@/components/Combobox';
import { Button } from '@nextui-org/react';
import { useTransition } from 'react';
import { Spinner } from '@nextui-org/react';

export interface FilterOptions {
    careerArr: string[];
    grading_basisArr: string[];
    unitsArr: string[];
    areaArr: string[];
}
 
export default function Filters({ careerArr, grading_basisArr, unitsArr, areaArr }: FilterOptions) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const updateSearchParams = (param: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(param, value);
        } else {
            params.delete(param);
        }
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        })
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('query');
        params.delete('career');
        params.delete('grading_basis');
        params.delete('units');
        params.delete('area');
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className='pt-3 py-2'>
            <h2 className='px-1 md:text-lg font-semibold text-gray-500 pb-1'>Filter by:</h2>
            <div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Career:</span>
                    <Combobox onSelect={(selectedValue: string) => updateSearchParams('career', selectedValue)} category='Career' options={careerArr}/>
                </div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Course area:</span>
                    <Combobox onSelect={(selectedValue: string) => updateSearchParams('area', selectedValue)} category='Course area:' options={areaArr}/>
                </div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Grading basis:</span>
                    <Combobox onSelect={(selectedValue: string) => updateSearchParams('grading_basis', selectedValue)} category='Grading basis' options={grading_basisArr}/>
                </div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Units:</span>
                    <Combobox onSelect={(selectedValue: string) => updateSearchParams('units', selectedValue)} category='Units' options={unitsArr}/>
                </div>
                <div className='flex flex-row gap-1 h-full'>
                    <span className='m-1'>
                        <Button onClick={clearFilters} className='text-xs text-gray-500'>
                            Clear Filters
                        </Button>
                    </span>
                    <span className='flex h-100 items-center'>
                        {isPending &&(
                            <div className="px-2">
                                <Spinner color="default"/>
                            </div>
                        )}
                    </span>
                </div>
            </div>
            
        </div>
    )
}
