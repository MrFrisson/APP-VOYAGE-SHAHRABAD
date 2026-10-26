import React from 'react';
import { Trip } from '../../types/travel';
import { Globe, Plus, Check } from 'lucide-react';

interface TripGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  activeTripId: string;
  onSelectTrip: (tripId: string) => void;
  onOpenNewTripModal: () => void;
}

export const TripGalleryModal: React.FC<TripGalleryModalProps> = ({
  isOpen,
  onClose,
  trips,
  activeTripId,
  onSelectTrip,
  onOpenNewTripModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-serif font-bold text-slate-100">
              Tous vos Voyages ({trips.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trips.map((trip) => {
            const isActive = trip.id === activeTripId;

            return (
              <div
                key={trip.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all bg-slate-950 ${
                  isActive
                    ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-xl shadow-amber-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={trip.coverImage || '/src/assets/images/travel_china_hero_1792423188699.jpg'}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <span className="absolute bottom-2 left-3 text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {trip.countries.join(', ')}
                  </span>
                  {isActive && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-slate-950 bg-amber-400 px-2 py-0.5 rounded-full shadow">
                      <Check className="w-3 h-3 stroke-[3]" /> Actif
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-serif font-bold text-slate-100 line-clamp-1">
                      {trip.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {trip.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Budget : {trip.totalBudget?.toLocaleString('fr-FR')} {trip.currency}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTrip(trip.id);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isActive ? 'Sélectionné' : 'Ouvrir'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenNewTripModal();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un nouveau voyage</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
