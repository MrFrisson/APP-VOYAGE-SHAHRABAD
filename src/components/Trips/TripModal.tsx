import React, { useState, useEffect } from 'react';
import { Trip } from '../../types/travel';
import { getAutoCoverForDestination } from '../../data/worldDestinations';
import { ShahrabadDatePicker } from '../Common/ShahrabadDatePicker';
import { Compass, Image as ImageIcon } from 'lucide-react';

interface TripModalProps {
  isOpen: boolean;
  editingTrip: Trip | null;
  onClose: () => void;
  onSave: (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  editingTrip,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(editingTrip?.title || '');
  const [description, setDescription] = useState(editingTrip?.description || '');
  const [countriesInput, setCountriesInput] = useState(
    editingTrip?.countries.join(', ') || ''
  );
  const [coverImage, setCoverImage] = useState(
    editingTrip?.coverImage || getAutoCoverForDestination('')
  );
  const [startDate, setStartDate] = useState(
    editingTrip?.startDate || new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    editingTrip?.endDate ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [currency, setCurrency] = useState(editingTrip?.currency || 'EUR');
  const [totalBudget, setTotalBudget] = useState<number>(editingTrip?.totalBudget || 3000);

  // Auto-detect photo according to country / destination in real time
  useEffect(() => {
    const searchString = `${countriesInput} ${title}`.trim();
    if (searchString) {
      const detected = getAutoCoverForDestination(searchString);
      setCoverImage(detected);
    }
  }, [countriesInput, title]);

  // Reset when opening
  useEffect(() => {
    if (editingTrip) {
      setTitle(editingTrip.title);
      setDescription(editingTrip.description);
      setCountriesInput(editingTrip.countries.join(', '));
      setCoverImage(editingTrip.coverImage || getAutoCoverForDestination(editingTrip.title));
      setStartDate(editingTrip.startDate);
      setEndDate(editingTrip.endDate);
      setCurrency(editingTrip.currency);
      setTotalBudget(editingTrip.totalBudget);
    } else {
      setTitle('');
      setDescription('');
      setCountriesInput('');
      setCoverImage(getAutoCoverForDestination(''));
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
      setCurrency('EUR');
      setTotalBudget(3000);
    }
  }, [editingTrip, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const countries = countriesInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    onSave({
      title: title.trim(),
      description: description.trim(),
      coverImage: coverImage.trim() || undefined,
      startDate,
      endDate,
      currency,
      totalBudget: Math.max(0, totalBudget),
      countries: countries.length > 0 ? countries : ['Monde'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#111820] border border-[rgba(198,165,106,0.3)] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header without any star icon */}
        <div className="p-4 border-b border-[rgba(198,165,106,0.2)] flex items-center justify-between bg-[#0b0f14]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#c6a56a]" />
            <h3 className="text-base font-serif font-bold text-[#edf0eb]">
              {editingTrip ? 'Modifier le voyage' : 'Nouveau voyage — Shahrabad'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#98a2a8] hover:text-[#edf0eb] p-1 text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Automatic Photo Banner Preview */}
          <div className="relative rounded-xl overflow-hidden h-32 border border-[rgba(198,165,106,0.3)] shadow-inner">
            <img
              src={coverImage}
              alt="Photo automatique"
              className="w-full h-full object-cover transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/30 to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
              <span className="text-[#eadcc0] font-mono text-[11px] flex items-center gap-1.5 bg-[#0b0f14]/85 px-2.5 py-1 rounded-full border border-[rgba(198,165,106,0.3)] backdrop-blur-sm">
                <ImageIcon className="w-3.5 h-3.5 text-[#c6a56a]" />
                Photo adaptée automatiquement à votre destination
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
              Nom du voyage *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Escapade Toscane, Traversée du Japon, Tour du Monde..."
              className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] focus:border-[#c6a56a] rounded-xl px-3.5 py-2.5 text-sm text-[#edf0eb] placeholder-[#657079] focus:outline-none"
            />
          </div>

          {/* Destination / Country input */}
          <div>
            <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
              Pays ou destinations *
            </label>
            <input
              type="text"
              required
              value={countriesInput}
              onChange={(e) => setCountriesInput(e.target.value)}
              placeholder="Ex: Italie, Japon, Canada, Islande, Grèce, Maroc, France..."
              className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] focus:border-[#c6a56a] rounded-xl px-3.5 py-2 text-sm text-[#edf0eb] placeholder-[#657079] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
              Esprit ou notes du voyage
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Un carnet de route pour garder la mémoire des étapes et du temps..."
              className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] focus:border-[#c6a56a] rounded-xl px-3.5 py-2 text-xs text-[#edf0eb] placeholder-[#657079] focus:outline-none"
            />
          </div>

          {/* Custom Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <ShahrabadDatePicker
                label="Date de départ"
                required
                value={startDate}
                onChange={setStartDate}
              />
            </div>
            <div>
              <ShahrabadDatePicker
                label="Date de retour"
                required
                value={endDate}
                onChange={setEndDate}
              />
            </div>
          </div>

          {/* Currency & Budget */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#0b0f14] rounded-xl border border-[rgba(198,165,106,0.2)]">
            <div>
              <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                Budget prévisionnel
              </label>
              <input
                type="number"
                min="0"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full bg-[#111820] border border-[rgba(198,165,106,0.25)] rounded-lg px-2.5 py-1.5 text-xs text-[#edf0eb] focus:border-[#c6a56a] focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                Devise d'origine du budget
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#111820] border border-[rgba(198,165,106,0.25)] rounded-lg px-2.5 py-1.5 text-xs text-[#c6a56a] font-bold focus:border-[#c6a56a] focus:outline-none"
              >
                <option value="EUR">Euro (EUR · €)</option>
                <option value="CNY">Yuan Chinois (CNY · ¥)</option>
                <option value="USD">Dollar US (USD · $)</option>
                <option value="AUD">Dollar Australien (AUD · A$)</option>
                <option value="JPY">Yen Japonais (JPY · ¥)</option>
                <option value="GBP">Livre Sterling (GBP · £)</option>
                <option value="CHF">Franc Suisse (CHF)</option>
              </select>
            </div>
            <div className="col-span-2 text-[10px] text-[#98a2a8]">
              Tous les prix et budgets se convertissent automatiquement dans l'onglet Budget selon votre choix de devise.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-[rgba(198,165,106,0.2)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#98a2a8] hover:text-[#edf0eb] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] hover:brightness-110 text-[#0b0f14] font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {editingTrip ? 'Enregistrer les modifications' : 'Créer le voyage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
