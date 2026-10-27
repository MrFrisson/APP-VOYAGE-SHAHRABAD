import React from 'react';
import { Trip, Step } from '../../types/travel';
import { formatMoney, convertCurrency } from '../../services/currency';
import {
  Calendar,
  Compass,
  Edit2,
  Copy,
  Trash2,
  Coins,
  Share2,
} from 'lucide-react';

interface TripHeroBannerProps {
  trip: Trip;
  steps: Step[];
  tripsCount: number;
  displayCurrency: string;
  onEditTrip: () => void;
  onDuplicateTrip: () => void;
  onDeleteTrip: () => void;
  onSelectOtherTrip: () => void;
  onShareTrip?: () => void;
}

export const TripHeroBanner: React.FC<TripHeroBannerProps> = ({
  trip,
  steps,
  tripsCount,
  displayCurrency,
  onEditTrip,
  onDuplicateTrip,
  onDeleteTrip,
  onSelectOtherTrip,
  onShareTrip,
}) => {

  const startDateFormatted = trip.startDate
    ? new Date(trip.startDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      })
    : '';
  const endDateFormatted = trip.endDate
    ? new Date(trip.endDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const totalNights = steps.reduce((sum, s) => sum + s.nights, 0);

  // Convert budget to displayCurrency
  const convertedBudget = convertCurrency(trip.totalBudget, trip.currency, displayCurrency);

  return (
    <div className="relative rounded-[28px] overflow-hidden border border-[rgba(198,165,106,0.25)] shadow-[0_22px_70px_rgba(0,0,0,0.4)] bg-[#0b0f14] mb-8">
      {/* Background Cover Image with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={trip.coverImage || '/src/assets/images/travel_china_hero_1792423188699.jpg'}
          alt={trip.title}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        {/* Measured dark gradient scrim for 4.5:1 text contrast matching Shahrabad palette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f14]/95 via-[#0b0f14]/65 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-4 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[260px] sm:min-h-[310px]">
        {/* Top Badges & Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#eadcc0] bg-[rgba(21,29,38,0.85)] backdrop-blur-md px-3 py-1.5 rounded-full border border-[rgba(198,165,106,0.35)] flex items-center gap-1.5 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-[#c6a56a]" />
              <span className="truncate max-w-[200px]">{trip.countries.join(' · ')}</span>
            </span>

            <button
              type="button"
              onClick={onSelectOtherTrip}
              className="text-xs text-[#98a2a8] hover:text-[#edf0eb] bg-[rgba(17,24,32,0.8)] hover:bg-[#17212b] backdrop-blur-md px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.09)] transition-colors font-mono cursor-pointer"
            >
              Tous mes voyages ({tripsCount})
            </button>
          </div>

          {/* Action buttons (Share, Edit, Duplicate, Delete) */}
          <div className="flex items-center gap-1 bg-[rgba(11,15,20,0.85)] backdrop-blur-md p-1 rounded-full border border-[rgba(198,165,106,0.22)] shrink-0">
            {onShareTrip && (
              <button
                onClick={onShareTrip}
                title="Partager ce voyage"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#eadcc0] hover:text-[#c6a56a] hover:bg-[#17212b] rounded-full transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#c6a56a]" />
                <span className="hidden sm:inline font-medium">Partager</span>
              </button>
            )}
            <button
              onClick={onEditTrip}
              title="Modifier ce voyage"
              className="p-1.5 sm:p-2 text-[#98a2a8] hover:text-[#c6a56a] hover:bg-[#17212b] rounded-full transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDuplicateTrip}
              title="Dupliquer ce voyage"
              className="p-1.5 sm:p-2 text-[#98a2a8] hover:text-[#c6a56a] hover:bg-[#17212b] rounded-full transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDeleteTrip}
              title="Supprimer ce voyage"
              className="p-1.5 sm:p-2 text-[#b84f4b] hover:text-[#d4635d] hover:bg-[rgba(184,79,75,0.2)] rounded-full transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title, Description & Key Metrics */}
        <div className="mt-5 sm:mt-8 space-y-2.5 max-w-3xl">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-serif font-black text-[#edf0eb] tracking-tight leading-snug break-words">
            {trip.title}
          </h1>

          {trip.description && (
            <p className="text-xs sm:text-sm text-[#c4cbc7] leading-relaxed max-w-2xl font-light line-clamp-3 sm:line-clamp-none">
              {trip.description}
            </p>
          )}

          {/* KPI Strip */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#edf0eb]">
            <div className="flex items-center gap-2 bg-[rgba(21,29,38,0.88)] backdrop-blur-md px-3.5 py-2 rounded-xl border border-[rgba(198,165,106,0.2)]">
              <Calendar className="w-4 h-4 text-[#c6a56a]" />
              <span>
                {startDateFormatted} ➔ {endDateFormatted}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[rgba(21,29,38,0.88)] backdrop-blur-md px-3.5 py-2 rounded-xl border border-[rgba(198,165,106,0.2)]">
              <Compass className="w-4 h-4 text-[#c6a56a]" />
              <span>
                {steps.length} étape{steps.length > 1 ? 's' : ''} ({totalNights} nuits)
              </span>
            </div>

            {/* Budget Card (Display only, no Modifier button) */}
            <div className="flex items-center gap-2 bg-[rgba(21,29,38,0.88)] backdrop-blur-md px-3.5 py-2 rounded-xl border border-[rgba(198,165,106,0.35)] shadow-sm">
              <Coins className="w-4 h-4 text-[#c6a56a]" />
              <span>
                Budget :{' '}
                <strong className="text-[#eadcc0] font-bold text-sm">
                  {formatMoney(convertedBudget, displayCurrency)}
                </strong>
                {trip.currency !== displayCurrency && (
                  <span className="text-[10px] text-[#98a2a8] ml-1 font-mono">
                    (orig. {formatMoney(trip.totalBudget, trip.currency)})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
