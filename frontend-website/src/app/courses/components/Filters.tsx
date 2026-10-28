"use client"
import React, {useEffect, useRef, useState} from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Combobox } from '@/components/Combobox';
import { Button } from '@nextui-org/react';
import { useTransition } from 'react';
import { Spinner } from '@nextui-org/react';
import { COURSE_DAYS, COURSE_HOURS, nextHour, selectedValues } from '@/lib/courseSchedule';

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
    const paramsRef = useRef(new URLSearchParams(searchParams.toString()));

    const [selectedCareer, setSelectedCareer] = useState<string>(searchParams.get("career") || "");
    const [selectedArea, setSelectedArea] = useState<string>(searchParams.get("area") || "");
    const [selectedGradingBasis, setSelectedGradingBasis] = useState<string>(searchParams.get("grading_basis") || "");
    const [selectedUnits, setSelectedUnits] = useState<string>(searchParams.get("units") || "");
    const [selectedDays, setSelectedDays] = useState(() => selectedValues(searchParams.get('days') || '', COURSE_DAYS.map(day => day.value)));
    const [selectedTimes, setSelectedTimes] = useState(() => selectedValues(searchParams.get('times') || '', COURSE_HOURS));

    useEffect(() => {
        paramsRef.current = new URLSearchParams(searchParams.toString());
        setSelectedDays(selectedValues(searchParams.get('days') || '', COURSE_DAYS.map(day => day.value)));
        setSelectedTimes(selectedValues(searchParams.get('times') || '', COURSE_HOURS));
    }, [searchParams]);

    const updateSearchParams = (param: string, value: string) => {
        const params = new URLSearchParams(paramsRef.current);
        if (value) {
            params.set(param, value);
        } else {
            params.delete(param);
        }
        params.delete("page");
        paramsRef.current = params;
        if (param === 'days') setSelectedDays(selectedValues(value, COURSE_DAYS.map(day => day.value)));
        if (param === 'times') setSelectedTimes(selectedValues(value, COURSE_HOURS));

        startTransition(() => {   
            router.push(`${pathname}?${params.toString()}`);
        })
    };

    const toggleMultiple = (param: 'days' | 'times', value: string) => {
        const allowed = param === 'days' ? COURSE_DAYS.map(day => day.value) : COURSE_HOURS;
        const current = selectedValues(paramsRef.current.get(param) || '', allowed);
        updateSearchParams(param, current.includes(value) ? current.filter(item => item !== value).join(',') : [...current, value].join(','));
    };

    const clearFilters = () => {
        const params = new URLSearchParams(paramsRef.current);
        // params.delete('query');
        params.delete('career');
        params.delete('grading_basis');
        params.delete('units');
        params.delete('area');
        params.delete('days');
        params.delete('times');
        params.delete('page');

        setSelectedCareer('');
        setSelectedArea('');
        setSelectedGradingBasis('');
        setSelectedUnits('');
        setSelectedDays([]);
        setSelectedTimes([]);
        paramsRef.current = params;

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        })
    }

    return (
        <div className='pt-3 py-2'>
            <h2 className='px-1 md:text-lg font-semibold text-gray-500 pb-1'>Filter by:</h2>
            <div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Career:</span>
                    <Combobox selectedValue={selectedCareer} onSelect={(selectedValue: string) => {setSelectedCareer(selectedValue); updateSearchParams('career', selectedValue)}} category='Career' options={careerArr}/>
                </div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Course area:</span>
                    <Combobox selectedValue={selectedArea} onSelect={(selectedValue: string) => {setSelectedArea(selectedValue); updateSearchParams('area', selectedValue)}} category='Course area:' options={areaArr}/>
                </div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Grading basis:</span>
                    <Combobox selectedValue={selectedGradingBasis} onSelect={(selectedValue: string) => {setSelectedGradingBasis(selectedValue); updateSearchParams('grading_basis', selectedValue)}} category='Grading basis' options={grading_basisArr}/>
                </div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Units:</span>
                    <Combobox selectedValue={selectedUnits} onSelect={(selectedValue: string) => {setSelectedUnits(selectedValue); updateSearchParams('units', selectedValue)}} category='Units' options={unitsArr}/>
                </div>
                <fieldset className='mt-3 px-1'>
                    <legend className='text-sm font-bold'>Days in latest term</legend>
                    <div className='flex flex-wrap gap-x-4 gap-y-2 pt-2'>
                        {COURSE_DAYS.map(day => <label key={day.value} className='flex items-center gap-1.5 text-sm cursor-pointer'>
                            <input type='checkbox' checked={selectedDays.includes(day.value)} onChange={() => toggleMultiple('days', day.value)}/>
                            {day.label}
                        </label>)}
                    </div>
                </fieldset>
                <fieldset className='mt-3 px-1'>
                    <legend className='text-sm font-bold'>Class time slots</legend>
                    <p className='text-xs text-muted-foreground'>Show courses with a section that overlaps any checked hour.</p>
                    <div className='flex flex-wrap gap-x-4 gap-y-2 pt-2'>
                        {COURSE_HOURS.map(hour => <label key={hour} className='flex items-center gap-1.5 text-sm cursor-pointer'>
                            <input type='checkbox' checked={selectedTimes.includes(hour)} onChange={() => toggleMultiple('times', hour)}/>
                            {hour}–{nextHour(hour)}
                        </label>)}
                    </div>
                </fieldset>
                <div className='flex flex-row gap-1 h-full'>
                    <span className='m-1'>
                        <Button onClick={clearFilters} className='text-xs'>
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
