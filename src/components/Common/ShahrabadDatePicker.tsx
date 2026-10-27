import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ShahrabadDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  min?: string;
  max?: string;
  defaultMonthDate?: string; // Target date (e.g. departure date) to adapt view month when value is empty
  align?: 'left' | 'right' | 'auto';
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEKDAYS_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

export const ShahrabadDatePicker: React.FC<ShahrabadDatePickerProps> = ({
  value,
  onChange,
  label,
  min,
  max,
  defaultMonthDate,
  align = 'auto',
  className = '',
  placeholder = 'Choisir une date',
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ left: 0, width: 280 });

  // Helper to parse date
  const getYearMonth = (dateStr?: string) => {
    if (dateStr) {
      const d = new Date(dateStr + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        return { year: d.getFullYear(), month: d.getMonth() };
      }
    }
    return null;
  };

  // Determine initial view date based on value, then defaultMonthDate, then min, then today
  const initial =
    getYearMonth(value) ||
    getYearMonth(defaultMonthDate) ||
    getYearMonth(min) || {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
    };

  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  // When value changes externally
  useEffect(() => {
    if (value) {
      const target = getYearMonth(value);
      if (target) {
        setViewYear(target.year);
        setViewMonth(target.month);
      }
    }
  }, [value]);

  // When min or defaultMonthDate adapts (e.g. user selected departure date = 5 November)
  useEffect(() => {
    if (min) {
      // If current value is before min, auto-adjust to min
      if (value && value < min) {
        onChange(min);
      }
      // If no value is selected yet, adapt view directly to min/departure month
      if (!value) {
        const target = getYearMonth(defaultMonthDate) || getYearMonth(min);
        if (target) {
          setViewYear(target.year);
          setViewMonth(target.month);
        }
      }
    }
  }, [min, defaultMonthDate]);

  // Dynamically calculate position to prevent being cut off on left or right
  const updatePopoverPosition = () => {
    if (!containerRef.current) return;
    const triggerRect = containerRef.current.getBoundingClientRect();

    // Look for parent dialog, form, or viewport
    const modalParent = containerRef.current.closest('form, [role="dialog"], .max-w-xl, .max-w-lg, .max-w-md, main');
    const bounds = modalParent
      ? modalParent.getBoundingClientRect()
      : { left: 12, right: window.innerWidth - 12 };

    const popoverWidth = Math.min(285, window.innerWidth - 24);

    // Desired horizontal position:
    // If align is 'right' or trigger is in the right half of the container:
    const isRightAligned =
      align === 'right' ||
      (align === 'auto' && triggerRect.left > bounds.left + (bounds.right - bounds.left) * 0.45);

    let desiredScreenLeft = isRightAligned
      ? triggerRect.right - popoverWidth
      : triggerRect.left;

    // Strict clamping within visible bounds:
    // It can NEVER be cut off on the left (>= bounds.left + 8) or on the right (<= bounds.right - popoverWidth - 8)
    const minAllowedLeft = bounds.left + 8;
    const maxAllowedLeft = bounds.right - popoverWidth - 8;

    const clampedScreenLeft = Math.max(minAllowedLeft, Math.min(desiredScreenLeft, maxAllowedLeft));
    const relativeLeft = clampedScreenLeft - triggerRect.left;

    setPopoverStyle({
      left: `${relativeLeft}px`,
      width: `${popoverWidth}px`,
    });
  };

  // When opening: adapt month to departure date if empty, and calculate non-clipping position
  useLayoutEffect(() => {
    if (isOpen) {
      // If no value is chosen yet, open directly on min/departure month!
      if (!value) {
        const target = getYearMonth(defaultMonthDate) || getYearMonth(min);
        if (target) {
          setViewYear(target.year);
          setViewMonth(target.month);
        }
      }
      updatePopoverPosition();
    }
  }, [isOpen]);

  // Handle window resize or scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updatePopoverPosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calendar math
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Monday is 0 in France (0: Lun, ..., 6: Dim)
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const formatDisplay = (val: string) => {
    if (!val) return '';
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isDaySelected = (day: number) => {
    if (!value) return false;
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return formatted === value;
  };

  const isDayDisabled = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (min && formatted < min) return true;
    if (max && formatted > max) return true;
    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const baseYear = new Date().getFullYear();
  const yearOptions = Array.from(
    new Set([
      ...Array.from({ length: 10 }, (_, i) => baseYear - 1 + i),
      viewYear,
    ])
  ).sort((a, b) => a - b);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
          {label} {required && <span className="text-[#b84f4b]">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs transition-all text-left cursor-pointer ${
          isOpen
            ? 'border-[#c6a56a] bg-[rgba(198,165,106,0.12)] text-[#eadcc0] shadow-[0_0_12px_rgba(198,165,106,0.2)]'
            : value
            ? 'border-[rgba(198,165,106,0.25)] bg-[#0b0f14] text-[#edf0eb] hover:border-[#c6a56a]'
            : 'border-[rgba(198,165,106,0.2)] bg-[#0b0f14] text-[#657079] hover:border-[rgba(198,165,106,0.4)]'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-[#c6a56a] shrink-0" />
          <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
        </div>
        <span className="text-[10px] text-[#98a2a8] font-mono shrink-0">
          {value || 'AAAA-MM-JJ'}
        </span>
      </button>

      {/* Popover Calendar with Anti-Clipping Positioning */}
      {isOpen && (
        <div
          style={popoverStyle}
          className="absolute z-50 mt-1.5 p-3 rounded-2xl bg-[#111820] border border-[rgba(198,165,106,0.35)] shadow-2xl backdrop-blur-md animate-fadeIn"
        >
          {/* Header with Month/Year Navigation */}
          <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-[rgba(198,165,106,0.15)]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-[#98a2a8] hover:text-[#c6a56a] hover:bg-[#0b0f14] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#edf0eb]">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-[#0b0f14] border border-[rgba(198,165,106,0.2)] text-[#eadcc0] text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                {MONTHS_FR.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-[#0b0f14] border border-[rgba(198,165,106,0.2)] text-[#eadcc0] text-xs rounded-lg px-1.5 py-1 focus:outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-[#98a2a8] hover:text-[#c6a56a] hover:bg-[#0b0f14] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-semibold text-[#98a2a8]">
            {WEEKDAYS_FR.map((wd) => (
              <div key={wd} className="py-0.5">
                {wd}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank leading days */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`blank-${i}`} className="h-7 w-7" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isDaySelected(day);
              const disabled = isDayDisabled(day);
              const today = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
                    disabled
                      ? 'opacity-20 cursor-not-allowed text-[#657079]'
                      : selected
                      ? 'bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] font-bold shadow-md shadow-[rgba(198,165,106,0.3)]'
                      : today
                      ? 'border border-[#c6a56a] text-[#c6a56a] bg-[rgba(198,165,106,0.1)] hover:bg-[rgba(198,165,106,0.2)]'
                      : 'text-[#edf0eb] hover:bg-[#0b0f14] hover:text-[#eadcc0]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Clear / Today buttons */}
          <div className="mt-2.5 pt-2 border-t border-[rgba(198,165,106,0.15)] flex items-center justify-between text-[11px]">
            {(!min || new Date().toISOString().slice(0, 10) >= min) ? (
              <button
                type="button"
                onClick={() => {
                  const todayIso = new Date().toISOString().slice(0, 10);
                  onChange(todayIso);
                  setIsOpen(false);
                }}
                className="text-[#c6a56a] hover:underline cursor-pointer"
              >
                Aujourd'hui
              </button>
            ) : min ? (
              <button
                type="button"
                onClick={() => {
                  onChange(min);
                  setIsOpen(false);
                }}
                className="text-[#c6a56a] hover:underline cursor-pointer"
              >
                Date min ({formatDisplay(min)})
              </button>
            ) : null}

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-[#b84f4b] hover:underline flex items-center gap-1 cursor-pointer ml-auto"
              >
                <X className="w-3 h-3" />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
