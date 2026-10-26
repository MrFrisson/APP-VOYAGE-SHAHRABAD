import React, { useState, useRef } from 'react';
import { TravelAppData } from '../../types/travel';
import { exportDataAsJson, importDataFromJson, resetToDemoData } from '../../services/storage';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Info,
} from 'lucide-react';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: TravelAppData;
  onDataRestored: (newData: TravelAppData) => void;
  onUpdateFirebaseConfig?: (config: TravelAppData['firebaseConfig'], enabled: boolean) => void;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  appData,
  onDataRestored,
  onUpdateFirebaseConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState(appData.firebaseConfig?.apiKey || '');
  const [databaseURL, setDatabaseURL] = useState(appData.firebaseConfig?.databaseURL || '');
  const [projectId, setProjectId] = useState(appData.firebaseConfig?.projectId || '');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(!!appData.cloudSyncEnabled);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDataAsJson(appData);
    setStatusMessage('Export JSON téléchargé avec succès !');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const restored = importDataFromJson(text);
        onDataRestored(restored);
        setStatusMessage('Sauvegarde JSON importée avec succès !');
      } catch (err: any) {
        setStatusMessage(`Erreur d’importation : ${err.message || 'Fichier invalide'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Voulez-vous réinitialiser toutes les données aux voyages de démonstration complets (Chine et Italie) ?'
      )
    ) {
      const resetData = resetToDemoData();
      onDataRestored(resetData);
      setStatusMessage('Données réinitialisées avec succès aux voyages de démonstration !');
    }
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateFirebaseConfig) {
      onUpdateFirebaseConfig(
        {
          apiKey: apiKey.trim(),
          databaseURL: databaseURL.trim(),
          projectId: projectId.trim(),
        },
        cloudSyncEnabled
      );
    }
    setStatusMessage('Paramètres de synchronisation enregistrés.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Sauvegarde, Données & Firebase</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Status Alert if any */}
          {statusMessage && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Local Storage & Export/Import Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-serif font-bold text-slate-200">
                Sauvegarde Locale & Portabilité
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toutes vos modifications sont sauvegardées automatiquement et instantanément dans le stockage local de votre navigateur. Vous pouvez exporter vos données sous forme de fichier JSON sécurisé ou restaurer une sauvegarde précédente à tout moment.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Exporter JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Importer JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-rose-950/30 border border-slate-800 text-[11px] text-slate-400 hover:text-rose-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser aux voyages de démonstration (Chine & Italie)</span>
            </button>
          </div>

          {/* Cloud Sync & Firebase Section */}
          <form onSubmit={handleSaveFirebase} className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-serif font-bold text-slate-200">
                  Synchronisation Firebase (Optionnelle)
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloudSyncEnabled}
                  onChange={(e) => setCloudSyncEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Si vous possédez un projet Firebase Realtime Database ou Firestore pour synchroniser vos données entre plusieurs appareils, vous pouvez renseigner vos identifiants publics ici. Sinon, le stockage local fonctionne parfaitement et sans limite.
              </p>
            </div>

            {cloudSyncEnabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Firebase API Key
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Database URL (Realtime DB)
                  </label>
                  <input
                    type="url"
                    value={databaseURL}
                    onChange={(e) => setDatabaseURL(e.target.value)}
                    placeholder="https://votre-projet.firebaseio.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="mon-projet-voyage"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Enregistrer les paramètres Firebase
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            type="button"
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
