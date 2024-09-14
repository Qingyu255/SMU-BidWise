"use client"
import React, {useEffect} from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type comboboxProps = {
    category: string,
    options : string[] | undefined,
    selectedValue: string,
    onSelect: (option: string) => void,
    // showFirstOption?: boolean // optional
    // hideCategoryAsPrefix?: boolean // optional
}

export function Combobox({category, options, selectedValue, onSelect}: comboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(selectedValue)

  useEffect(() => {
    setValue(selectedValue);
  }, [selectedValue]);

  return (
    <div className="m-1">
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between overflow-hidden"
            >
            {value
                ? options?.find((option) => option === value)
                : "Select " + category}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
            <Command>
            <CommandInput placeholder={"Search " + category + "..."} />
            <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                    <CommandItem
                        // value={""}
                        className="text-gray-400 hover:underline hover:text-gray-500"
                        onSelect={(option) => {
                            onSelect("");
                            setValue("");
                            setOpen(false);
                        }}
                    >
                    Clear
                    </CommandItem>
                {options?.map((option) => (
                    <CommandItem
                    key={option}
                    value={option}
                    onSelect={(option) => {
                        onSelect(option);
                        setValue(option);
                        setOpen(false);
                    }}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {option}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
            </Command>
        </PopoverContent>
        </Popover>
    </div>
  )
}
