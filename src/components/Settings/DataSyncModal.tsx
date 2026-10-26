import React, { useState, useRef, useEffect } from 'react';
import { TravelAppData } from '../../types/travel';
import { exportDataAsJson, importDataFromJson, resetToDemoData } from '../../services/storage';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  saveTravelDataToCloud,
  loadTravelDataFromCloud,
} from '../../services/firebase';
import { User } from 'firebase/auth';
import {
  Cloud,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  LogIn,
  LogOut,
  RefreshCw,
  Shield,
} from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: TravelAppData;
  onDataRestored: (newData: TravelAppData) => void;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  appData,
  onDataRestored,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setIsSyncing(true);
      setStatusMessage('Connexion Google en cours...');
      setStatusType('info');
      const user = await loginWithGoogle();
      setCurrentUser(user);
      setStatusMessage(`Connecté avec succès en tant que ${user.displayName || user.email} !`);
      setStatusType('success');

      // Auto-load cloud data if available, or upload local data
      const cloudData = await loadTravelDataFromCloud(user);
      if (cloudData && Array.isArray(cloudData.trips) && cloudData.trips.length > 0) {
        onDataRestored({
          ...appData,
          ...cloudData,
        } as TravelAppData);
        setStatusMessage('Données récupérées depuis Firebase Firestore !');
      } else {
        await saveTravelDataToCloud(appData, user);
        setStatusMessage('Vos voyages locaux ont été synchronisés sur Firebase !');
      }
    } catch (err: any) {
      console.error('Erreur Firebase Auth:', err);
      setStatusMessage(`Erreur de connexion : ${err.message || 'Impossible de se connecter'}`);
      setStatusType('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setStatusMessage('Déconnecté de Firebase.');
      setStatusType('info');
    } catch (err: any) {
      setStatusMessage(`Erreur de déconnexion : ${err.message}`);
      setStatusType('error');
    }
  };

  const handlePushToCloud = async () => {
    if (!currentUser) return;
    try {
      setIsSyncing(true);
      await saveTravelDataToCloud(appData, currentUser);
      setStatusMessage('Toutes vos données sont enregistrées en temps réel sur Firebase !');
      setStatusType('success');
    } catch (err: any) {
      setStatusMessage(`Erreur de synchronisation : ${err.message}`);
      setStatusType('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!currentUser) return;
    try {
      setIsSyncing(true);
      const cloudData = await loadTravelDataFromCloud(currentUser);
      if (cloudData && Array.isArray(cloudData.trips)) {
        onDataRestored({
          ...appData,
          ...cloudData,
        } as TravelAppData);
        setStatusMessage('Données rechargées avec succès depuis Firebase Firestore !');
        setStatusType('success');
      } else {
        setStatusMessage('Aucune sauvegarde antérieure trouvée sur le Cloud. Sauvegarde locale active.');
        setStatusType('info');
      }
    } catch (err: any) {
      setStatusMessage(`Erreur lors du chargement : ${err.message}`);
      setStatusType('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => {
    exportDataAsJson(appData);
    setStatusMessage('Export JSON téléchargé avec succès !');
    setStatusType('success');
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
        setStatusType('success');
      } catch (err: any) {
        setStatusMessage(`Erreur d’importation : ${err.message || 'Fichier invalide'}`);
        setStatusType('error');
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
      setStatusType('info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111820] border border-[rgba(198,165,106,0.3)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[rgba(198,165,106,0.2)] flex items-center justify-between bg-[#0b0f14]">
          <h3 className="text-base font-serif font-bold text-[#edf0eb] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#c6a56a]" />
            <span>Synchronisation Cloud Firebase & Données</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[#98a2a8] hover:text-[#edf0eb] p-1 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusType === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                  : statusType === 'error'
                  ? 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                  : 'bg-[rgba(198,165,106,0.1)] border border-[rgba(198,165,106,0.3)] text-[#eadcc0]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Cloud Sync Section */}
          <div className="p-4 rounded-xl bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-sm font-serif font-bold text-[#edf0eb]">
                  Cloud Firestore & Authentification
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#c6a56a] px-2 py-0.5 rounded-full bg-[rgba(198,165,106,0.1)] border border-[rgba(198,165,106,0.2)]">
                Base active
              </span>
            </div>

            <p className="text-xs text-[#98a2a8] leading-relaxed">
              Votre projet Firebase <code className="text-[#c6a56a] font-mono">{firebaseConfig.projectId}</code> est connecté et opérationnel. Connectez-vous avec votre compte Google pour synchroniser instantanément vos carnets de route sur tous vos appareils.
            </p>

            {currentUser ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#151d26] border border-[rgba(198,165,106,0.15)] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👤</span>
                    <div>
                      <p className="font-semibold text-[#edf0eb]">{currentUser.displayName || 'Utilisateur'}</p>
                      <p className="text-[11px] text-[#98a2a8]">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-[#b84f4b] hover:bg-[#b84f4b]/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handlePushToCloud}
                    disabled={isSyncing}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] font-bold text-xs hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sauvegarder vers le Cloud</span>
                  </button>

                  <button
                    onClick={handlePullFromCloud}
                    disabled={isSyncing}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#151d26] hover:bg-[#1a232e] text-[#edf0eb] border border-[rgba(198,165,106,0.25)] text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c6a56a]" />
                    <span>Recharger du Cloud</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] font-bold text-xs hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter avec Google pour synchroniser</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-[11px] text-[#657079] pt-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Règles de sécurité Firestore activées : vos voyages restent strictement privés.</span>
            </div>
          </div>

          {/* Local Storage & Export/Import Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#c6a56a]" />
              <h4 className="text-sm font-serif font-bold text-[#edf0eb]">
                Sauvegarde Locale & Portabilité JSON
              </h4>
            </div>
            <p className="text-xs text-[#98a2a8] leading-relaxed">
              Toutes vos données restent également enregistrées en temps réel dans votre navigateur local. Vous pouvez à tout moment exporter un fichier de sauvegarde ou l’importer.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0b0f14] hover:bg-[#151d26] border border-[rgba(198,165,106,0.25)] text-xs font-semibold text-[#edf0eb] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#c6a56a]" />
                <span>Exporter JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0b0f14] hover:bg-[#151d26] border border-[rgba(198,165,106,0.25)] text-xs font-semibold text-[#edf0eb] transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#79b59b]" />
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#0b0f14]/60 hover:bg-[#b84f4b]/20 border border-[rgba(198,165,106,0.15)] text-[11px] text-[#98a2a8] hover:text-[#b84f4b] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser aux voyages de démonstration</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(198,165,106,0.2)] bg-[#0b0f14] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#151d26] hover:bg-[#1a232e] text-xs font-semibold text-[#edf0eb] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
