import React, { useState } from 'react';
import { Activity, Step, ActivityStatus, ActivityCategory } from '../../types/travel';
import { buildGoogleMapsUrl } from '../../data/worldDestinations';
import { convertCurrency, formatPriceWithConversion, formatMoney } from '../../services/currency';
import {
  Calendar,
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Bookmark,
  Check,
} from 'lucide-react';

interface ActivitiesViewProps {
  tripId: string;
  steps: Step[];
  activities: Activity[];
  displayCurrency: string;
  onAddActivity: (activity: Omit<Activity, 'id' | 'tripId'>) => void;
  onUpdateActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
}

const CATEGORIES: ActivityCategory[] = [
  'Culture',
  'Gastronomie',
  'Nature',
  'Visite',
  'Aventure',
  'Détente',
  'Shopping',
  'Spectacle',
  'Autre',
];

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  steps,
  activities,
  displayCurrency,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Form states
  const [stepId, setStepId] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('EUR');
  const [status, setStatus] = useState<ActivityStatus>('reserve');
  const [category, setCategory] = useState<ActivityCategory>('Culture');
  const [bookingUrl, setBookingUrl] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);

  const openAddModal = () => {
    setEditingActivity(null);
    const firstStep = steps[0];
    setStepId(firstStep?.id || '');
    setName('');
    setDate(firstStep?.arrivalDate || new Date().toISOString().slice(0, 10));
    setTime('10:00');
    setAddress('');
    setDescription('');
    setPrice(0);
    setCurrency('EUR');
    setStatus('reserve');
    setCategory('Culture');
    setBookingUrl('');
    setLat(firstStep?.lat);
    setLng(firstStep?.lng);
    setIsModalOpen(true);
  };

  const openEditModal = (act: Activity) => {
    setEditingActivity(act);
    setStepId(act.stepId || '');
    setName(act.name);
    setDate(act.date);
    setTime(act.time || '');
    setAddress(act.address || '');
    setDescription(act.description || '');
    setPrice(act.price);
    setCurrency(act.currency);
    setStatus(act.status);
    setCategory(act.category);
    setBookingUrl(act.bookingUrl || '');
    setLat(act.lat);
    setLng(act.lng);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const gMap = buildGoogleMapsUrl(name, lat, lng);

    if (editingActivity) {
      onUpdateActivity({
        ...editingActivity,
        stepId: stepId || undefined,
        name: name.trim(),
        date,
        time: time || undefined,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        price,
        currency,
        status,
        category,
        bookingUrl: bookingUrl.trim() || undefined,
        googleMapsUrl: gMap,
        lat,
        lng,
      });
    } else {
      onAddActivity({
        stepId: stepId || undefined,
        name: name.trim(),
        date,
        time: time || undefined,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        price,
        currency,
        status,
        category,
        bookingUrl: bookingUrl.trim() || undefined,
        googleMapsUrl: gMap,
        lat,
        lng,
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (act: Activity) => {
    const sequence: ActivityStatus[] = ['idee', 'a_reserver', 'reserve', 'effectue'];
    const nextIdx = (sequence.indexOf(act.status) + 1) % sequence.length;
    onUpdateActivity({
      ...act,
      status: sequence[nextIdx],
    });
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (statusFilter !== 'all' && act.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && act.category !== categoryFilter) return false;
    return true;
  });

  // Group by Date
  const groupedByDate: Record<string, Activity[]> = {};
  filteredActivities.forEach((act) => {
    if (!groupedByDate[act.date]) groupedByDate[act.date] = [];
    groupedByDate[act.date].push(act);
  });
  const sortedDates = Object.keys(groupedByDate).sort();

  const getStatusBadge = (st: ActivityStatus) => {
    switch (st) {
      case 'reserve':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            <Check className="w-3 h-3" /> Réservé
          </span>
        );
      case 'a_reserver':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" /> À réserver
          </span>
        );
      case 'idee':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md">
            <Bookmark className="w-3 h-3" /> Idée / Envie
          </span>
        );
      case 'effectue':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3" /> Visité / Fait
          </span>
        );
    }
  };

  const totalActivitiesCost = activities.reduce((sum, a) => {
    return sum + convertCurrency(a.price || 0, a.currency || 'EUR', displayCurrency);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-serif font-bold text-slate-100">
              Activités & Planning Jour par Jour
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{activities.length} activité{activities.length > 1 ? 's' : ''} planifiée{activities.length > 1 ? 's' : ''}</span>
            <span aria-hidden="true">·</span>
            <span>Total : {formatMoney(totalActivitiesCost, displayCurrency)}</span>
            <span aria-hidden="true">·</span>
            <span>{activities.filter((a) => a.status === 'reserve').length} réservées</span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/30 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une activité</span>
        </button>
      </div>

      {/* Filter Bar (Zero-Pill interactive segmented controls) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs">
        {/* Status segment */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous statuts
          </button>
          <button
            onClick={() => setStatusFilter('reserve')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'reserve'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Réservé
          </button>
          <button
            onClick={() => setStatusFilter('a_reserver')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'a_reserver'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            À réserver
          </button>
          <button
            onClick={() => setStatusFilter('idee')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'idee'
                ? 'bg-slate-700/60 text-slate-200 border border-slate-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Idées
          </button>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs hidden sm:inline">Catégorie :</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily Grouped Activities */}
      {sortedDates.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-300">Aucune activité trouvée</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Ajoutez des monuments, musées, excursions, repas gastronomiques ou balades à votre programme.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs"
          >
            Ajouter une 1ère activité
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dStr) => {
            const dayActs = groupedByDate[dStr];
            const dateObj = new Date(dStr);
            const dateFormatted = dateObj.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <div key={dStr} className="space-y-3">
                {/* Day Header Marker */}
                <div className="flex items-center gap-2.5 px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 capitalize">
                    {dateFormatted}
                  </h3>
                  <span className="text-xs text-slate-500 font-normal">
                    ({dayActs.length} activité{dayActs.length > 1 ? 's' : ''})
                  </span>
                </div>

                {/* Day Activities Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {dayActs.map((act) => {
                    const step = steps.find((s) => s.id === act.stepId);

                    return (
                      <div
                        key={act.id}
                        className="bg-slate-900/90 rounded-2xl border border-slate-800/90 hover:border-slate-700 p-4 shadow-lg flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                  {act.category}
                                </span>
                                {step && (
                                  <>
                                    <span className="text-slate-600">·</span>
                                    <span className="text-xs text-slate-400">{step.destination}</span>
                                  </>
                                )}
                                {act.time && (
                                  <>
                                    <span className="text-slate-600">·</span>
                                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {act.time}
                                    </span>
                                  </>
                                )}
                              </div>

                              <h4 className="text-base font-serif font-bold text-slate-100">
                                {act.name}
                              </h4>
                            </div>

                            <button
                              onClick={() => handleToggleStatus(act)}
                              title="Cliquer pour changer le statut"
                              className="shrink-0 transition-transform active:scale-95"
                            >
                              {getStatusBadge(act.status)}
                            </button>
                          </div>

                          {act.address && (
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{act.address}</span>
                            </p>
                          )}

                          {act.description && (
                            <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                              {act.description}
                            </p>
                          )}
                        </div>

                        {/* Price & Actions */}
                        <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            {act.price > 0 ? (
                              (() => {
                                const pConv = formatPriceWithConversion(act.price, act.currency || 'EUR', displayCurrency);
                                return (
                                  <div>
                                    <span className="font-semibold text-slate-200 block">
                                      {pConv.formatted}
                                    </span>
                                    {pConv.originalText && (
                                      <span className="text-[10px] text-slate-400 font-mono block">
                                        {pConv.originalText}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()
                            ) : (
                              <span className="font-semibold text-emerald-400">Gratuit</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                            <button
                              onClick={() => openEditModal(act)}
                              title="Modifier"
                              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteActivity(act.id)}
                              title="Supprimer"
                              className="p-1.5 text-rose-400/80 hover:text-rose-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {act.bookingUrl && (
                              <a
                                href={act.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Site officiel"
                                className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <a
                              href={act.googleMapsUrl || buildGoogleMapsUrl(act.name, act.lat, act.lng)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Google Maps"
                              className="p-1.5 text-amber-400/80 hover:text-amber-300 transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{editingActivity ? 'Modifier l’activité' : 'Ajouter une activité'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Associate Step & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Étape / Ville
                  </label>
                  <select
                    value={stepId}
                    onChange={(e) => setStepId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Sans étape --</option>
                    {steps.map((s, i) => (
                      <option key={s.id} value={s.id}>
                        Étape {i + 1} : {s.destination}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Catégorie d'activité
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Activity Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom de l’activité *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Cité Interdite, Colisée, Croisière en bateau..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Heure (facultatif)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Status & Price */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Statut</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    <option value="reserve">✅ Réservé</option>
                    <option value="a_reserver">⏳ À réserver</option>
                    <option value="idee">💡 Idée / Envie</option>
                    <option value="effectue">🎉 Fait / Visité</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prix par personne / total
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                    >
                      <option value="EUR">EUR</option>
                      <option value="CNY">CNY</option>
                      <option value="USD">USD</option>
                      <option value="AUD">AUD</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address / Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adresse ou point de rendez-vous
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: 4 Jingshan Front St, Dongcheng..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & conseils
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détails de la visite, créneau horaire, guide requis..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lien réservation ou site officiel
                </label>
                <input
                  type="url"
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  {editingActivity ? 'Enregistrer' : 'Ajouter l’activité'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
