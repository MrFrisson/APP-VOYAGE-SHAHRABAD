import React from 'react';
import { ActiveTab } from './Header';
import { Compass, Map, Sparkles, Building2, DollarSign, FileText } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'itinerary', label: 'Étapes', icon: <Compass className="w-5 h-5" /> },
    { id: 'map', label: 'Carte', icon: <Map className="w-5 h-5" /> },
    { id: 'activities', label: 'Activités', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'stays_transports', label: 'Séjours', icon: <Building2 className="w-5 h-5" /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'documents', label: 'Billets', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around h-16 shadow-2xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] transition-colors relative ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
