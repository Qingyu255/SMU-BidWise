"use client"
import React, {useState} from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Combobox } from '@/components/Combobox';
import { Button } from '@nextui-org/react';
import { useTransition } from 'react';
import { Spinner } from '@nextui-org/react';
import { SearchSlash } from 'lucide-react';

export interface RoadmapFilterOptions {
    verifiedSeniorsArr: string[];
    degreeArr: string[];
}
 
export default function RoadmapFilters({ verifiedSeniorsArr, degreeArr }: RoadmapFilterOptions) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const likesArr = ['Ascending', 'Descending']

    const [selectedDegree, setSelectedDegree] = useState<string>(searchParams.get("degree") || "");
    const [selectedVerifiedSeniors, setSelectedVerifiedSeniors] = useState<string>(searchParams.get("verified_seniors") || "");
    const [selectedLikes, setSelectedLikes] = useState<string>(searchParams.get("likes") || "");

    const updateSearchParams = (param: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(param, value);
        } else {
            params.delete(param);
        }
        params.delete("page");

        startTransition(() => {   
            router.push(`${pathname}?${params.toString()}`);
        })
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams);
        // params.delete('query');
        params.delete('degree');
        params.delete('verified_seniors');
        params.delete('likes')

        setSelectedDegree('');
        setSelectedVerifiedSeniors('');
        setSelectedLikes('');

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        })
    }

    return (
        <div className='pt-3 py-2'>
            <h2 className='px-1 md:text-lg font-semibold text-gray-500 pb-1'>Filter by:</h2>
            <div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Degree:</span>
                    <Combobox selectedValue={selectedDegree} onSelect={(selectedValue: string) => {setSelectedDegree(selectedValue); updateSearchParams('degree', selectedValue)}} category='Degree' options={degreeArr}/>
                </div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Verified Seniors:</span>
                    <Combobox selectedValue={selectedVerifiedSeniors} 
                        onSelect={
                        (selectedValue: string) => {setSelectedVerifiedSeniors(selectedValue); 
                        updateSearchParams('verified_seniors', selectedValue)}} 
                        category='Verified Seniors:' options={verifiedSeniorsArr.map((val) => String(val).toUpperCase())}/>
                </div>
                <div className='inline-flex flex-col'>
                    <span className='text-sm font-bold px-1'>Order by likes:</span>
                    <Combobox selectedValue={selectedLikes} 
                        onSelect={
                        (selectedValue: string) => {setSelectedLikes(selectedValue); 
                        updateSearchParams('likes', selectedValue)}} 
                        category='Likes:' options={likesArr}/>
                </div>
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
