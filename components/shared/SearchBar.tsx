"use client";

import { forwardRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
  onClear?: () => void;
  showShortcut?: boolean;
};

/**
 * Shared SearchBar component used consistently across header, views, and sections.
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      containerClassName,
      placeholder = "Search medicines, doctors, symptoms...",
      value,
      onChange,
      onClear,
      showShortcut = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState("");
    const isControlled = value !== undefined;
    const currentValue = isControlled ? String(value) : internalValue;

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue("");
      }
      onClear?.();
    };

    return (
      <div
        className={cn(
          "relative flex items-center w-full transition-all duration-300",
          containerClassName
        )}
      >
        <Search
          aria-hidden="true"
          className="absolute left-3.5 size-4 text-muted-ink pointer-events-none transition-colors"
          strokeWidth={1.8}
        />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => {
            if (!isControlled) setInternalValue(e.target.value);
            onChange?.(e);
          }}
          placeholder={placeholder}
          className={cn(
            "h-10 w-full rounded-full border border-line bg-white/80 backdrop-blur-sm pl-9.5 pr-9 text-[0.84rem] text-ink placeholder:text-muted-ink outline-none transition-all duration-300 shadow-xs",
            "hover:border-line hover:bg-white focus:border-forest focus:bg-white focus:ring-2 focus:ring-forest/15",
            className
          )}
          {...props}
        />
        {currentValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 size-5 rounded-full grid place-items-center text-muted-ink hover:text-ink hover:bg-black/5 transition-all"
          >
            <X className="size-3.5" />
          </button>
        )}
        {showShortcut && !currentValue && (
          <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 rounded border border-line bg-muted/20 px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-ink pointer-events-none">
            ⌘K
          </kbd>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
