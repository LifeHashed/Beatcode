'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options?: Option[];
  selected?: string[];
  values?: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  creatable?: boolean;
}

export function MultiSelect({
  options = [],
  selected,
  values,
  onChange,
  placeholder = 'Select items...',
  className,
  creatable = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  
  // Support both 'selected' and 'values' props for compatibility
  const currentValues = selected || values || [];
  
  // Convert string array to options if needed
  const normalizedOptions = React.useMemo(() => {
    if (options.length === 0 && currentValues.length > 0) {
      return currentValues.map(value => ({ label: value, value }));
    }
    return options;
  }, [options, currentValues]);

  const handleUnselect = (value: string) => {
    onChange(currentValues.filter((item) => item !== value));
  };

  const handleSelect = (value: string) => {
    if (currentValues.includes(value)) {
      handleUnselect(value);
    } else {
      onChange([...currentValues, value]);
    }
    setSearchValue('');
  };

  const handleCreateNew = () => {
    if (searchValue && !currentValues.includes(searchValue) && creatable) {
      onChange([...currentValues, searchValue]);
      setSearchValue('');
    }
  };

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return normalizedOptions;
    return normalizedOptions.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [normalizedOptions, searchValue]);

  const showCreateOption = creatable && 
    searchValue && 
    !normalizedOptions.some(option => option.value.toLowerCase() === searchValue.toLowerCase()) &&
    !currentValues.includes(searchValue);

  return (
    <div className={cn('w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            <div className="flex gap-1 flex-wrap">
              {currentValues.length > 0 ? (
                currentValues.map((value) => {
                  const option = normalizedOptions.find((opt) => opt.value === value);
                  return (
                    <Badge
                      variant="secondary"
                      key={value}
                      className="mr-1 mb-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(value);
                      }}
                    >
                      {option?.label || value}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUnselect(value);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUnselect(value);
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  );
                })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Search..." 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <CommandEmpty>
              {showCreateOption ? (
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleCreateNew}
                  >
                    Create "{searchValue}"
                  </Button>
                </div>
              ) : (
                "No options found."
              )}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentValues.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
