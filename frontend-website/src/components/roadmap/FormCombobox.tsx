import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxProps = {
  category: string;
  options: ComboboxOption[] | undefined;
  selectedValue: string;
  onSelect: (option: string) => void;
  clearOptionText?: string;
};

export function FormCombobox({
  category,
  options,
  selectedValue,
  onSelect,
  clearOptionText,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Find the label corresponding to the selected value
  const selectedOption = options?.find((option) => option.value === selectedValue);

  return (
    <div className="ml-0 m-1 mr-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between overflow-hidden"
          >
            {selectedOption ? selectedOption.label : `Select ${category}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${category}...`} />
            <CommandList>
              <CommandEmpty>No {category.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  className="text-gray-400 hover:underline hover:text-gray-500"
                  onSelect={() => {
                    onSelect("");
                    setOpen(false);
                  }}
                >
                  {clearOptionText ? clearOptionText : "Clear"}
                </CommandItem>
                {options?.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} // Updated line
                    onSelect={() => {
                      onSelect(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}