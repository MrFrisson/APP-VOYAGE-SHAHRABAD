import React, { useState } from 'react';
import { Step, Activity, Accommodation, Transport } from '../../types/travel';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Building2,
  Plane,
  Ticket,
  Plus,
} from 'lucide-react';

interface CalendarViewProps {
  tripStartDate: string;
  tripEndDate: string;
  steps: Step[];
  activities: Activity[];
  accommodations: Accommodation[];
  transports: Transport[];
  onAddActivityForDate?: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tripStartDate,
  tripEndDate,
  steps,
  activities,
  accommodations,
  transports,
  onAddActivityForDate,
}) => {
  // Initialize current view month to trip start date or today
  const initialDate = tripStartDate ? new Date(tripStartDate) : new Date();
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState<number>(
    isNaN(initialDate.getMonth()) ? 9 : initialDate.getMonth()
  );
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    tripStartDate || new Date().toISOString().slice(0, 10)
  );

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Month metadata
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // In JS, Sunday is 0. In European standard, Monday is 0.
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const weekDayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Identify day's step
  const getStepForDate = (dateStr: string): Step | undefined => {
    return steps.find((s) => dateStr >= s.arrivalDate && dateStr <= s.departureDate);
  };

  // Identify day's activities
  const getActivitiesForDate = (dateStr: string): Activity[] => {
    return activities.filter((a) => a.date === dateStr);
  };

  // Identify day's accommodations
  const getAccommodationsForDate = (dateStr: string): Accommodation[] => {
    return accommodations.filter((h) => dateStr >= h.checkIn && dateStr <= h.checkOut);
  };

  // Identify day's transports
  const getTransportsForDate = (dateStr: string): Transport[] => {
    return transports.filter((t) => {
      const depDate = t.departureDateTime ? t.departureDateTime.slice(0, 10) : '';
      const arrDate = t.arrivalDateTime ? t.arrivalDateTime.slice(0, 10) : '';
      return depDate === dateStr || arrDate === dateStr;
    });
  };

  const selectedStep = getStepForDate(selectedDateStr);
  const selectedActs = getActivitiesForDate(selectedDateStr);
  const selectedHotels = getAccommodationsForDate(selectedDateStr);
  const selectedTransports = getTransportsForDate(selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-serif font-bold text-slate-100">
              Calendrier Dynamique du Voyage
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>
              Du {tripStartDate ? new Date(tripStartDate).toLocaleDateString('fr-FR') : '...'} au{' '}
              {tripEndDate ? new Date(tripEndDate).toLocaleDateString('fr-FR') : '...'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-medium">Repérage des jours libres & planifiés</span>
          </div>
        </div>

        {/* Month Navigator Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-100 px-3 min-w-[120px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Day Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on lg) */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-slate-400">
            {weekDayLabels.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-slate-950/20 opacity-40" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isTripDay = tripStartDate && tripEndDate && dateStr >= tripStartDate && dateStr <= tripEndDate;
              const step = getStepForDate(dateStr);
              const acts = getActivitiesForDate(dateStr);
              const hotels = getAccommodationsForDate(dateStr);
              const trans = getTransportsForDate(dateStr);
              const isSelected = selectedDateStr === dateStr;
              const hasEvents = acts.length > 0 || hotels.length > 0 || trans.length > 0;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl text-left border flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-950/50 ring-1 ring-amber-400'
                      : isTripDay
                      ? 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/80'
                      : 'border-slate-900/60 bg-slate-950/40 text-slate-600 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isSelected
                          ? 'text-amber-300'
                          : isTripDay
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {step && (
                      <span className="text-xs" title={`${step.destination} (${step.country})`}>
                        {step.emoji || '🏮'}
                      </span>
                    )}
                  </div>

                  {/* Day Content Badges / Indicators */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {hotels.length > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                        title="Hôtel prévu"
                      />
                    )}
                    {acts.length > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                        title={`${acts.length} activité(s)`}
                      />
                    )}
                    {trans.length > 0 && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-rose-400"
                        title="Déplacement"
                      />
                    )}
                    {isTripDay && !hasEvents && (
                      <span className="text-[9px] text-amber-400/60 font-medium hidden sm:inline">
                        Libre
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span>Hébergements</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Activités</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Transports</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400/80 font-medium">Libre</span>
              <span>Journée sans activité programmée</span>
            </span>
          </div>
        </div>

        {/* Selected Day Inspector Panel */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Fiche de la journée
              </span>
              <h3 className="text-lg font-serif font-bold text-slate-100 capitalize mt-0.5">
                {new Date(selectedDateStr).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              {selectedStep && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    Étape : {selectedStep.destination} ({selectedStep.country})
                  </span>
                </div>
              )}
            </div>

            {/* List of items on this day */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {/* Accommodations */}
              {selectedHotels.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs"
                >
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hôtel · {h.city}</span>
                  </div>
                  <h4 className="font-bold text-slate-200">{h.name}</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">{h.address}</p>
                </div>
              ))}

              {/* Transports */}
              {selectedTransports.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs"
                >
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
                    <Plane className="w-3.5 h-3.5" />
                    <span>Déplacement · {t.type}</span>
                  </div>
                  <h4 className="font-bold text-slate-200">
                    {t.departurePlace} ➔ {t.arrivalPlace}
                  </h4>
                  {t.carrier && (
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {t.carrier} {t.transportNumber}
                    </p>
                  )}
                </div>
              ))}

              {/* Activities */}
              {selectedActs.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs"
                >
                  <div className="flex items-center justify-between text-emerald-400 font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{act.category}</span>
                    </span>
                    {act.time && (
                      <span className="flex items-center gap-1 text-slate-300 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {act.time}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-200">{act.name}</h4>
                  {act.description && (
                    <p className="text-slate-400 text-[11px] mt-1 italic">{act.description}</p>
                  )}
                </div>
              ))}

              {selectedHotels.length === 0 &&
                selectedTransports.length === 0 &&
                selectedActs.length === 0 && (
                  <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
                    Journée entièrement libre. Parfaite pour flâner, se reposer ou improviser des découvertes au gré de vos envies.
                  </div>
                )}
            </div>
          </div>

          {/* Quick Add Button */}
          {onAddActivityForDate && (
            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => onAddActivityForDate(selectedDateStr)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Programmer une activité pour ce jour</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
