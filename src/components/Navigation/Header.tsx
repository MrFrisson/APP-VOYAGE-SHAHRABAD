import React from 'react';
import { Plus, Database, ChevronDown, Share2 } from 'lucide-react';
import { Trip } from '../../types/travel';

export type ActiveTab =
  | 'itinerary'
  | 'map'
  | 'activities'
  | 'stays_transports'
  | 'budget'
  | 'converter'
  | 'documents';

interface HeaderProps {
  trips: Trip[];
  activeTrip: Trip;
  onSelectTrip: (tripId: string) => void;
  onOpenNewTripModal: () => void;
  onOpenTripsGallery: () => void;
  onOpenSyncModal: () => void;
  onShare?: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  trips,
  activeTrip,
  onSelectTrip,
  onOpenNewTripModal,
  onOpenTripsGallery,
  onOpenSyncModal,
  onShare,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0b0f14]/92 backdrop-blur-md border-b border-[rgba(198,165,106,0.22)] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
      {/* Zone 1: Brand wordmark from Shahrabad ("✦ Shahrabad — carnet de route") */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onOpenTripsGallery();
          }}
          className="flex items-center gap-2.5 text-decoration-none group cursor-pointer"
          title="Mes voyages & en ajouter un nouveau"
        >
          <span className="w-8 h-8 rounded-full border border-[#c6a56a] flex items-center justify-center text-[#c6a56a] text-sm group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(198,165,106,0.25)]">
            ✦
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-serif font-bold tracking-wider text-[#edf0eb] leading-tight group-hover:text-[#c6a56a] transition-colors">
              Shahrabad
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#98a2a8] uppercase">
              carnet de route
            </span>
          </div>
        </a>

        {/* Quick Trip Switcher dropdown */}
        <div className="relative group ml-2 hidden sm:block">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111820] hover:bg-[#17212b] border border-[rgba(198,165,106,0.25)] text-xs text-[#edf0eb] transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#79b59b] animate-pulse" />
            <span className="font-semibold text-[#eadcc0] truncate max-w-[160px]">
              {activeTrip.title}
            </span>
            <ChevronDown className="w-3 h-3 text-[#98a2a8]" />
          </button>

          <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#111820] border border-[rgba(198,165,106,0.3)] rounded-2xl shadow-2xl p-2 hidden group-hover:block hover:block z-50">
            <span className="block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#98a2a8]">
              Mes Voyages ({trips.length})
            </span>
            {trips.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTrip(t.id)}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  t.id === activeTrip.id
                    ? 'bg-[rgba(198,165,106,0.18)] text-[#eadcc0] font-bold border border-[rgba(198,165,106,0.3)]'
                    : 'text-[#edf0eb] hover:bg-[#17212b]'
                }`}
              >
                <span className="truncate">{t.title}</span>
                <span className="text-[10px] text-[#98a2a8] font-mono">{t.countries.join(', ')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#98a2a8]">
        <button
          onClick={() => onSelectTab('itinerary')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'itinerary'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Itinéraire
        </button>
        <button
          onClick={() => onSelectTab('map')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'map'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Carte Interactive
        </button>
        <button
          onClick={() => onSelectTab('activities')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'activities'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Activités
        </button>
        <button
          onClick={() => onSelectTab('stays_transports')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'stays_transports'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Hôtels & Déplacements
        </button>
        <button
          onClick={() => onSelectTab('budget')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'budget'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Budget
        </button>
        <button
          onClick={() => onSelectTab('converter')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'converter'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Devises
        </button>
        <button
          onClick={() => onSelectTab('documents')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'documents'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Documents & Billets
        </button>
      </nav>

      {/* Zone 3: Share & Primary Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onShare && (
          <button
            onClick={onShare}
            title="Partager le voyage"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111820] hover:bg-[#17212b] text-[#eadcc0] hover:text-[#c6a56a] border border-[rgba(198,165,106,0.3)] text-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#c6a56a]" />
            <span className="hidden sm:inline font-medium">Partager</span>
          </button>
        )}

        <button
          onClick={onOpenSyncModal}
          title="Sauvegarde & Données locales"
          className="w-9 h-9 rounded-full bg-[#111820] hover:bg-[#17212b] text-[#c6a56a] border border-[rgba(198,165,106,0.25)] flex items-center justify-center transition-colors"
        >
          <Database className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenNewTripModal}
          className="px-4 py-2 text-xs font-bold text-[#111820] bg-[#c6a56a] hover:bg-[#eadcc0] rounded-full transition-all whitespace-nowrap shrink-0 shadow-md flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nouveau Voyage</span>
        </button>
      </div>
    </header>
  );
};
