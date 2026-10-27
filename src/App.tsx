/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TravelAppData,
  Trip,
  Step,
  Accommodation,
  Transport,
  Activity,
  Expense,
  DocumentItem,
  GeneralLink,
  GeneralNote,
} from './types/travel';
import { loadTravelData, saveTravelData } from './services/storage';
import {
  saveSharedTravelData,
  loadSharedTravelData,
  subscribeToSharedTravelData,
} from './services/firebase';
import { Header, ActiveTab } from './components/Navigation/Header';
import { MobileTabBar } from './components/Navigation/MobileTabBar';
import { TripHeroBanner } from './components/Trips/TripHeroBanner';
import { TripModal } from './components/Trips/TripModal';
import { TripGalleryModal } from './components/Trips/TripGalleryModal';
import { TripsHubView } from './components/Trips/TripsHubView';
import { TripColorCalendarBar } from './components/Trips/TripColorCalendarBar';
import { LeafletMap } from './components/Map/LeafletMap';
import { ItineraryView } from './components/Itinerary/ItineraryView';
import { ActivitiesView } from './components/Activities/ActivitiesView';
import { AccommodationsView } from './components/Accommodations/AccommodationsView';
import { TransportsView } from './components/Transports/TransportsView';
import { CalendarView } from './components/Calendar/CalendarView';
import { BudgetView } from './components/Budget/BudgetView';
import { CurrencyConverter } from './components/Currency/CurrencyConverter';
import { DocumentsView } from './components/Documents/DocumentsView';
import { LinksNotesView } from './components/LinksAndNotes/LinksNotesView';
import { exportZipArchive } from './services/zipExport';
import {
  Calendar,
  Building2,
  Plane,
  FileText,
  Bookmark,
  CheckCircle2,
  Smartphone,
  Monitor,
  Plus,
} from 'lucide-react';

