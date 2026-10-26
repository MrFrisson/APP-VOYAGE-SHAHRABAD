import React, { useState } from 'react';
import { Transport, Step, TransportType, PaymentStatus } from '../../types/travel';
import { buildGoogleMapsUrl } from '../../data/worldDestinations';
import { convertCurrency, formatPriceWithConversion, formatMoney } from '../../services/currency';
import {
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  Navigation2,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface TransportsViewProps {
  tripId: string;
  steps: Step[];
  transports: Transport[];
  displayCurrency: string;
  onAddTransport: (transport: Omit<Transport, 'id' | 'tripId'>) => void;
  onUpdateTransport: (transport: Transport) => void;
  onDeleteTransport: (transportId: string) => void;
}

export const TransportsView: React.FC<TransportsViewProps> = ({
  steps,
  transports,
  displayCurrency,
  onAddTransport,
  onUpdateTransport,
  onDeleteTransport,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null);

  // Form states
  const [stepId, setStepId] = useState('');
  const [type, setType] = useState<TransportType>('train');
  const [departurePlace, setDeparturePlace] = useState('');
  const [arrivalPlace, setArrivalPlace] = useState('');
  const [departureDateTime, setDepartureDateTime] = useState('');
  const [arrivalDateTime, setArrivalDateTime] = useState('');
  const [carrier, setCarrier] = useState('');
  const [transportNumber, setTransportNumber] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('EUR');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('prevu');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [bookingUrl, setBookingUrl] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingTransport(null);
    setStepId(steps[0]?.id || '');
    setType('train');
    setDeparturePlace('');
    setArrivalPlace('');
    setDepartureDateTime(new Date().toISOString().slice(0, 16));
    setArrivalDateTime('');
    setCarrier('');
    setTransportNumber('');
    setBookingRef('');
    setPrice(0);
    setCurrency('EUR');
    setPaymentStatus('prevu');
    setAmountPaid(0);
    setBookingUrl('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transport) => {
    setEditingTransport(t);
    setStepId(t.stepId || '');
    setType(t.type);
    setDeparturePlace(t.departurePlace);
    setArrivalPlace(t.arrivalPlace);
    setDepartureDateTime(t.departureDateTime);
    setArrivalDateTime(t.arrivalDateTime || '');
    setCarrier(t.carrier || '');
    setTransportNumber(t.transportNumber || '');
    setBookingRef(t.bookingRef || '');
    setPrice(t.price);
    setCurrency(t.currency);
    setPaymentStatus(t.paymentStatus);
    setAmountPaid(t.amountPaid);
    setBookingUrl(t.bookingUrl || '');
    setNotes(t.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departurePlace.trim() || !arrivalPlace.trim()) return;

    if (editingTransport) {
      onUpdateTransport({
        ...editingTransport,
        stepId: stepId || undefined,
        type,
        departurePlace: departurePlace.trim(),
        arrivalPlace: arrivalPlace.trim(),
        departureDateTime,
        arrivalDateTime: arrivalDateTime || undefined,
        carrier: carrier.trim() || undefined,
        transportNumber: transportNumber.trim() || undefined,
        bookingRef: bookingRef.trim() || undefined,
        price,
        currency,
        paymentStatus,
        amountPaid: paymentStatus === 'paye' ? price : Math.min(amountPaid, price),
        bookingUrl: bookingUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddTransport({
        stepId: stepId || undefined,
        type,
        departurePlace: departurePlace.trim(),
        arrivalPlace: arrivalPlace.trim(),
        departureDateTime,
        arrivalDateTime: arrivalDateTime || undefined,
        carrier: carrier.trim() || undefined,
        transportNumber: transportNumber.trim() || undefined,
        bookingRef: bookingRef.trim() || undefined,
        price,
        currency,
        paymentStatus,
        amountPaid: paymentStatus === 'paye' ? price : Math.min(amountPaid, price),
        bookingUrl: bookingUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const getTransportIcon = (tType: TransportType) => {
    switch (tType) {
      case 'flight':
        return <Plane className="w-5 h-5 text-rose-400" />;
      case 'train':
        return <Train className="w-5 h-5 text-amber-400" />;
      case 'bus':
        return <Bus className="w-5 h-5 text-emerald-400" />;
      case 'car_rental':
      case 'taxi':
        return <Car className="w-5 h-5 text-blue-400" />;
      case 'ferry':
        return <Ship className="w-5 h-5 text-cyan-400" />;
      default:
        return <Navigation2 className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTransportLabel = (tType: TransportType) => {
    switch (tType) {
      case 'flight':
        return 'Vol commercial';
      case 'train':
        return 'Train / TGV';
      case 'bus':
        return 'Bus / Autocar';
      case 'car_rental':
        return 'Voiture de location';
      case 'taxi':
        return 'Taxi / Transfert privé';
      case 'ferry':
        return 'Ferry / Bateau';
      case 'metro':
        return 'Métro / Transport local';
      default:
        return 'Déplacement';
    }
  };

  const totalTransportsCost = transports.reduce((sum, t) => {
    return sum + convertCurrency(t.price || 0, t.currency || 'EUR', displayCurrency);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-serif font-bold text-slate-100">
              Transports & Déplacements
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{transports.length} trajet{transports.length > 1 ? 's' : ''} planifié{transports.length > 1 ? 's' : ''}</span>
            <span aria-hidden="true">·</span>
            <span>Total : {formatMoney(totalTransportsCost, displayCurrency)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-400 font-medium">Vols, trains & transferts mondiaux</span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-950/30 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un transport</span>
        </button>
      </div>

      {/* Transports List */}
      {transports.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Plane className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-300">Aucun transport renseigné</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Ajoutez vos vols internationaux, trains à grande vitesse, bus ou transferts pour chaque transition.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold text-xs"
          >
            Ajouter un 1er transport
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {transports.map((t) => {
            const step = steps.find((s) => s.id === t.stepId);
            const depDateFormatted = t.departureDateTime
              ? new Date(t.departureDateTime).toLocaleString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';
            const arrDateFormatted = t.arrivalDateTime
              ? new Date(t.arrivalDateTime).toLocaleString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={t.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800/90 hover:border-slate-700 p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                    {getTransportIcon(t.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                        {getTransportLabel(t.type)}
                      </span>
                      {t.carrier && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs font-semibold text-slate-200">{t.carrier}</span>
                        </>
                      )}
                      {t.transportNumber && (
                        <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-slate-800">
                          {t.transportNumber}
                        </span>
                      )}
                      {step && (
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          ({step.destination})
                        </span>
                      )}
                    </div>

                    {/* Route Line */}
                    <div className="flex items-center gap-2 text-base font-bold text-slate-100 flex-wrap">
                      <span>{t.departurePlace}</span>
                      <span className="text-amber-400">➔</span>
                      <span>{t.arrivalPlace}</span>
                    </div>

                    {/* Times & Booking Ref */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                      {depDateFormatted && (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>Départ : {depDateFormatted}</span>
                        </span>
                      )}
                      {arrDateFormatted && (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Arrivée : {arrDateFormatted}</span>
                        </span>
                      )}
                      {t.bookingRef && (
                        <span className="text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                          Réf : <strong className="text-slate-200">{t.bookingRef}</strong>
                        </span>
                      )}
                    </div>

                    {t.notes && (
                      <p className="text-xs text-slate-400 italic pt-1">{t.notes}</p>
                    )}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {(() => {
                    const priceConv = formatPriceWithConversion(t.price, t.currency || 'EUR', displayCurrency);
                    const paidConv = formatPriceWithConversion(t.amountPaid || 0, t.currency || 'EUR', displayCurrency, false);
                    return (
                      <div className="text-left md:text-right">
                        <span className="text-sm font-bold text-slate-100 block">
                          {t.price > 0 ? priceConv.formatted : 'Inclus'}
                        </span>
                        {priceConv.originalText && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {priceConv.originalText}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {t.paymentStatus === 'paye' ? (
                            <span className="text-emerald-400 flex items-center md:justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Réglé
                            </span>
                          ) : t.paymentStatus === 'partiel' ? (
                            <span className="text-amber-400">Acompte {paidConv.formatted}</span>
                          ) : (
                            <span className="text-rose-400 flex items-center md:justify-end gap-1">
                              <AlertCircle className="w-3 h-3" /> À payer
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => openEditModal(t)}
                      title="Modifier"
                      className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTransport(t.id)}
                      title="Supprimer"
                      className="p-2 text-rose-400/80 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {t.bookingUrl && (
                      <a
                        href={t.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Billet / Réservation"
                        className="p-2 text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Transport Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                <Plane className="w-4 h-4 text-rose-400" />
                <span>{editingTransport ? 'Modifier le transport' : 'Ajouter un transport'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Type and Step */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Type de moyen de transport *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransportType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="flight">✈️ Vol / Avion</option>
                    <option value="train">🚄 Train / TGV / Express</option>
                    <option value="bus">🚌 Bus / Autocar</option>
                    <option value="car_rental">🚗 Voiture de location</option>
                    <option value="taxi">🚕 Taxi / Navette privée</option>
                    <option value="ferry">🚢 Ferry / Bateau</option>
                    <option value="metro">🚇 Métro / RER</option>
                    <option value="other">🚲 Autre moyen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Étape associée
                  </label>
                  <select
                    value={stepId}
                    onChange={(e) => setStepId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Sans étape spécifique --</option>
                    {steps.map((s, i) => (
                      <option key={s.id} value={s.id}>
                        Étape {i + 1} : {s.destination}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Depart and Arrival Places */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lieu / Gare / Aéroport de départ *
                  </label>
                  <input
                    type="text"
                    required
                    value={departurePlace}
                    onChange={(e) => setDeparturePlace(e.target.value)}
                    placeholder="Ex: Paris CDG 2E, Gare de Lyon..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lieu / Gare / Aéroport d’arrivée *
                  </label>
                  <input
                    type="text"
                    required
                    value={arrivalPlace}
                    onChange={(e) => setArrivalPlace(e.target.value)}
                    placeholder="Ex: Pékin Capitale PEK, Rome Termini..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date & Heure de départ *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={departureDateTime}
                    onChange={(e) => setDepartureDateTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date & Heure d’arrivée (facultatif)
                  </label>
                  <input
                    type="datetime-local"
                    value={arrivalDateTime}
                    onChange={(e) => setArrivalDateTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Carrier & Numbers */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Compagnie
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="Ex: Air France, Trenitalia..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    N° Vol / Train
                  </label>
                  <input
                    type="text"
                    value={transportNumber}
                    onChange={(e) => setTransportNumber(e.target.value)}
                    placeholder="Ex: AF892, G19..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Réf dossier
                  </label>
                  <input
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="PNR / Réf"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Price & Payment */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prix du billet
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
                    <option value="a_payer">À payer</option>
                    <option value="partiel">Acompte versé</option>
                    <option value="paye">Payé</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes & consignes bagages
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sièges réservés, terminaux, franchise bagages 23kg..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              {/* Booking link */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lien de réservation ou billet en ligne
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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                >
                  {editingTransport ? 'Enregistrer' : 'Ajouter le transport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
