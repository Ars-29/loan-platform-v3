'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon, { icons } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

type IconName = keyof typeof icons;

export interface SmartDropdownOption {
  value: string;
  label: string;
  icon?: IconName;
  description?: string;
}

export interface SmartDropdownProps {
  value: string | null;
  onChange: (value: string) => void;
  options: SmartDropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  activeOptionClassName?: string;
  renderValue?: (option: SmartDropdownOption | undefined) => React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  borderRadius?: number | string;
}

export default function SmartDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className,
  buttonClassName,
  menuClassName,
  optionClassName,
  activeOptionClassName,
  renderValue,
  onOpenChange,
  borderRadius,
}: SmartDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const resolvedBorderRadius =
    borderRadius === undefined || borderRadius === null
      ? '0.5rem'
      : typeof borderRadius === 'number'
        ? `${borderRadius}px`
        : borderRadius;

  const selectedOption = useMemo(
    () => options.find(option => option.value === value),
    [options, value]
  );

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      return;
    }

    const index = options.findIndex(option => option.value === value);
    setHighlightedIndex(index >= 0 ? index : 0);
  }, [isOpen, options, value]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const handleOptionSelect = useCallback(
    (option: SmartDropdownOption) => {
      if (disabled) return;
      onChange(option.value);
      setIsOpen(false);
    },
    [disabled, onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (!isOpen) {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev + 1;
          return next >= options.length ? 0 : next;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev - 1;
          return next < 0 ? options.length - 1 : next;
        });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const option = options[highlightedIndex];
        if (option) {
          handleOptionSelect(option);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
    },
    [disabled, handleOptionSelect, highlightedIndex, isOpen, options]
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          'flex w-full min-w-[220px] items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-[#01bcc6] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          buttonClassName
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        style={{ borderRadius: resolvedBorderRadius }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption && selectedOption.icon && (
            <Icon name={selectedOption.icon} className="h-4 w-4 text-[#01bcc6]" />
          )}
          <span className={cn('truncate', !selectedOption && 'text-gray-400 dark:text-gray-500')}>
            {renderValue ? renderValue(selectedOption) : selectedOption?.label || placeholder}
          </span>
        </div>
        <Icon
          name={isOpen ? 'chevronUp' : 'chevronDown'}
          className="h-4 w-4 text-gray-500 dark:text-gray-400"
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
            menuClassName
          )}
          role="listbox"
          style={{ borderRadius: resolvedBorderRadius }}
        >
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((option, index) => {
              const isActive = index === highlightedIndex;
              const isSelected = option.value === value;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      'mx-1 flex w-[calc(100%-0.5rem)] items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                      isActive && 'bg-[#01bcc6]/10 dark:bg-[#01bcc6]/20 text-[#005b7c] dark:text-[#01bcc6]',
                      isSelected && 'font-semibold text-[#005b7c] dark:text-[#01bcc6]',
                      optionClassName,
                      isActive && activeOptionClassName
                    )}
                    style={{ borderRadius: isSelected ? resolvedBorderRadius : '0.375rem' }}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.icon && (
                      <Icon
                        name={option.icon}
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isActive || isSelected ? 'text-[#005b7c] dark:text-[#01bcc6]' : 'text-gray-500 dark:text-gray-400'
                        )}
                      />
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-gray-900">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
