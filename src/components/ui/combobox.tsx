"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  value = "",
  onValueChange,
  options,
  placeholder = "Select or type...",
  searchPlaceholder = "Search or type...",
  emptyText = "No options found.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;

    const search = inputValue.toLowerCase();

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(search) ||
        option.value.toLowerCase().includes(search),
    );
  }, [options, inputValue]);

  const selectValue = (newValue: string) => {
    setInputValue(newValue);
    onValueChange?.(newValue);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setInputValue(newValue);
    onValueChange?.(newValue);
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // Allow arbitrary values.
      if (inputValue.trim()) {
        selectValue(inputValue);
      }
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex h-9 w-full items-center rounded-md border border-input bg-transparent shadow-sm",
          "focus-within:ring-1 focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <input
          ref={inputRef}
          value={inputValue}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-full w-full bg-transparent px-3 py-2 text-sm outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed",
          )}
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            setOpen((current) => !current);
            inputRef.current?.focus();
          }}
          className="flex h-full items-center px-2 text-muted-foreground"
        >
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </div>

      {open && !disabled && (
        <>
          <div
            className="fixed inset-0 z-40"
            onMouseDown={() => setOpen(false)}
          />

          <div
            className={cn(
              "absolute left-0 bottom-full z-50 mt-1 w-full",
              "max-h-60 overflow-auto rounded-md border",
              "bg-popover text-popover-foreground shadow-md",
              "p-1",
            )}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectValue(option.value)}
                    className={cn(
                      "relative flex w-full cursor-default select-none",
                      "items-center rounded-sm py-1.5 pl-2 pr-8",
                      "text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      selected && "bg-accent/50",
                    )}
                  >
                    <span>{option.label}</span>

                    {selected && (
                      <Check className="absolute right-2 h-4 w-4" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                {inputValue ? (
                  <>
                    <div className="mb-1">No matching options.</div>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectValue(inputValue)}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      Use "{inputValue}"
                    </button>
                  </>
                ) : (
                  emptyText
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}