import React, { useState, useEffect } from 'react';
import { Step, Accommodation, Activity, Expense, Transport } from '../../types/travel';
import {
  searchDestinations,
  fetchGlobalCities,
  buildGoogleMapsUrl,
  WorldCity,
  getAutoEmojiForDestination,
  getAutoCoordsForDestination,
} from '../../data/worldDestinations';
import { convertCurrency, formatMoney } from '../../services/currency';
import {
  Calendar,
  Compass,
  ExternalLink,
  MapPin,
  Moon,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Loader2,
} from 'lucide-react';
import { ShahrabadDatePicker } from '../Common/ShahrabadDatePicker';

interface ItineraryViewProps {
  tripId: string;
  steps: Step[];
  accommodations: Accommodation[];
  activities: Activity[];
  transports: Transport[];
  expenses: Expense[];
  displayCurrency: string;
  onAddStep: (step: Omit<Step, 'id' | 'tripId' | 'order'>) => void;
  onUpdateStep: (step: Step) => void;
  onDeleteStep: (stepId: string) => void;
  onReorderSteps: (reorderedSteps: Step[]) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  steps,
  accommodations,
  activities,
  transports,
  expenses,
  displayCurrency,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onReorderSteps,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  // Form states for Add/Edit Modal
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [nights, setNights] = useState<number>(3);
  const [transportToNext, setTransportToNext] = useState('');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [citySuggestions, setCitySuggestions] = useState<WorldCity[]>(() => searchDestinations(''));
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  useEffect(() => {
    if (!destinationQuery.trim()) {
      setCitySuggestions(searchDestinations(''));
      setIsSearchingCities(false);
      return;
    }

    // Immediately show local matches so UI feels instant
    setCitySuggestions(searchDestinations(destinationQuery));

    let isMounted = true;
    setIsSearchingCities(true);

    const timer = setTimeout(async () => {
      try {
        const results = await fetchGlobalCities(destinationQuery);
        if (isMounted) {
          setCitySuggestions(results);
          setIsSearchingCities(false);
        }
      } catch (_err) {
        if (isMounted) setIsSearchingCities(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [destinationQuery]);

  const openAddModal = () => {
    // Determine default dates from last step
    let nextArrDate = new Date().toISOString().slice(0, 10);
    if (steps.length > 0) {
      const last = steps[steps.length - 1];
      nextArrDate = last.departureDate || nextArrDate;
    }
    const d = new Date(nextArrDate);
    d.setDate(d.getDate() + 3);
    const nextDepDate = d.toISOString().slice(0, 10);

    setDestinationQuery('');
    setDestinationName('');
    setCountry('');
    setRegion('');
    setArrivalDate(nextArrDate);
    setDepartureDate(nextDepDate);
    setNights(3);
    setTransportToNext('');
    setNotes('');
    setLat(undefined);
    setLng(undefined);
    setEditingStep(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (step: Step) => {
    setEditingStep(step);
    setDestinationName(step.destination);
    setCountry(step.country);
    setRegion(step.region || '');
    setArrivalDate(step.arrivalDate);
    setDepartureDate(step.departureDate);
    setNights(step.nights);
    setTransportToNext(step.transportToNext || '');
    setNotes(step.notes || '');
    setLat(step.lat);
    setLng(step.lng);
    setIsAddModalOpen(true);
  };

  const handleSelectCitySuggestion = (city: WorldCity) => {
    setDestinationName(city.city);
    setCountry(city.country);
    setRegion(city.region);
    setLat(city.lat);
    setLng(city.lng);
    setDestinationQuery('');
  };

  const handleArrivalDateChange = (val: string) => {
    setArrivalDate(val);
    if (departureDate && val) {
      const diff = Math.round(
        (new Date(departureDate).getTime() - new Date(val).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff > 0) setNights(diff);
    }
  };

  const handleDepartureDateChange = (val: string) => {
    setDepartureDate(val);
    if (arrivalDate && val) {
      const diff = Math.round(
        (new Date(val).getTime() - new Date(arrivalDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff > 0) setNights(diff);
    }
  };

  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationName.trim()) return;

    const autoEmoji = getAutoEmojiForDestination(`${destinationName} ${country}`);
    const autoCoords = getAutoCoordsForDestination(`${destinationName} ${country}`);
    const finalLat = lat !== undefined ? lat : autoCoords.lat;
    const finalLng = lng !== undefined ? lng : autoCoords.lng;

    if (editingStep) {
      onUpdateStep({
        ...editingStep,
        destination: destinationName.trim(),
        country: country.trim() || 'Monde',
        region: region.trim() || undefined,
        arrivalDate,
        departureDate,
        nights: Math.max(1, nights),
        transportToNext: transportToNext.trim() || undefined,
        notes: notes.trim() || undefined,
        emoji: autoEmoji,
        lat: finalLat,
        lng: finalLng,
        googleMapsUrl: buildGoogleMapsUrl(destinationName, finalLat, finalLng),
      });
    } else {
      onAddStep({
        destination: destinationName.trim(),
        country: country.trim() || 'Monde',
        region: region.trim() || undefined,
        arrivalDate,
        departureDate,
        nights: Math.max(1, nights),
        transportToNext: transportToNext.trim() || undefined,
        notes: notes.trim() || undefined,
        emoji: autoEmoji,
        lat: finalLat,
        lng: finalLng,
        googleMapsUrl: buildGoogleMapsUrl(destinationName, finalLat, finalLng),
      });
    }

    setIsAddModalOpen(false);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    const updated = newSteps.map((step, idx) => ({
      ...step,
      order: idx + 1,
    }));

    onReorderSteps(updated);
  };

  const totalNights = steps.reduce((sum, s) => sum + s.nights, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111820]/90 rounded-2xl border border-[rgba(198,165,106,0.22)] shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#c6a56a]" />
            <h2 className="text-xl font-serif font-bold text-[#edf0eb]">
              Itinéraire & Étapes du Voyage
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#98a2a8] mt-1">
            <span>{steps.length} destination{steps.length > 1 ? 's' : ''}</span>
            <span aria-hidden="true">·</span>
            <span>{totalNights} nuits au total</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#c6a56a] font-medium">Itinéraire mondial & coordonnées auto</span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] hover:brightness-110 text-[#0b0f14] font-bold text-sm shadow-lg shadow-[rgba(198,165,106,0.15)] transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une étape</span>
        </button>
      </div>

      {/* Steps Timeline Cards */}
      {steps.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-300">Aucune étape pour ce voyage</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Commencez par ajouter une première étape : ville, région, ou lieu précis n'importe où dans le monde.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs"
          >
            Ajouter la 1ère destination
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => {
            const stepHotels = accommodations.filter((h) => h.stepId === step.id);
            const stepActs = activities.filter((a) => a.stepId === step.id);
            const stepTransports = transports.filter((t) => t.stepId === step.id);
            const stepExpenses = expenses.filter((e) => e.stepId === step.id);
            const stepTotalExp = stepExpenses.reduce((sum, e) => {
              return sum + convertCurrency(e.amount || 0, e.currency || 'EUR', displayCurrency);
            }, 0);

            return (
              <div
                key={step.id}
                className="relative bg-[#111820]/90 rounded-2xl border border-[rgba(198,165,106,0.18)] hover:border-[rgba(198,165,106,0.38)] p-5 shadow-lg transition-all group"
              >
                {/* Step Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Step Number Badge */}
                    <div className="w-12 h-12 rounded-xl bg-[#0b0f14] border border-[rgba(198,165,106,0.3)] flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {step.emoji || '📍'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#c6a56a]">
                          Étape {index + 1}
                        </span>
                        <span className="text-[#657079]">·</span>
                        <span className="text-xs text-[#98a2a8]">{step.country}</span>
                        {step.region && (
                          <>
                            <span className="text-[#657079]">·</span>
                            <span className="text-xs text-[#657079]">{step.region}</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-xl font-serif font-bold text-[#edf0eb] mt-0.5">
                        {step.destination}
                      </h3>

                      {/* Dates and Nights */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#98a2a8] mt-1.5">
                        <span className="flex items-center gap-1.5 bg-[#0b0f14] px-2.5 py-1 rounded-md border border-[rgba(198,165,106,0.15)] text-[#edf0eb]">
                          <Calendar className="w-3.5 h-3.5 text-[#c6a56a]" />
                          <span>
                            {new Date(step.arrivalDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            ➔{' '}
                            {new Date(step.departureDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </span>

                        <span className="flex items-center gap-1.5 bg-[#0b0f14] px-2.5 py-1 rounded-md border border-[rgba(198,165,106,0.2)] text-[#eadcc0] font-medium">
                          <Moon className="w-3.5 h-3.5 text-[#c6a56a]" />
                          <span>{step.nights} nuit{step.nights > 1 ? 's' : ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Reorder, Edit, Delete, Google Maps) */}
                  <div className="flex items-center gap-1 self-end sm:self-start bg-[#0b0f14] p-1.5 rounded-xl border border-[rgba(198,165,106,0.18)]">
                    <button
                      onClick={() => handleMoveStep(index, 'up')}
                      disabled={index === 0}
                      title="Monter l'étape"
                      className="p-1.5 rounded-lg text-[#98a2a8] hover:text-[#c6a56a] disabled:opacity-30 disabled:hover:text-[#98a2a8] hover:bg-[#151d26] transition-colors cursor-pointer"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveStep(index, 'down')}
                      disabled={index === steps.length - 1}
                      title="Descendre l'étape"
                      className="p-1.5 rounded-lg text-[#98a2a8] hover:text-[#c6a56a] disabled:opacity-30 disabled:hover:text-[#98a2a8] hover:bg-[#151d26] transition-colors cursor-pointer"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(step)}
                      title="Modifier l'étape"
                      className="p-1.5 rounded-lg text-[#98a2a8] hover:text-[#edf0eb] hover:bg-[#151d26] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteStep(step.id)}
                      title="Supprimer l'étape"
                      className="p-1.5 rounded-lg text-[#b84f4b] hover:text-[#ff7875] hover:bg-[#b84f4b]/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {step.googleMapsUrl && (
                      <a
                        href={step.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvrir dans Google Maps"
                        className="p-1.5 rounded-lg text-[#c6a56a] hover:text-[#eadcc0] hover:bg-[#c6a56a]/15 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Notes and Tips if any */}
                {step.notes && (
                  <div className="mt-3.5 p-3 rounded-xl bg-[#0b0f14]/80 border border-[rgba(198,165,106,0.18)] text-xs text-[#98a2a8] leading-relaxed">
                    <span className="font-semibold text-[#c6a56a] mr-1.5">Note locale :</span>
                    {step.notes}
                  </div>
                )}

                {/* Sub-Items Quick Indicators */}
                <div className="mt-4 pt-3.5 border-t border-[rgba(198,165,106,0.15)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-[#0b0f14] p-2.5 rounded-lg border border-[rgba(198,165,106,0.12)]">
                    <span className="text-[11px] text-[#98a2a8] block">Hébergements</span>
                    <span className="font-semibold text-[#edf0eb]">
                      🏨 {stepHotels.length} {stepHotels.length > 1 ? 'hôtels' : 'hôtel'}
                    </span>
                  </div>
                  <div className="bg-[#0b0f14] p-2.5 rounded-lg border border-[rgba(198,165,106,0.12)]">
                    <span className="text-[11px] text-[#98a2a8] block">Activités</span>
                    <span className="font-semibold text-[#edf0eb]">
                      🎯 {stepActs.length} {stepActs.length > 1 ? 'activités' : 'activité'}
                    </span>
                  </div>
                  <div className="bg-[#0b0f14] p-2.5 rounded-lg border border-[rgba(198,165,106,0.12)]">
                    <span className="text-[11px] text-[#98a2a8] block">Déplacements</span>
                    <span className="font-semibold text-[#edf0eb]">
                      ✈️ {stepTransports.length} trajet{stepTransports.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="bg-[#0b0f14] p-2.5 rounded-lg border border-[rgba(198,165,106,0.12)]">
                    <span className="text-[11px] text-[#98a2a8] block">Dépenses étape</span>
                    <span className="font-semibold text-[#c6a56a]">
                      {stepTotalExp > 0 ? formatMoney(stepTotalExp, displayCurrency) : `0 ${displayCurrency}`}
                    </span>
                  </div>
                </div>

                {/* Transition to next step */}
                {step.transportToNext && (
                  <div className="mt-3.5 flex items-center gap-2 text-xs text-[#eadcc0] bg-[rgba(198,165,106,0.08)] border border-[rgba(198,165,106,0.25)] px-3 py-2 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-[#c6a56a] shrink-0" />
                    <span>Liaison vers étape suivante : {step.transportToNext}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Step Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111820] border border-[rgba(198,165,106,0.3)] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[rgba(198,165,106,0.2)] flex items-center justify-between bg-[#0b0f14]/80">
              <h3 className="text-base font-serif font-bold text-[#edf0eb] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c6a56a]" />
                <span>{editingStep ? 'Modifier l’étape' : 'Ajouter une étape mondiale'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#98a2a8] hover:text-[#edf0eb] p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Worldwide City Autocomplete Suggestion */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#edf0eb]">
                    Rechercher n'importe quelle ville du monde (OpenStreetMap)
                  </label>
                  {isSearchingCities && (
                    <span className="text-[10px] text-[#c6a56a] flex items-center gap-1 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Recherche mondiale...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    placeholder="Ex: Villahermosa, Chengdu, Londres, Pékin, Florence, Tokyo..."
                    className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] rounded-xl px-3.5 py-2.5 text-sm text-[#edf0eb] placeholder-[#657079] focus:outline-none focus:border-[#c6a56a]"
                  />
                  <MapPin className="w-4 h-4 text-[#c6a56a] absolute right-3 top-3 pointer-events-none" />
                </div>

                {destinationQuery.trim() !== '' && (
                  <div className="mt-1 max-h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-1 divide-y divide-slate-800/60 shadow-xl">
                    {citySuggestions.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400">
                        {isSearchingCities ? 'Recherche sur le globe...' : 'Aucune ville trouvée. Vous pouvez saisir les détails ci-dessous.'}
                      </div>
                    ) : (
                      citySuggestions.map((city, idx) => (
                        <button
                          type="button"
                          key={`${city.city}-${city.country}-${city.lat}-${city.lng}-${idx}`}
                          onClick={() => handleSelectCitySuggestion(city)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/80 rounded-lg flex items-center justify-between text-slate-200 transition-colors cursor-pointer group"
                        >
                          <span className="font-medium flex items-center gap-2">
                            <span className="text-base">{city.emoji}</span>
                            <span className="group-hover:text-[#c6a56a] transition-colors">{city.city}</span>
                            <span className="text-slate-400 font-normal">({city.country})</span>
                          </span>
                          <span className="text-[10px] text-slate-500">{city.region}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Destination Name with Auto Emoji */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#edf0eb]">
                    Nom de la destination / ville *
                  </label>
                  <span className="text-xs text-[#c6a56a] font-mono flex items-center gap-1.5 bg-[#0b0f14] px-2.5 py-0.5 rounded-full border border-[rgba(198,165,106,0.25)]">
                    <span>Icône auto :</span>
                    <strong className="text-sm">{getAutoEmojiForDestination(`${destinationName} ${country}`)}</strong>
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  placeholder="Ex: Florence, Rome, Kyoto, Pékin, Santorin, Séoul, Lisbonne..."
                  className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] focus:border-[#c6a56a] rounded-xl px-3.5 py-2.5 text-sm text-[#edf0eb] placeholder-[#657079] focus:outline-none"
                />
              </div>

              {/* Country & Region */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#edf0eb] mb-1">Pays *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ex: Italie, Japon, France, Chine, Espagne..."
                    className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] focus:border-[#c6a56a] rounded-xl px-3.5 py-2 text-sm text-[#edf0eb] placeholder-[#657079] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                    Région / État (facultatif)
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Ex: Toscane, Kansai, Guangxi, Andalousie..."
                    className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] focus:border-[#c6a56a] rounded-xl px-3.5 py-2 text-sm text-[#edf0eb] placeholder-[#657079] focus:outline-none"
                  />
                </div>
              </div>

              {/* Arrival & Departure & Nights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <ShahrabadDatePicker
                    label="Date d’arrivée"
                    required
                    value={arrivalDate}
                    onChange={handleArrivalDateChange}
                  />
                </div>
                <div>
                  <ShahrabadDatePicker
                    label="Date de départ"
                    required
                    value={departureDate}
                    min={arrivalDate}
                    defaultMonthDate={arrivalDate}
                    onChange={handleDepartureDateChange}
                    align="right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                    Nombre de nuits
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] rounded-xl px-3 py-2 text-sm text-[#edf0eb] focus:border-[#c6a56a] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Transport to Next */}
              <div>
                <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                  Moyen de transport pour l’étape suivante
                </label>
                <input
                  type="text"
                  value={transportToNext}
                  onChange={(e) => setTransportToNext(e.target.value)}
                  placeholder="Ex: Train TGV Frecciarossa (1h30), Vol direct AF892, Voiture de location..."
                  className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] rounded-xl px-3.5 py-2 text-sm text-[#edf0eb] placeholder-[#657079] focus:outline-none focus:border-[#c6a56a]"
                />
              </div>

              {/* Personal Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                  Notes & recommandations personnelles
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Conseils de réservation, quartiers à privilégier, formalités locales..."
                  className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] rounded-xl px-3.5 py-2 text-xs text-[#edf0eb] placeholder-[#657079] focus:outline-none focus:border-[#c6a56a]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 border-t border-[rgba(198,165,106,0.2)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#98a2a8] hover:text-[#edf0eb] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] hover:brightness-110 text-[#0b0f14] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {editingStep ? 'Enregistrer les modifications' : 'Ajouter cette étape'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
