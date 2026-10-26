import React, { useState } from 'react';
import { Accommodation, Step, PaymentStatus, BookingStatus } from '../../types/travel';
import { buildGoogleMapsUrl } from '../../data/worldDestinations';
import { convertCurrency, formatPriceWithConversion, formatMoney } from '../../services/currency';
import {
  Building2,
  Calendar,
  CreditCard,
  ExternalLink,
  MapPin,
  Moon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface AccommodationsViewProps {
  tripId: string;
  steps: Step[];
  accommodations: Accommodation[];
  displayCurrency: string;
  onAddAccommodation: (acc: Omit<Accommodation, 'id' | 'tripId'>) => void;
  onUpdateAccommodation: (acc: Accommodation) => void;
  onDeleteAccommodation: (accId: string) => void;
}

export const AccommodationsView: React.FC<AccommodationsViewProps> = ({
  steps,
  accommodations,
  displayCurrency,
  onAddAccommodation,
  onUpdateAccommodation,
  onDeleteAccommodation,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Accommodation | null>(null);

  // Form states
  const [stepId, setStepId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [nights, setNights] = useState<number>(3);
  const [priceTotal, setPriceTotal] = useState<number>(0);
  const [currency, setCurrency] = useState('EUR');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('prevu');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('confirme');
  const [bookingRef, setBookingRef] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);

  const openAddModal = () => {
    setEditingAcc(null);
    const firstStep = steps[0];
    setStepId(firstStep ? firstStep.id : '');
    setName('');
    setAddress('');
    setCity(firstStep ? firstStep.destination : '');
    setCountry(firstStep ? firstStep.country : '');
    setCheckIn(firstStep ? firstStep.arrivalDate : new Date().toISOString().slice(0, 10));
    setCheckOut(firstStep ? firstStep.departureDate : new Date().toISOString().slice(0, 10));
    setNights(firstStep ? firstStep.nights : 3);
    setPriceTotal(0);
    setCurrency('EUR');
    setPaymentStatus('prevu');
    setAmountPaid(0);
    setBookingStatus('confirme');
    setBookingRef('');
    setBookingUrl('');
    setNotes('');
    setLat(firstStep ? firstStep.lat : undefined);
    setLng(firstStep ? firstStep.lng : undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Accommodation) => {
    setEditingAcc(acc);
    setStepId(acc.stepId || '');
    setName(acc.name);
    setAddress(acc.address);
    setCity(acc.city);
    setCountry(acc.country);
    setCheckIn(acc.checkIn);
    setCheckOut(acc.checkOut);
    setNights(acc.nights);
    setPriceTotal(acc.priceTotal);
    setCurrency(acc.currency);
    setPaymentStatus(acc.paymentStatus);
    setAmountPaid(acc.amountPaid);
    setBookingStatus(acc.bookingStatus);
    setBookingRef(acc.bookingRef || '');
    setBookingUrl(acc.bookingUrl || '');
    setNotes(acc.notes || '');
    setLat(acc.lat);
    setLng(acc.lng);
    setIsModalOpen(true);
  };

  const handleStepSelect = (sId: string) => {
    setStepId(sId);
    const chosenStep = steps.find((s) => s.id === sId);
    if (chosenStep) {
      setCity(chosenStep.destination);
      setCountry(chosenStep.country);
      setCheckIn(chosenStep.arrivalDate);
      setCheckOut(chosenStep.departureDate);
      setNights(chosenStep.nights);
      if (chosenStep.lat && chosenStep.lng) {
        setLat(chosenStep.lat);
        setLng(chosenStep.lng);
      }
    }
  };

  const handleDatesChange = (inDate: string, outDate: string) => {
    setCheckIn(inDate);
    setCheckOut(outDate);
    if (inDate && outDate) {
      const diff = Math.round(
        (new Date(outDate).getTime() - new Date(inDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff > 0) setNights(diff);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const gMap = buildGoogleMapsUrl(`${name} ${address} ${city}`, lat, lng);

    if (editingAcc) {
      onUpdateAccommodation({
        ...editingAcc,
        stepId: stepId || undefined,
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        checkIn,
        checkOut,
        nights: Math.max(1, nights),
        priceTotal,
        currency,
        paymentStatus,
        amountPaid: paymentStatus === 'paye' ? priceTotal : Math.min(amountPaid, priceTotal),
        bookingStatus,
        bookingRef: bookingRef.trim() || undefined,
        bookingUrl: bookingUrl.trim() || undefined,
        googleMapsUrl: gMap,
        notes: notes.trim() || undefined,
        lat,
        lng,
      });
    } else {
      onAddAccommodation({
        stepId: stepId || undefined,
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        checkIn,
        checkOut,
        nights: Math.max(1, nights),
        priceTotal,
        currency,
        paymentStatus,
        amountPaid: paymentStatus === 'paye' ? priceTotal : Math.min(amountPaid, priceTotal),
        bookingStatus,
        bookingRef: bookingRef.trim() || undefined,
        bookingUrl: bookingUrl.trim() || undefined,
        googleMapsUrl: gMap,
        notes: notes.trim() || undefined,
        lat,
        lng,
      });
    }

    setIsModalOpen(false);
  };

  const totalCost = accommodations.reduce(
    (sum, a) => sum + convertCurrency(a.priceTotal, a.currency, displayCurrency),
    0
  );
  const totalPaid = accommodations.reduce(
    (sum, a) =>
      sum +
      convertCurrency(
        a.paymentStatus === 'paye' ? a.priceTotal : a.amountPaid,
        a.currency,
        displayCurrency
      ),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111820] rounded-2xl border border-[rgba(198,165,106,0.22)] shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#c6a56a]" />
            <h2 className="text-xl font-serif font-bold text-[#edf0eb]">
              Hébergements & Réservations
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#98a2a8] mt-1 font-mono">
            <span>{accommodations.length} établissement{accommodations.length > 1 ? 's' : ''}</span>
            <span aria-hidden="true">·</span>
            <span>Total : {formatMoney(totalCost, displayCurrency)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#79b59b] font-medium">Réglé : {formatMoney(totalPaid, displayCurrency)}</span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-950/30 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un hébergement</span>
        </button>
      </div>

      {/* Accommodations Grid */}
      {accommodations.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-300">Aucun hébergement enregistré</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Ajoutez vos hôtels, cours traditionnelles, riads ou appartements pour chaque étape de votre périple.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs"
          >
            Ajouter un premier hôtel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accommodations.map((hotel) => {
            const step = steps.find((s) => s.id === hotel.stepId);
            const remaining = Math.max(0, hotel.priceTotal - hotel.amountPaid);

            return (
              <div
                key={hotel.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800/90 hover:border-slate-700 p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                          {hotel.city} ({hotel.country})
                        </span>
                        {step && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="text-xs text-slate-400">{step.destination}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-serif font-bold text-slate-100 mt-1">
                        {hotel.name}
                      </h3>
                      {hotel.address && (
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{hotel.address}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => openEditModal(hotel)}
                        title="Modifier"
                        className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAccommodation(hotel.id)}
                        title="Supprimer"
                        className="p-1.5 text-rose-400/80 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dates & Duration */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {new Date(hotel.checkIn).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        ➔{' '}
                        {new Date(hotel.checkOut).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{hotel.nights} nuit{hotel.nights > 1 ? 's' : ''}</span>
                    </span>
                    {hotel.bookingRef && (
                      <span className="bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-slate-400 text-[11px]">
                        Réf : <strong className="text-slate-200">{hotel.bookingRef}</strong>
                      </span>
                    )}
                  </div>

                  {/* Payment & Financial status with global currency conversion */}
                  {(() => {
                    const priceConv = formatPriceWithConversion(hotel.priceTotal, hotel.currency, displayCurrency);
                    const paidConv = formatPriceWithConversion(hotel.amountPaid, hotel.currency, displayCurrency, false);
                    const remConv = formatPriceWithConversion(remaining, hotel.currency, displayCurrency, false);

                    return (
                      <div className="mt-3.5 p-3 rounded-xl bg-[#0b0f14] border border-[rgba(198,165,106,0.2)] text-xs flex items-center justify-between">
                        <div>
                          <span className="text-[#98a2a8] text-[11px] block">Tarif total du séjour</span>
                          <span className="text-base font-bold text-[#edf0eb]">
                            {priceConv.formatted}
                          </span>
                          {priceConv.originalText && (
                            <span className="text-[10px] text-[#98a2a8] block font-mono">
                              {priceConv.originalText}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          {hotel.paymentStatus === 'paye' ? (
                            <div className="flex items-center gap-1.5 text-[#79b59b] font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Intégralement payé</span>
                            </div>
                          ) : hotel.paymentStatus === 'partiel' ? (
                            <div>
                              <div className="flex items-center gap-1 text-[#c6a56a] font-semibold justify-end">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Acompte {paidConv.formatted}</span>
                              </div>
                              <span className="text-[11px] text-[#98a2a8]">
                                Reste à payer : {remConv.formatted}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[#b84f4b] font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              <span>À régler ({priceConv.formatted})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Notes */}
                  {hotel.notes && (
                    <p className="mt-3 text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50 leading-relaxed">
                      {hotel.notes}
                    </p>
                  )}
                </div>

                {/* External links: Google Maps & Booking */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  {hotel.bookingUrl ? (
                    <a
                      href={hotel.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Gérer la réservation</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500">Statut : {hotel.bookingStatus}</span>
                  )}

                  <a
                    href={hotel.googleMapsUrl || buildGoogleMapsUrl(`${hotel.name} ${hotel.city}`, hotel.lat, hotel.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Accommodation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>{editingAcc ? 'Modifier l’hébergement' : 'Ajouter un hébergement'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Associate Step */}
              {steps.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Étape associée
                  </label>
                  <select
                    value={stepId}
                    onChange={(e) => handleStepSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Sans étape spécifique --</option>
                    {steps.map((s, i) => (
                      <option key={s.id} value={s.id}>
                        Étape {i + 1} : {s.destination} ({s.country})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hotel Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom de l’établissement *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: The Peninsula, Hotel Artemide, Riad Yasmine..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Address, City, Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ville *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Rome, Florence, Shanghai..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pays *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ex: Italie, Chine, Japon..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Via Nazionale 22, 00184 Rome"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Dates & Nights */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Arrivée</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => handleDatesChange(e.target.value, checkOut)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Départ</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => handleDatesChange(checkIn, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nuits</label>
                  <input
                    type="number"
                    min="1"
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Pricing & Payment Status */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prix total du séjour
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={priceTotal}
                      onChange={(e) => setPriceTotal(Number(e.target.value))}
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
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Statut du paiement
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    <option value="prevu">Prévu (estimation)</option>
                    <option value="a_payer">À payer (sur place)</option>
                    <option value="partiel">Partiellement payé (acompte)</option>
                    <option value="paye">Entièrement payé</option>
                  </select>
                </div>

                {paymentStatus === 'partiel' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-amber-400 mb-1">
                      Montant déjà payé (acompte)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={priceTotal}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                )}
              </div>

              {/* Booking Reference & URL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Numéro de réservation
                  </label>
                  <input
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="Ex: RES-89204"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lien site de réservation
                  </label>
                  <input
                    type="url"
                    value={bookingUrl}
                    onChange={(e) => setBookingUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Heure limite d'arrivée, code d'accès, petit déjeuner inclus..."
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                >
                  {editingAcc ? 'Enregistrer' : 'Ajouter l’hébergement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
