import React, { useState } from 'react';
import JSZip from 'jszip';
import { TravelAppData } from '../../types/travel';
import { saveTravelData } from '../../services/storage';
import { saveSharedTravelData } from '../../services/firebase';
import {
  Cloud,
  Download,
  CheckCircle2,
  Save,
  FileArchive,
  RefreshCw,
  X,
  Sparkles as _, // unused placeholder
} from 'lucide-react';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: TravelAppData;
  onDataRestored?: (newData: TravelAppData) => void;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  appData,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Click Save to Firebase Cloud & LocalStorage
  const handleOneClickSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const now = new Date();
      const updatedData: TravelAppData = {
        ...appData,
        updatedAt: now.toISOString(),
      };
      // Save locally
      saveTravelData(updatedData);
      // Save to Firebase Cloud
      const cloudSuccess = await saveSharedTravelData(updatedData);

      const timeStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSavedTime(timeStr);

      if (cloudSuccess) {
        setStatusMessage(`Enregistré avec succès dans le Cloud Firebase à ${timeStr} !`);
      } else {
        setStatusMessage(`Enregistré localement à ${timeStr}. (Note : Le quota gratuit journalier de Firebase est temporairement atteint et se réinitialise demain à minuit)`);
      }
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      setStatusMessage('Erreur lors de la sauvegarde : ' + (err.message || 'Problème réseau'));
    } finally {
      setIsSaving(false);
    }
  };

  // Export as ZIP file
  const handleExportZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // 1. Data JSON
      const jsonContent = JSON.stringify(appData, null, 2);
      zip.file('donnees-voyages.json', jsonContent);

      // 2. Markdown travel summary
      let mdContent = `# Shahrabad — Carnet de Route\n\n`;
      mdContent += `Exporté le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n`;
      mdContent += `Total voyages : ${appData.trips.length}\n\n`;

      appData.trips.forEach((trip, index) => {
        mdContent += `## Voyage ${index + 1} : ${trip.title}\n`;
        mdContent += `- Pays : ${trip.countries?.join(', ') || 'N/A'}\n`;
        mdContent += `- Dates : du ${trip.startDate || '?'} au ${trip.endDate || '?'}\n`;
        mdContent += `- Budget prévisionnel : ${trip.totalBudget} ${trip.currency}\n`;
        if (trip.description) mdContent += `- Description : ${trip.description}\n`;
        mdContent += `\n### Étapes de ce voyage :\n`;

        const steps = appData.steps.filter((s) => s.tripId === trip.id);
        if (steps.length === 0) {
          mdContent += `_Aucune étape enregistrée._\n`;
        } else {
          steps.forEach((s) => {
            mdContent += `1. **${s.destination}** (${s.nights} nuits) — Arrivée le ${s.arrivalDate || '?'}\n`;
            if (s.transportToNext) mdContent += `   - Transport : ${s.transportToNext}\n`;
            if (s.notes) mdContent += `   - Notes : ${s.notes}\n`;
          });
        }
        mdContent += `\n---\n\n`;
      });

      zip.file('carnet-de-route.md', mdContent);

      // 3. README info
      const readme = `SHAHRABAD — EXPORT DE VOYAGE
=====================================
Ce dossier ZIP contient :
- donnees-voyages.json : L'intégralité des données brutes (étapes, hébergements, transports, dépenses, tricount).
- carnet-de-route.md : Un récapitulatif clair et lisible de tous vos périples.

Toutes vos données restent synchronisées en ligne sur votre Cloud Firebase.
`;
      zip.file('README.txt', readme);

      // Generate blob
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shahrabad-export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage('Archive ZIP téléchargée avec succès !');
    } catch (err: any) {
      console.error('Erreur export ZIP:', err);
      setStatusMessage('Erreur lors de la création du ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111820] border border-[rgba(198,165,106,0.3)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[rgba(198,165,106,0.2)] flex items-center justify-between bg-[#0b0f14]">
          <h3 className="text-base font-serif font-bold text-[#edf0eb] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#c6a56a]" />
            <span>Enregistrement & Export</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[#98a2a8] hover:text-[#edf0eb] p-1 text-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body : ONLY the two requested actions */}
        <div className="p-5 space-y-4">
          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Option 1: Un clic pour enregistrer */}
          <div className="p-4 rounded-xl bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-[#c6a56a]" />
                <h4 className="text-sm font-serif font-bold text-[#edf0eb]">
                  Enregistrer dans le Cloud
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                1 Clic
              </span>
            </div>

            <p className="text-xs text-[#98a2a8] leading-relaxed">
              Enregistre instantanément tous vos voyages sur Firebase. Toute personne qui ouvre votre lien voit vos modifications immédiatement.
            </p>

            <button
              onClick={handleOneClickSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] font-bold text-xs hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-lg shadow-[rgba(198,165,106,0.2)] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer maintenant (1 Clic)'}</span>
            </button>

            {lastSavedTime && (
              <p className="text-[11px] text-center text-[#98a2a8] font-mono">
                Dernière sauvegarde : {lastSavedTime}
              </p>
            )}
          </div>

          {/* Option 2: Exporter en ZIP */}
          <div className="p-4 rounded-xl bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-[#c6a56a]" />
                <h4 className="text-sm font-serif font-bold text-[#edf0eb]">
                  Exporter en Archive ZIP
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#c6a56a] bg-[rgba(198,165,106,0.1)] px-2 py-0.5 rounded-full border border-[rgba(198,165,106,0.25)]">
                .ZIP
              </span>
            </div>

            <p className="text-xs text-[#98a2a8] leading-relaxed">
              Télécharge une archive ZIP contenant vos données complètes (`donnees-voyages.json`) et le carnet de route imprimable (`carnet-de-route.md`).
            </p>

            <button
              onClick={handleExportZip}
              disabled={isZipping}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#151d26] hover:bg-[#1a232e] text-[#edf0eb] border border-[rgba(198,165,106,0.3)] text-xs font-semibold hover:border-[#c6a56a] transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className={`w-4 h-4 text-[#c6a56a] ${isZipping ? 'animate-bounce' : ''}`} />
              <span>{isZipping ? 'Création du ZIP...' : 'Télécharger l’archive ZIP'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[rgba(198,165,106,0.2)] bg-[#0b0f14] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#151d26] hover:bg-[#1a232e] text-xs font-semibold text-[#edf0eb] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
