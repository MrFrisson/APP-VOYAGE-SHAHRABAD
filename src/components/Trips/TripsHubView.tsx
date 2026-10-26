import React from 'react';
import { Trip, Step } from '../../types/travel';
import { formatMoney } from '../../services/currency';
import {
  Compass,
  Plus,
  Calendar,
  DollarSign,
  Copy,
  Trash2,
  Edit2,
  CheckCircle2,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface TripsHubViewProps {
  trips: Trip[];
  activeTripId?: string;
  allSteps: Step[];
  displayCurrency: string;
  onSelectTrip: (tripId: string) => void;
  onOpenNewTripModal: () => void;
  onEditTrip: (trip: Trip) => void;
  onDuplicateTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const TripsHubView: React.FC<TripsHubViewProps> = ({
  trips,
  activeTripId,
  allSteps,
  displayCurrency,
  onSelectTrip,
  onOpenNewTripModal,
  onEditTrip,
  onDuplicateTrip,
  onDeleteTrip,
}) => {
  const formatDateRange = (start: string, end: string) => {
    try {
      const s = new Date(start + 'T00:00:00');
      const e = new Date(end + 'T00:00:00');
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${start} ➔ ${end}`;
      return `${s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — ${e.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } catch {
      return `${start} ➔ ${end}`;
    }
  };

  const getTripStatus = (start: string, end: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (today < start) return { label: 'À venir', color: 'text-[#c6a56a] bg-[rgba(198,165,106,0.15)] border-[rgba(198,165,106,0.3)]' };
    if (today > end) return { label: 'Terminé', color: 'text-[#98a2a8] bg-[#151d26] border-[#222f3d]' };
    return { label: 'En cours', color: 'text-[#79b59b] bg-[#79b59b]/15 border-[#79b59b]/30' };
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111820]/90 rounded-2xl border border-[rgba(198,165,106,0.25)] shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#c6a56a]" />
            <h2 className="text-xl font-serif font-bold text-[#edf0eb]">
              Mes Voyages & Carnets de Route
            </h2>
          </div>
          <p className="text-xs text-[#98a2a8] mt-1">
            {trips.length} voyage{trips.length > 1 ? 's' : ''} enregistré{trips.length > 1 ? 's' : ''} · Gérez, sélectionnez ou créez vos périples librement.
          </p>
        </div>

        <button
          onClick={onOpenNewTripModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] font-bold text-xs hover:brightness-110 shadow-lg shadow-[rgba(198,165,106,0.2)] transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Créer un nouveau voyage</span>
        </button>
      </div>

      {/* Trips Grid or Empty State */}
      {trips.length === 0 ? (
        <div className="p-12 text-center bg-[#111820]/80 rounded-2xl border border-dashed border-[rgba(198,165,106,0.3)] max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] flex items-center justify-center mx-auto text-3xl">
            🧭
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-[#edf0eb]">
              Aucun voyage pour le moment
            </h3>
            <p className="text-xs text-[#98a2a8] mt-1 max-w-md mx-auto">
              Votre carnet Shahrabad est vierge. Vous pouvez commencer dès maintenant en créant votre premier voyage vers n'importe quelle destination dans le monde.
            </p>
          </div>
          <button
            onClick={onOpenNewTripModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] font-bold text-xs hover:brightness-110 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Créer mon premier voyage</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((trip) => {
            const isActive = trip.id === activeTripId;
            const tripSteps = allSteps.filter((s) => s.tripId === trip.id);
            const status = getTripStatus(trip.startDate, trip.endDate);

            return (
              <div
                key={trip.id}
                className={`relative rounded-2xl overflow-hidden bg-[#111820] border transition-all flex flex-col justify-between group shadow-xl ${
                  isActive
                    ? 'border-[#c6a56a] ring-2 ring-[#c6a56a]/30 shadow-[0_8px_30px_rgba(198,165,106,0.15)]'
                    : 'border-[rgba(198,165,106,0.2)] hover:border-[rgba(198,165,106,0.45)]'
                }`}
              >
                {/* Trip Card Cover Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={trip.coverImage || '/src/assets/images/travel_china_hero_1792423188699.jpg'}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111820] via-[#111820]/40 to-black/30" />

                  {/* Status Badge & Active Pill */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${status.color}`}
                    >
                      {status.label}
                    </span>

                    {isActive && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#c6a56a] text-[#0b0f14] shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Actif</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Destinations Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[11px] uppercase tracking-wider text-[#c6a56a] font-bold drop-shadow">
                      {trip.countries.join(' · ')}
                    </p>
                    <h3 className="text-lg font-serif font-bold text-[#edf0eb] truncate drop-shadow-md">
                      {trip.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Dates & Quick Stats */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#98a2a8]">
                      <Calendar className="w-3.5 h-3.5 text-[#c6a56a]" />
                      <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#98a2a8] pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#c6a56a]" />
                        <span>{tripSteps.length} étape{tripSteps.length > 1 ? 's' : ''}</span>
                      </span>

                      <span className="flex items-center gap-1 text-[#edf0eb] font-mono font-semibold">
                        <DollarSign className="w-3.5 h-3.5 text-[#c6a56a]" />
                        <span>Budget : {formatMoney(trip.totalBudget, displayCurrency)}</span>
                      </span>
                    </div>

                    {trip.description && (
                      <p className="text-[11px] text-[#657079] line-clamp-2 pt-1 border-t border-[rgba(198,165,106,0.1)]">
                        {trip.description}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-[rgba(198,165,106,0.15)] flex items-center justify-between gap-2">
                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTrip(trip)}
                        title="Modifier ce voyage"
                        className="p-1.5 rounded-lg text-[#98a2a8] hover:text-[#edf0eb] hover:bg-[#0b0f14] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDuplicateTrip(trip)}
                        title="Dupliquer ce voyage"
                        className="p-1.5 rounded-lg text-[#98a2a8] hover:text-[#c6a56a] hover:bg-[#0b0f14] transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTrip(trip.id)}
                        title="Supprimer ce voyage"
                        className="p-1.5 rounded-lg text-[#98a2a8] hover:text-[#b84f4b] hover:bg-[#b84f4b]/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Primary Switch / Open Button */}
                    <button
                      onClick={() => onSelectTrip(trip.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#151d26] text-[#c6a56a] border border-[#c6a56a]/30'
                          : 'bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] hover:brightness-110 shadow-sm'
                      }`}
                    >
                      <span>{isActive ? 'Voyage actif' : 'Ouvrir'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
