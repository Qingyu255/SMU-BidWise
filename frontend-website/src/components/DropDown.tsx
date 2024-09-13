"use client"
import React, { useState, useEffect, useRef } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

type DropdownProps = {
    // Define onSelect as a function that takes a string as a parameter
    onSelect: (option: string) => void,
    category: string,
    options : string[] | undefined
    showFirstOption?: boolean // optional
    hideCategoryAsPrefix?: boolean // optional
}

export default function DropDown( props : DropdownProps ) {
    // if props.options is null, options = ["No courses Found"]
    const category = props.category
    const hideCategoryAsPrefix = props.hideCategoryAsPrefix;
    const options = (props.options && props.options.length > 0) ? props.options : [`No ${category} Found`]

    const [selectedOption, setSelectedOption] = useState<string>(`Select ${category}`)
    const [position, setPosition] = useState("bottom");
    // To ensure that the latest state is used in our resize event handler, we can use useRef to keep track of the current values
    const selectedOptionRef = useRef(selectedOption)

    // Update ref whenever selectedOption changes
    useEffect(() => {
        if (options.length > 0 && props.showFirstOption !== false) {
            // if options not empty, set selected to first option in options array
            setSelectedOption(`${category}: ${options[0]}`);
            setPosition(options[0]);
        }
    }, [options, category])

    useEffect(() => {
        selectedOptionRef.current = selectedOption
    }, [selectedOption])

    function selectionHandler(option: string) {
        props.onSelect(option)
        {!hideCategoryAsPrefix ? (
            setSelectedOption(`${category}: ${option.toUpperCase()}`)
        ) : (
            setSelectedOption(`${option.toUpperCase()}`)
        )}
    }    

    return (
        <div className="inline-block m-1">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">{selectedOption}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>{category}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                    {options.map((option, index) => (
                        <DropdownMenuRadioItem value={option} key={index + 1} onClick={() => selectionHandler(option)}>
                            {(options[0] !== `No ${category} Found`)? option.toUpperCase() : option}
                        </DropdownMenuRadioItem>
                    ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
