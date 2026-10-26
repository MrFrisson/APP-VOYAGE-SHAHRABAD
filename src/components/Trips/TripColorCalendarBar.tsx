import React from 'react';
import { Step } from '../../types/travel';
import { getStepColor } from '../../data/worldDestinations';
import { Calendar, Moon, MapPin } from 'lucide-react';

interface TripColorCalendarBarProps {
  steps: Step[];
  tripStartDate?: string;
  tripEndDate?: string;
  onSelectStep?: (stepId: string) => void;
}

export const TripColorCalendarBar: React.FC<TripColorCalendarBarProps> = ({
  steps,
  tripStartDate,
  tripEndDate,
  onSelectStep,
}) => {
  if (!steps || steps.length === 0) return null;

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const totalNights = sortedSteps.reduce((acc, s) => acc + (s.nights || 0), 0);

  const formatDateShort = (dStr: string) => {
    if (!dStr) return '';
    const d = new Date(dStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-[#111820]/90 border border-[rgba(198,165,106,0.22)] rounded-2xl p-4 shadow-lg backdrop-blur-md">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#c6a56a]" />
          <h4 className="text-xs font-serif font-bold text-[#edf0eb] uppercase tracking-wider">
            Chronologie du Voyage par Destination
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#98a2a8]">
          {tripStartDate && tripEndDate && (
            <span className="font-mono text-[#eadcc0]">
              {formatDateShort(tripStartDate)} ➔ {formatDateShort(tripEndDate)}
            </span>
          )}
          <span>·</span>
          <span className="flex items-center gap-1 text-[#c6a56a] font-medium">
            <Moon className="w-3 h-3" />
            {totalNights} nuits
          </span>
        </div>
      </div>

      {/* Visual Colored Timeline Bar */}
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-[#0b0f14] p-0.5 border border-[rgba(198,165,106,0.2)] mb-3">
        {sortedSteps.map((step, idx) => {
          const color = getStepColor(idx);
          const flexWeight = Math.max(1, step.nights || 1);
          return (
            <div
              key={step.id}
              style={{
                flex: flexWeight,
                backgroundColor: color.bg,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all hover:brightness-125 cursor-pointer relative group"
              title={`${step.destination} (${step.nights} nuits)`}
              onClick={() => onSelectStep?.(step.id)}
            />
          );
        })}
      </div>

      {/* Step Badges with Destination Colors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {sortedSteps.map((step, idx) => {
          const color = getStepColor(idx);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep?.(step.id)}
              className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-xl border transition-all hover:scale-102 text-left cursor-pointer"
              style={{
                backgroundColor: '#0b0f14',
                borderColor: `${color.bg}40`,
              }}
            >
              {/* Color dot */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: color.bg }}
              />
              <span className="text-xs font-bold text-[#edf0eb] whitespace-nowrap">
                {step.emoji || '📍'} {step.destination}
              </span>
              <span className="text-[10px] text-[#98a2a8] font-mono whitespace-nowrap bg-[#151d26] px-1.5 py-0.5 rounded">
                {formatDateShort(step.arrivalDate)} - {formatDateShort(step.departureDate)}
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: `${color.bg}25`, color: color.bg }}
              >
                {step.nights}n
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