export default function App() {
  const [appData, setAppData] = useState<TravelAppData>(() => loadTravelData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('itinerary');
  const [showCalendarInItinerary, setShowCalendarInItinerary] = useState(false);
  const [staysTransportsSubTab, setStaysTransportsSubTab] = useState<'stays' | 'transports'>('stays');
  const [docsSubTab, setDocsSubTab] = useState<'documents' | 'notes'>('documents');
  const [isMobilePreviewMode, setIsMobilePreviewMode] = useState<boolean>(false);

  // Modals
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  // Export ZIP handler
  const handleExportZip = async () => {
    try {
      showToast("Génération de l'archive ZIP...");
      await exportZipArchive(appData);
      showToast("Archive ZIP téléchargée avec succès !");
    } catch (err) {
      console.error('Erreur export ZIP:', err);
      showToast('Erreur lors de la création du ZIP');
    }
  };

  // Global Currency (controls display across the entire app)
  const [globalCurrency, setGlobalCurrency] = useState<string>(() => {
    const loaded = loadTravelData();
    const active = loaded.trips.find((t) => t.id === loaded.activeTripId) || loaded.trips[0];
    return active?.currency || 'EUR';
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'syncing' | 'saved' | 'idle' | 'error'>('idle');

  // Centralized mutation function: updates React state, saves locally, and immediately persists to Firebase Firestore
  const updateAppData = (updater: (prev: TravelAppData) => TravelAppData) => {
    setAppData((prev) => {
      const next = updater(prev);
      const withTimestamp: TravelAppData = {
        ...next,
        updatedAt: new Date().toISOString(),
      };
      // 1. Instant local storage cache
      saveTravelData(withTimestamp);
      // 2. Instant real-time Firestore sync for all devices, users and locations
      setCloudSyncStatus('syncing');
      saveSharedTravelData(withTimestamp)
        .then((ok) => {
          if (ok) {
            setCloudSyncStatus('saved');
          } else {
            setCloudSyncStatus('error');
          }
        })
        .catch((err) => {
          console.error('saveSharedTravelData caught:', err);
          setCloudSyncStatus('error');
        });

      return withTimestamp;
    });
  };

  // Real-time synchronization across all devices and shared links
  useEffect(() => {
    let active = true;

    // Load initial data from Firestore immediately on boot
    loadSharedTravelData()
      .then((cloudData) => {
        if (!active) return;
        if (cloudData && Array.isArray(cloudData.trips) && cloudData.trips.length > 0) {
          setAppData((current) => {
            const cloudTime = cloudData.updatedAt ? new Date(cloudData.updatedAt).getTime() : 0;
            const currentTime = current.updatedAt ? new Date(current.updatedAt).getTime() : 0;
            if (currentTime > 0 && cloudTime <= currentTime) {
              return current;
            }
            const merged: TravelAppData = {
              trips: cloudData.trips || [],
              steps: cloudData.steps || [],
              accommodations: cloudData.accommodations || [],
              transports: cloudData.transports || [],
              activities: cloudData.activities || [],
              expenses: cloudData.expenses || [],
              documents: cloudData.documents || [],
              links: cloudData.links || [],
              notes: cloudData.notes || [],
              activeTripId: cloudData.activeTripId || current.activeTripId || cloudData.trips?.[0]?.id || '',
              updatedAt: cloudData.updatedAt || new Date().toISOString(),
            };
            saveTravelData(merged);
            setCloudSyncStatus('saved');
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn('Initial loadSharedTravelData:', err);
      });

    // Subscribe to live Firestore changes across all devices
    const unsubscribe = subscribeToSharedTravelData((cloudData) => {
      if (!active || !cloudData) return;
      if (Array.isArray(cloudData.trips)) {
        setAppData((current) => {
          const cloudTime = cloudData.updatedAt ? new Date(cloudData.updatedAt).getTime() : 0;
          const currentTime = current.updatedAt ? new Date(current.updatedAt).getTime() : 0;
          if (currentTime > 0 && cloudTime <= currentTime) {
            return current;
          }

          const merged: TravelAppData = {
            trips: cloudData.trips || [],
            steps: cloudData.steps || [],
            accommodations: cloudData.accommodations || [],
            transports: cloudData.transports || [],
            activities: cloudData.activities || [],
            expenses: cloudData.expenses || [],
            documents: cloudData.documents || [],
            links: cloudData.links || [],
            notes: cloudData.notes || [],
            activeTripId:
              cloudData.activeTripId ||
              current.activeTripId ||
              cloudData.trips?.[0]?.id ||
              '',
            updatedAt: cloudData.updatedAt || new Date().toISOString(),
          };

          saveTravelData(merged);
          setCloudSyncStatus('saved');
          return merged;
        });
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Current active trip (can be null if 0 trips exist)
  const currentTrip =
    appData.trips.find((t) => t.id === appData.activeTripId) || appData.trips[0] || null;

  // Filtered items for current active trip
  const tripSteps = currentTrip
    ? appData.steps
        .filter((s) => s.tripId === currentTrip.id)
        .sort((a, b) => a.order - b.order)
    : [];
  const tripAccommodations = currentTrip
    ? appData.accommodations.filter((a) => a.tripId === currentTrip.id)
    : [];
  const tripTransports = currentTrip
    ? appData.transports.filter((t) => t.tripId === currentTrip.id)
    : [];
  const tripActivities = currentTrip
    ? appData.activities.filter((a) => a.tripId === currentTrip.id)
    : [];
  const tripExpenses = currentTrip
    ? appData.expenses.filter((e) => e.tripId === currentTrip.id)
    : [];
  const tripDocuments = currentTrip
    ? appData.documents.filter((d) => d.tripId === currentTrip.id)
    : [];
  const tripLinks = currentTrip
    ? appData.links.filter((l) => l.tripId === currentTrip.id)
    : [];
  const tripNotes = currentTrip
    ? appData.notes.filter((n) => n.tripId === currentTrip.id)
    : [];

  // Switch Active Trip
  const handleSelectTrip = (tripId: string) => {
    const target = appData.trips.find((t) => t.id === tripId);
    updateAppData((prev) => ({
      ...prev,
      activeTripId: tripId,
    }));
    if (target?.currency) {
      setGlobalCurrency(target.currency);
    }
    showToast(`Voyage activé : ${target?.title}`);
  };

  // Save Trip (Create or Edit)
  const handleSaveTrip = (
    tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingTrip) {
      // Edit
      updateAppData((prev) => ({
        ...prev,
        trips: prev.trips.map((t) =>
          t.id === editingTrip.id
            ? { ...t, ...tripData, updatedAt: new Date().toISOString() }
            : t
        ),
      }));
      showToast('Voyage mis à jour avec succès.');
    } else {
      // Create new
      const newTripId = `trip-${Date.now()}`;
      const newTrip: Trip = {
        ...tripData,
        id: newTripId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateAppData((prev) => ({
        ...prev,
        trips: [newTrip, ...prev.trips],
        activeTripId: newTripId,
      }));
      showToast('Nouveau voyage créé avec succès !');
    }
    setEditingTrip(null);
  };

  // Duplicate Trip
  const handleDuplicateTrip = (tripToDuplicate?: Trip) => {
    const sourceTrip = tripToDuplicate || currentTrip;
    if (!sourceTrip) return;
    const newTripId = `trip-${Date.now()}`;
    const duplicatedTrip: Trip = {
      ...sourceTrip,
      id: newTripId,
      title: `${sourceTrip.title} (Copie)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Duplicate all child entities linked to this trip
    const sourceSteps = appData.steps.filter((s) => s.tripId === sourceTrip.id);
    const sourceAccommodations = appData.accommodations.filter((a) => a.tripId === sourceTrip.id);
    const sourceTransports = appData.transports.filter((t) => t.tripId === sourceTrip.id);
    const sourceActivities = appData.activities.filter((a) => a.tripId === sourceTrip.id);
    const sourceExpenses = appData.expenses.filter((e) => e.tripId === sourceTrip.id);
    const sourceDocuments = appData.documents.filter((d) => d.tripId === sourceTrip.id);
    const sourceLinks = appData.links.filter((l) => l.tripId === sourceTrip.id);
    const sourceNotes = appData.notes.filter((n) => n.tripId === sourceTrip.id);

    const stepIdMap: Record<string, string> = {};
    const newSteps: Step[] = sourceSteps.map((s) => {
      const newStepId = `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      stepIdMap[s.id] = newStepId;
      return {
        ...s,
        id: newStepId,
        tripId: newTripId,
      };
    });

    const newAccommodations: Accommodation[] = sourceAccommodations.map((a) => ({
      ...a,
      id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tripId: newTripId,
      stepId: a.stepId ? stepIdMap[a.stepId] : undefined,
    }));

    const newTransports: Transport[] = sourceTransports.map((t) => ({
      ...t,
      id: `trans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tripId: newTripId,
      stepId: t.stepId ? stepIdMap[t.stepId] : undefined,
    }));

    const newActivities: Activity[] = sourceActivities.map((act) => ({
      ...act,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tripId: newTripId,
      stepId: act.stepId ? stepIdMap[act.stepId] : undefined,
    }));

    const newExpenses: Expense[] = sourceExpenses.map((e) => ({
      ...e,
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tripId: newTripId,
      stepId: e.stepId ? stepIdMap[e.stepId] : undefined,
    }));

    const newDocuments: DocumentItem[] = sourceDocuments.map((d) => ({
      ...d,
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tripId: newTripId,
      stepId: d.stepId ? stepIdMap[d.stepId] : undefined,
    }));

    const newLinks: GeneralLink[] = sourceLinks.map((l) => ({
      ...l,
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tripId: newTripId,
      stepId: l.stepId ? stepIdMap[l.stepId] : undefined,
    }));

    const newNotes: GeneralNote[] = sourceNotes.map((n) => ({
      ...n,
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tripId: newTripId,
    }));

    updateAppData((prev) => ({
      ...prev,
      trips: [duplicatedTrip, ...prev.trips],
      activeTripId: newTripId,
      steps: [...prev.steps, ...newSteps],
      accommodations: [...prev.accommodations, ...newAccommodations],
      transports: [...prev.transports, ...newTransports],
      activities: [...prev.activities, ...newActivities],
      expenses: [...prev.expenses, ...newExpenses],
      documents: [...prev.documents, ...newDocuments],
      links: [...prev.links, ...newLinks],
      notes: [...prev.notes, ...newNotes],
    }));

    showToast('Voyage dupliqué avec tous ses éléments !');
  };

  // Delete Trip (allows deleting down to 0 trips)
  const handleDeleteTrip = (tripIdToDelete?: string) => {
    const targetTrip = tripIdToDelete
      ? appData.trips.find((t) => t.id === tripIdToDelete)
      : currentTrip;

    if (!targetTrip) return;

    if (
      window.confirm(
        `Êtes-vous certain de vouloir supprimer le voyage "${targetTrip.title}" et toutes ses données associées ?`
      )
    ) {
      const remainingTrips = appData.trips.filter((t) => t.id !== targetTrip.id);
      const nextActiveTripId = remainingTrips.length > 0 ? remainingTrips[0].id : '';
      updateAppData((prev) => ({
        ...prev,
        trips: remainingTrips,
        activeTripId: nextActiveTripId,
        steps: prev.steps.filter((s) => s.tripId !== targetTrip.id),
        accommodations: prev.accommodations.filter((a) => a.tripId !== targetTrip.id),
        transports: prev.transports.filter((t) => t.tripId !== targetTrip.id),
        activities: prev.activities.filter((act) => act.tripId !== targetTrip.id),
        expenses: prev.expenses.filter((e) => e.tripId !== targetTrip.id),
        documents: prev.documents.filter((d) => d.tripId !== targetTrip.id),
        links: prev.links.filter((l) => l.tripId !== targetTrip.id),
        notes: prev.notes.filter((n) => n.tripId !== targetTrip.id),
      }));
      showToast('Voyage supprimé.');
      if (remainingTrips.length === 0) {
        setActiveTab('trips');
      }
    }
  };

  // Step Handlers
  const handleAddStep = (stepData: Omit<Step, 'id' | 'tripId' | 'order'>) => {
    const newStep: Step = {
      ...stepData,
      id: `step-${Date.now()}`,
      tripId: currentTrip.id,
      order: tripSteps.length + 1,
    };
    updateAppData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    showToast(`Étape "${newStep.destination}" ajoutée !`);
  };

  const handleUpdateStep = (step: Step) => {
    updateAppData((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === step.id ? step : s)),
    }));
    showToast('Étape mise à jour.');
  };

  const handleDeleteStep = (stepId: string) => {
    updateAppData((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
    }));
    showToast('Étape supprimée.');
  };

  const handleReorderSteps = (reordered: Step[]) => {
    updateAppData((prev) => {
      const otherSteps = prev.steps.filter((s) => s.tripId !== currentTrip.id);
      return {
        ...prev,
        steps: [...otherSteps, ...reordered],
      };
    });
    showToast('Ordre des étapes réorganisé.');
  };

  // Accommodation Handlers
  const handleAddAccommodation = (accData: Omit<Accommodation, 'id' | 'tripId'>) => {
    const newAcc: Accommodation = {
      ...accData,
      id: `acc-${Date.now()}`,
      tripId: currentTrip.id,
    };
    updateAppData((prev) => ({
      ...prev,
      accommodations: [...prev.accommodations, newAcc],
    }));
    showToast(`Hôtel "${newAcc.name}" ajouté !`);
  };

  const handleUpdateAccommodation = (acc: Accommodation) => {
    updateAppData((prev) => ({
      ...prev,
      accommodations: prev.accommodations.map((a) => (a.id === acc.id ? acc : a)),
    }));
    showToast('Hébergement mis à jour.');
  };

  const handleDeleteAccommodation = (accId: string) => {
    updateAppData((prev) => ({
      ...prev,
      accommodations: prev.accommodations.filter((a) => a.id !== accId),
    }));
    showToast('Hébergement supprimé.');
  };

  // Transport Handlers
  const handleAddTransport = (transData: Omit<Transport, 'id' | 'tripId'>) => {
    const newTrans: Transport = {
      ...transData,
      id: `trans-${Date.now()}`,
      tripId: currentTrip.id,
    };
    updateAppData((prev) => ({
      ...prev,
      transports: [...prev.transports, newTrans],
    }));
    showToast('Transport ajouté !');
  };

  const handleUpdateTransport = (t: Transport) => {
    updateAppData((prev) => ({
      ...prev,
      transports: prev.transports.map((item) => (item.id === t.id ? t : item)),
    }));
    showToast('Transport mis à jour.');
  };

  const handleDeleteTransport = (transId: string) => {
    updateAppData((prev) => ({
      ...prev,
      transports: prev.transports.filter((t) => t.id !== transId),
    }));
    showToast('Transport supprimé.');
  };

  // Activity Handlers
  const handleAddActivity = (actData: Omit<Activity, 'id' | 'tripId'>) => {
    const newAct: Activity = {
      ...actData,
      id: `act-${Date.now()}`,
      tripId: currentTrip.id,
    };
    updateAppData((prev) => ({
      ...prev,
      activities: [...prev.activities, newAct],
    }));
    showToast(`Activité "${newAct.name}" ajoutée !`);
  };

  const handleUpdateActivity = (act: Activity) => {
    updateAppData((prev) => ({
      ...prev,
      activities: prev.activities.map((a) => (a.id === act.id ? act : a)),
    }));
    showToast('Activité mise à jour.');
  };

  const handleDeleteActivity = (actId: string) => {
    updateAppData((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== actId),
    }));
    showToast('Activité supprimée.');
  };

  // Expense Handlers
  const handleAddExpense = (expData: Omit<Expense, 'id' | 'tripId'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      tripId: currentTrip.id,
    };
    updateAppData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExp],
    }));
    showToast('Dépense enregistrée.');
  };

  const handleUpdateExpense = (exp: Expense) => {
    updateAppData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === exp.id ? exp : e)),
    }));
    showToast('Dépense mise à jour.');
  };

  const handleDeleteExpense = (expId: string) => {
    updateAppData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expId),
    }));
    showToast('Dépense supprimée.');
  };

  const handleUpdateTripBudget = (newBudget: number) => {
    updateAppData((prev) => ({
      ...prev,
      trips: prev.trips.map((t) =>
        t.id === currentTrip.id ? { ...t, totalBudget: newBudget } : t
      ),
    }));
    showToast('Budget prévisionnel mis à jour.');
  };

  // Document Handlers
  const handleAddDocument = (docData: Omit<DocumentItem, 'id' | 'tripId'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc-${Date.now()}`,
      tripId: currentTrip.id,
    };
    updateAppData((prev) => ({
      ...prev,
      documents: [...prev.documents, newDoc],
    }));
    showToast('Document numérisé avec succès !');
  };

  const handleUpdateDocument = (doc: DocumentItem) => {
    updateAppData((prev) => ({
      ...prev,
      documents: prev.documents.map((d) => (d.id === doc.id ? doc : d)),
    }));
    showToast('Document mis à jour.');
  };

  const handleDeleteDocument = (docId: string) => {
    updateAppData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
    }));
    showToast('Document supprimé.');
  };

  // Links & Notes Handlers
  const handleAddLink = (linkData: Omit<GeneralLink, 'id' | 'tripId'>) => {
    const newLink: GeneralLink = {
      ...linkData,
      id: `link-${Date.now()}`,
      tripId: currentTrip.id,
    };
    updateAppData((prev) => ({
      ...prev,
      links: [...prev.links, newLink],
    }));
    showToast('Lien enregistré.');
  };

  const handleDeleteLink = (linkId: string) => {
    updateAppData((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== linkId),
    }));
    showToast('Lien supprimé.');
  };

  const handleAddNote = (noteData: Omit<GeneralNote, 'id' | 'tripId'>) => {
    const newNote: GeneralNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      tripId: currentTrip.id,
    };
    updateAppData((prev) => ({
      ...prev,
      notes: [...prev.notes, newNote],
    }));
    showToast('Note enregistrée.');
  };

  const handleUpdateNote = (note: GeneralNote) => {
    updateAppData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === note.id ? note : n)),
    }));
    showToast('Note mise à jour.');
  };

  const handleDeleteNote = (noteId: string) => {
    updateAppData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
    showToast('Note supprimée.');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900 border border-amber-500/50 text-slate-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <Header
        trips={appData.trips}
        activeTrip={currentTrip}
        onSelectTrip={handleSelectTrip}
        onOpenNewTripModal={() => {
          setEditingTrip(null);
          setIsTripModalOpen(true);
        }}
        onOpenTripsGallery={() => setActiveTab('trips')}
        onShare={() => {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href).catch(() => {});
          }
          showToast('Lien du voyage copié dans le presse-papier !');
        }}
        onExportZip={handleExportZip}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMobilePreviewMode={isMobilePreviewMode}
        onToggleMobilePreview={() => setIsMobilePreviewMode(!isMobilePreviewMode)}
        cloudSyncStatus={cloudSyncStatus}
      />

      {/* Device Mode Wrapper (Computer full-width vs. Mobile phone mockup) */}
      <div className={isMobilePreviewMode ? "py-6 px-4 flex flex-col items-center bg-[#05070a] min-h-[calc(100vh-65px)]" : "flex-1 flex flex-col"}>
        {isMobilePreviewMode && (
          <div className="w-full max-w-[420px] mb-3 flex items-center justify-between text-xs bg-[#111820] border border-[rgba(198,165,106,0.3)] rounded-2xl px-4 py-2.5 text-[#edf0eb] shadow-lg">
            <span className="flex items-center gap-2 font-medium text-[#eadcc0]">
              <Smartphone className="w-4 h-4 text-[#c6a56a]" />
              <span>Aperçu Mobile (390px)</span>
            </span>
            <button
              onClick={() => setIsMobilePreviewMode(false)}
              className="flex items-center gap-1.5 text-xs text-[#0b0f14] bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] font-bold px-3 py-1 rounded-full shadow hover:brightness-110 cursor-pointer transition-all"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Vue Ordinateur</span>
            </button>
          </div>
        )}

        <div className={isMobilePreviewMode ? "w-full max-w-[420px] bg-[#070a0e] rounded-[48px] border-[10px] border-[#1d2632] shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex flex-col relative ring-1 ring-[rgba(198,165,106,0.35)] h-[844px] overflow-hidden is-mobile-frame" : "flex-1 flex flex-col"}>
          {isMobilePreviewMode && (
            <>
              {/* Phone Status Bar */}
              <div className="w-full bg-[#111820] py-2 px-5 flex items-center justify-between text-[11px] text-[#98a2a8] border-b border-[rgba(198,165,106,0.15)] select-none shrink-0">
                <span className="font-mono text-[#eadcc0] font-semibold">09:41</span>
                {/* Dynamic Island Pill */}
                <div className="w-24 h-4 bg-[#070a0e] rounded-full mx-auto border border-[#222f3d] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#151d26]" />
                </div>
                <span className="text-[10px] font-mono text-[#c6a56a] font-semibold">5G 100%</span>
              </div>

              {/* Native Mobile In-App Top Bar */}
              <div className="w-full bg-[#0b0f14]/95 py-2 px-3 border-b border-[rgba(198,165,106,0.2)] flex items-center justify-between shrink-0 z-20">
                <button
                  type="button"
                  onClick={() => setActiveTab('trips')}
                  className="flex items-center gap-1.5 text-left cursor-pointer"
                  title="Mes voyages"
                >
                  <span className="w-6 h-6 rounded-full border border-[#c6a56a] flex items-center justify-center text-[#c6a56a] bg-[#111820] text-xs">
                    🧭
                  </span>
                  <span className="text-xs font-serif font-bold text-[#edf0eb]">Shahrabad</span>
                </button>

                {currentTrip && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('trips')}
                    className="text-[11px] text-[#eadcc0] bg-[#111820] px-2.5 py-1 rounded-full border border-[rgba(198,165,106,0.25)] truncate max-w-[170px] cursor-pointer hover:border-[#c6a56a]"
                    title="Changer de voyage"
                  >
                    {currentTrip.title}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingTrip(null);
                    setIsTripModalOpen(true);
                  }}
                  className="p-1 rounded-full bg-[#c6a56a] text-[#0b0f14] hover:brightness-110 cursor-pointer"
                  title="Nouveau voyage"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </>
          )}

          {/* Main Container */}
          <main className={isMobilePreviewMode ? "flex-1 overflow-y-auto px-3.5 py-4 space-y-4 pb-20" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12"}>
            {/* Tab: Dedicated Trips Hub View (Mes Voyages) or when zero trips exist */}
            {(activeTab === 'trips' || !currentTrip) && (
              <TripsHubView
                trips={appData.trips}
                activeTripId={currentTrip?.id}
                allSteps={appData.steps}
                displayCurrency={globalCurrency}
                onSelectTrip={(id) => {
                  handleSelectTrip(id);
                  setActiveTab('itinerary');
                }}
                onOpenNewTripModal={() => {
                  setEditingTrip(null);
                  setIsTripModalOpen(true);
                }}
                onEditTrip={(trip) => {
                  setEditingTrip(trip);
                  setIsTripModalOpen(true);
                }}
                onDuplicateTrip={(trip) => handleDuplicateTrip(trip)}
                onDeleteTrip={(id) => handleDeleteTrip(id)}
              />
            )}

            {/* When a trip is active and not on the trips hub */}
            {currentTrip && activeTab !== 'trips' && (
              <>
                {/* Active Trip Hero Banner */}
                <TripHeroBanner
                  trip={currentTrip}
                  steps={tripSteps}
                  tripsCount={appData.trips.length}
                  displayCurrency={globalCurrency}
                  onEditTrip={() => {
                    setEditingTrip(currentTrip);
                    setIsTripModalOpen(true);
                  }}
                  onDuplicateTrip={() => handleDuplicateTrip(currentTrip)}
                  onDeleteTrip={() => handleDeleteTrip(currentTrip.id)}
                  onSelectOtherTrip={() => setActiveTab('trips')}
                  onShareTrip={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href).catch(() => {});
                    }
                    showToast('Lien de partage du voyage copié !');
                  }}
                />

                {/* Destination Color Calendar Timeline Bar */}
                <div className="mb-6">
                  <TripColorCalendarBar
                    steps={tripSteps}
                    tripStartDate={currentTrip.startDate}
                    tripEndDate={currentTrip.endDate}
                    onSelectStep={() => setActiveTab('itinerary')}
                  />
                </div>
              </>
            )}

            {/* Tab 1: Itinéraire & Étapes */}
            {currentTrip && activeTab === 'itinerary' && (
              <div className="space-y-6">
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCalendarInItinerary(!showCalendarInItinerary)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                      showCalendarInItinerary
                        ? 'bg-[rgba(198,165,106,0.18)] text-[#eadcc0] border-[rgba(198,165,106,0.4)]'
                        : 'bg-[#111820] text-[#98a2a8] border-[rgba(255,255,255,0.08)] hover:text-[#edf0eb]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#c6a56a]" />
                    <span>
                      {showCalendarInItinerary
                        ? 'Masquer la vue calendrier'
                        : 'Afficher le calendrier dynamique'}
                    </span>
                  </button>
                </div>

                {showCalendarInItinerary && (
                  <CalendarView
                    tripStartDate={currentTrip.startDate}
                    tripEndDate={currentTrip.endDate}
                    steps={tripSteps}
                    activities={tripActivities}
                    accommodations={tripAccommodations}
                    transports={tripTransports}
                    onAddActivityForDate={() => setActiveTab('activities')}
                  />
                )}

                <ItineraryView
                  tripId={currentTrip.id}
                  steps={tripSteps}
                  accommodations={tripAccommodations}
                  activities={tripActivities}
                  transports={tripTransports}
                  expenses={tripExpenses}
                  displayCurrency={globalCurrency}
                  onAddStep={handleAddStep}
                  onUpdateStep={handleUpdateStep}
                  onDeleteStep={handleDeleteStep}
                  onReorderSteps={handleReorderSteps}
                  onAddActivity={handleAddActivity}
                  onUpdateActivity={handleUpdateActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onAddAccommodation={handleAddAccommodation}
                />
              </div>
            )}

            {/* Tab 2: Carte Interactive Leaflet (Labels 100% en anglais) */}
            {currentTrip && activeTab === 'map' && (
              <div className="space-y-4">
                <LeafletMap
                  steps={tripSteps}
                  accommodations={tripAccommodations}
                  activities={tripActivities}
                  transports={tripTransports}
                  tripTitle={currentTrip.title}
                />
              </div>
            )}

            {/* Tab 3: Activités & Planning */}
            {currentTrip && activeTab === 'activities' && (
              <ActivitiesView
                tripId={currentTrip.id}
                steps={tripSteps}
                activities={tripActivities}
                displayCurrency={globalCurrency}
                onAddActivity={handleAddActivity}
                onUpdateActivity={handleUpdateActivity}
                onDeleteActivity={handleDeleteActivity}
              />
            )}

            {/* Tab 4: Hébergements & Déplacements */}
            {currentTrip && activeTab === 'stays_transports' && (
              <div className="space-y-6">
                <div className="flex items-center gap-1 p-1 bg-[#111820] rounded-xl border border-[rgba(198,165,106,0.2)] text-xs w-fit">
                  <button
                    type="button"
                    onClick={() => setStaysTransportsSubTab('stays')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                      staysTransportsSubTab === 'stays'
                        ? 'bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] shadow-md'
                        : 'text-[#98a2a8] hover:text-[#edf0eb]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hébergements ({tripAccommodations.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaysTransportsSubTab('transports')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                      staysTransportsSubTab === 'transports'
                        ? 'bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] shadow-md'
                        : 'text-[#98a2a8] hover:text-[#edf0eb]'
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>Transports & Déplacements ({tripTransports.length})</span>
                  </button>
                </div>

                {staysTransportsSubTab === 'stays' ? (
                  <AccommodationsView
                    tripId={currentTrip.id}
                    steps={tripSteps}
                    accommodations={tripAccommodations}
                    displayCurrency={globalCurrency}
                    onAddAccommodation={handleAddAccommodation}
                    onUpdateAccommodation={handleUpdateAccommodation}
                    onDeleteAccommodation={handleDeleteAccommodation}
                  />
                ) : (
                  <TransportsView
                    tripId={currentTrip.id}
                    steps={tripSteps}
                    transports={tripTransports}
                    displayCurrency={globalCurrency}
                    onAddTransport={handleAddTransport}
                    onUpdateTransport={handleUpdateTransport}
                    onDeleteTransport={handleDeleteTransport}
                  />
                )}
              </div>
            )}

            {/* Tab 5: Budget & Tricount */}
            {currentTrip && activeTab === 'budget' && (
              <BudgetView
                trip={currentTrip}
                steps={tripSteps}
                accommodations={tripAccommodations}
                transports={tripTransports}
                activities={tripActivities}
                expenses={tripExpenses}
                displayCurrency={globalCurrency}
                onSelectDisplayCurrency={setGlobalCurrency}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}
                onUpdateTripBudget={handleUpdateTripBudget}
                onAddActivity={handleAddActivity}
                onUpdateActivity={handleUpdateActivity}
                onDeleteActivity={handleDeleteActivity}
                onAddAccommodation={handleAddAccommodation}
                onUpdateAccommodation={handleUpdateAccommodation}
                onDeleteAccommodation={handleDeleteAccommodation}
                onAddTransport={handleAddTransport}
                onUpdateTransport={handleUpdateTransport}
                onDeleteTransport={handleDeleteTransport}
                onShareBudget={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href).catch(() => {});
                  }
                  showToast('Récapitulatif du budget copié dans le presse-papier !');
                }}
              />
            )}

            {/* Tab 6: Devises */}
            {activeTab === 'converter' && <CurrencyConverter />}

            {/* Tab 7: Documents, Billets, Liens & Notes */}
            {currentTrip && activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center gap-1 p-1 bg-[#111820] rounded-xl border border-[rgba(198,165,106,0.2)] text-xs w-fit">
                  <button
                    type="button"
                    onClick={() => setDocsSubTab('documents')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                      docsSubTab === 'documents'
                        ? 'bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] shadow-md'
                        : 'text-[#98a2a8] hover:text-[#edf0eb]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Billets & QR Codes ({tripDocuments.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocsSubTab('notes')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
                      docsSubTab === 'notes'
                        ? 'bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] shadow-md'
                        : 'text-[#98a2a8] hover:text-[#edf0eb]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Liens Utiles & Checklists ({tripLinks.length + tripNotes.length})</span>
                  </button>
                </div>

                {docsSubTab === 'documents' ? (
                  <DocumentsView
                    tripId={currentTrip.id}
                    steps={tripSteps}
                    documents={tripDocuments}
                    onAddDocument={handleAddDocument}
                    onUpdateDocument={handleUpdateDocument}
                    onDeleteDocument={handleDeleteDocument}
                  />
                ) : (
                  <LinksNotesView
                    tripId={currentTrip.id}
                    steps={tripSteps}
                    links={tripLinks}
                    notes={tripNotes}
                    onAddLink={handleAddLink}
                    onDeleteLink={handleDeleteLink}
                    onAddNote={handleAddNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                  />
                )}
              </div>
            )}
          </main>

          {/* Mobile Touch-First Tab Bar */}
          <MobileTabBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            isInsidePhoneMockup={isMobilePreviewMode}
          />
          {isMobilePreviewMode && (
            <div className="py-1.5 bg-[#0b0f14] shrink-0 border-t border-slate-900/60 select-none">
              <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto" />
            </div>
          )}
        </div>
      </div>

      {/* Trip Creation / Edition Modal */}
      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        editingTrip={editingTrip}
      />

      {/* Multi-Trips Gallery Switcher Modal */}
      <TripGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        trips={appData.trips}
        activeTripId={currentTrip?.id}
        onSelectTrip={handleSelectTrip}
        onOpenNewTripModal={() => {
          setEditingTrip(null);
          setIsTripModalOpen(true);
        }}
      />

    </div>
  );
}
