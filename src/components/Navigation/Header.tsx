import React from 'react';
import { Plus, ChevronDown, Share2, Compass, Smartphone, Monitor, FileArchive } from 'lucide-react';
import { Trip } from '../../types/travel';

export type ActiveTab =
  | 'trips'
  | 'itinerary'
  | 'map'
  | 'activities'
  | 'stays_transports'
  | 'budget'
  | 'converter'
  | 'documents';

interface HeaderProps {
  trips: Trip[];
  activeTrip?: Trip | null;
  onSelectTrip: (tripId: string) => void;
  onOpenNewTripModal: () => void;
  onOpenTripsGallery: () => void;
  onExportZip: () => void;
  onShare?: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isMobilePreviewMode: boolean;
  onToggleMobilePreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  trips,
  activeTrip,
  onSelectTrip,
  onOpenNewTripModal,
  onOpenTripsGallery,
  onExportZip,
  onShare,
  activeTab,
  onSelectTab,
  isMobilePreviewMode,
  onToggleMobilePreview,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0b0f14]/92 backdrop-blur-md border-b border-[rgba(198,165,106,0.22)] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Zone 1: Brand wordmark & Trip Switcher */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={() => onSelectTab('trips')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
          title="Mes voyages"
        >
          <span className="w-8 h-8 rounded-full border border-[#c6a56a] flex items-center justify-center text-[#c6a56a] group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(198,165,106,0.25)] bg-[#111820]">
            <Compass className="w-4 h-4 text-[#c6a56a]" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-serif font-bold tracking-wider text-[#edf0eb] leading-tight group-hover:text-[#c6a56a] transition-colors">
              Shahrabad
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#98a2a8] uppercase">
              carnet de route
            </span>
          </div>
        </button>

        {/* Dropdown Trip Selector */}
        {trips.length > 0 && (
          <div className="relative group/dropdown">
            <button
              onClick={onOpenTripsGallery}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111820] hover:bg-[#151d26] border border-[rgba(198,165,106,0.25)] text-xs text-[#edf0eb] max-w-[200px] sm:max-w-xs transition-colors cursor-pointer"
            >
              <span className="truncate font-semibold text-[#eadcc0]">
                {activeTrip ? activeTrip.title : 'Sélectionner un voyage'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#c6a56a] shrink-0" />
            </button>

            {/* Quick dropdown list */}
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#111820] border border-[rgba(198,165,106,0.3)] rounded-2xl p-2 shadow-2xl opacity-0 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:pointer-events-auto transition-opacity z-50">
              <div className="px-2 py-1 text-[11px] font-bold text-[#98a2a8] uppercase tracking-wider flex items-center justify-between">
                <span>Changer de voyage</span>
                <span className="text-[#c6a56a] font-mono">{trips.length}</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                {trips.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTrip(t.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      activeTrip && t.id === activeTrip.id
                        ? 'bg-[rgba(198,165,106,0.18)] text-[#eadcc0] font-bold border border-[rgba(198,165,106,0.3)]'
                        : 'text-[#edf0eb] hover:bg-[#17212b]'
                    }`}
                  >
                    <span className="truncate">{t.title}</span>
                    <span className="text-[10px] text-[#98a2a8] font-mono truncate max-w-[80px]">
                      {t.countries.join(', ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone 2: Navigation tabs */}
      <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#98a2a8]">
        <button
          onClick={() => onSelectTab('trips')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'trips'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Mes Voyages ({trips.length})
        </button>
        <button
          onClick={() => onSelectTab('itinerary')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'itinerary'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Itinéraire
        </button>
        <button
          onClick={() => onSelectTab('map')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'map'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Carte Interactive
        </button>
        <button
          onClick={() => onSelectTab('activities')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'activities'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Activités
        </button>
        <button
          onClick={() => onSelectTab('stays_transports')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'stays_transports'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Hôtels & Transports
        </button>
        <button
          onClick={() => onSelectTab('budget')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'budget'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Budget & Tricount
        </button>
        <button
          onClick={() => onSelectTab('converter')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'converter'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Devises
        </button>
        <button
          onClick={() => onSelectTab('documents')}
          className={`hover:text-[#edf0eb] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
            activeTab === 'documents'
              ? 'text-[#c6a56a] font-bold border-[#c6a56a]'
              : 'border-transparent'
          }`}
        >
          Documents
        </button>
      </nav>

      {/* Zone 3: Device Preview Toggle & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Device Switcher (Phone vs Desktop) */}
        <button
          onClick={onToggleMobilePreview}
          title={isMobilePreviewMode ? 'Afficher en mode Ordinateur' : 'Afficher en mode Téléphone'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
            isMobilePreviewMode
              ? 'bg-[#c6a56a] text-[#0b0f14] border-[#c6a56a] shadow-[0_0_12px_rgba(198,165,106,0.25)]'
              : 'bg-[#111820] text-[#98a2a8] hover:text-[#edf0eb] border-[rgba(198,165,106,0.25)]'
          }`}
        >
          {isMobilePreviewMode ? (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vue Téléphone</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vue Ordi</span>
            </>
          )}
        </button>

        {onShare && (
          <button
            onClick={onShare}
            title="Partager le voyage"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111820] hover:bg-[#17212b] text-[#eadcc0] hover:text-[#c6a56a] border border-[rgba(198,165,106,0.3)] text-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#c6a56a]" />
            <span className="hidden md:inline font-medium">Partager</span>
          </button>
        )}

        <button
          onClick={onExportZip}
          title="Exporter l'archive ZIP de tous vos voyages"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111820] hover:bg-[#17212b] text-[#eadcc0] hover:text-[#c6a56a] border border-[rgba(198,165,106,0.3)] text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <FileArchive className="w-3.5 h-3.5 text-[#c6a56a]" />
          <span className="hidden sm:inline font-medium">Exporter en ZIP</span>
        </button>

        <button
          onClick={onOpenNewTripModal}
          className="px-3.5 py-1.5 text-xs font-bold text-[#111820] bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] hover:brightness-110 rounded-full transition-all whitespace-nowrap shrink-0 shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Nouveau Voyage</span>
        </button>
      </div>
    </header>
  );
};
