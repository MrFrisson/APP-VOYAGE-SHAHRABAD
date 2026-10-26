import React from 'react';
import { ActiveTab } from './Header';
import { Compass, Map, Camera, Building2, DollarSign, FileText, MapPin } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'trips', label: 'Voyages', icon: <Compass className="w-4 h-4" /> },
    { id: 'itinerary', label: 'Étapes', icon: <MapPin className="w-4 h-4" /> },
    { id: 'map', label: 'Carte', icon: <Map className="w-4 h-4" /> },
    { id: 'activities', label: 'Activités', icon: <Camera className="w-4 h-4" /> },
    { id: 'stays_transports', label: 'Séjours', icon: <Building2 className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'documents', label: 'Billets', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f14]/96 backdrop-blur-md border-t border-[rgba(198,165,106,0.22)] px-2 py-1 flex items-center justify-around h-16 shadow-2xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[42px] min-h-[44px] transition-colors relative cursor-pointer ${
              isActive ? 'text-[#c6a56a] font-bold' : 'text-[#98a2a8] hover:text-[#edf0eb]'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-[#c6a56a] shadow-[0_0_8px_rgba(198,165,106,0.5)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
