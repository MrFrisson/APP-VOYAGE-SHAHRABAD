import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ShahrabadDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  min?: string;
  max?: string;
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
  className = '',
  placeholder = 'Choisir une date',
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current date
  const parsedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialYear = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : new Date().getFullYear();
  const initialMonth = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getMonth() : new Date().getMonth();

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

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

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
          {label} {required && <span className="text-[#b84f4b]">*</span>}
        </label>
      )}

      {/* Custom Trigger Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs transition-all text-left cursor-pointer ${
          isOpen
            ? 'border-[#c6a56a] bg-[rgba(198,165,106,0.1)] text-[#eadcc0] shadow-[0_0_12px_rgba(198,165,106,0.2)]'
            : value
            ? 'border-[rgba(198,165,106,0.25)] bg-[#0b0f14] text-[#edf0eb] hover:border-[#c6a56a]'
            : 'border-[rgba(198,165,106,0.2)] bg-[#0b0f14] text-[#657079] hover:border-[rgba(198,165,106,0.4)]'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-[#c6a56a] shrink-0" />
          <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
        </div>
        <span className="text-[10px] text-[#98a2a8] font-mono shrink-0">
          {value || 'AAAA-MM-JJ'}
        </span>
      </button>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div className="absolute z-50 left-0 mt-1.5 w-72 sm:w-80 p-3.5 rounded-2xl bg-[#111820] border border-[rgba(198,165,106,0.35)] shadow-2xl backdrop-blur-md animate-fadeIn">
          {/* Calendar Header with Month/Year Navigation */}
          <div className="flex items-center justify-between gap-1 mb-3 pb-2 border-b border-[rgba(198,165,106,0.15)]">
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
                className="bg-[#0b0f14] border border-[rgba(198,165,106,0.2)] text-[#eadcc0] text-xs rounded-lg px-2 py-1 focus:outline-none"
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
                className="bg-[#0b0f14] border border-[rgba(198,165,106,0.2)] text-[#eadcc0] text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
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
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5 text-[11px] font-semibold text-[#98a2a8]">
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
              <div key={`blank-${i}`} className="h-8" />
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
                  className={`h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
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
          <div className="mt-3 pt-2 border-t border-[rgba(198,165,106,0.15)] flex items-center justify-between text-[11px]">
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
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-[#b84f4b] hover:underline flex items-center gap-1 cursor-pointer"
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
