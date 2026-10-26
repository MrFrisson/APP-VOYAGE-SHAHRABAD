import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { DocumentItem, Step } from '../../types/travel';
import {
  FileText,
  Plane,
  Train,
  Building2,
  Ticket,
  Shield,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  QrCode,
  Calendar,
} from 'lucide-react';

interface DocumentsViewProps {
  tripId: string;
  steps: Step[];
  documents: DocumentItem[];
  onAddDocument: (doc: Omit<DocumentItem, 'id' | 'tripId'>) => void;
  onUpdateDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  steps,
  documents,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<{ title: string; qrUrl: string; content: string } | null>(null);

  // Form states
  const [stepId, setStepId] = useState('');
  const [type, setType] = useState<DocumentItem['type']>('flight');
  const [title, setTitle] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [qrCodeContent, setQrCodeContent] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');

  // Generated QR preview cache
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate QR codes for documents that have qrCodeContent
    documents.forEach((doc) => {
      const content = doc.qrCodeContent || doc.bookingRef;
      if (content && !qrDataUrls[doc.id]) {
        QRCode.toDataURL(content, {
          width: 240,
          margin: 1.5,
          color: {
            dark: '#0f172a',
            light: '#f8fafc',
          },
        })
          .then((url) => {
            setQrDataUrls((prev) => ({ ...prev, [doc.id]: url }));
          })
          .catch((err) => console.warn('QR gen error:', err));
      }
    });
  }, [documents]);

  const openAddModal = () => {
    setEditingDoc(null);
    setStepId(steps[0]?.id || '');
    setType('flight');
    setTitle('');
    setBookingRef('');
    setQrCodeContent('');
    setExternalUrl('');
    setNotes('');
    setDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setStepId(doc.stepId || '');
    setType(doc.type);
    setTitle(doc.title);
    setBookingRef(doc.bookingRef || '');
    setQrCodeContent(doc.qrCodeContent || '');
    setExternalUrl(doc.externalUrl || '');
    setNotes(doc.notes || '');
    setDate(doc.date || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingDoc) {
      onUpdateDocument({
        ...editingDoc,
        stepId: stepId || undefined,
        type,
        title: title.trim(),
        bookingRef: bookingRef.trim() || undefined,
        qrCodeContent: qrCodeContent.trim() || undefined,
        externalUrl: externalUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        date: date || undefined,
      });
    } else {
      onAddDocument({
        stepId: stepId || undefined,
        type,
        title: title.trim(),
        bookingRef: bookingRef.trim() || undefined,
        qrCodeContent: qrCodeContent.trim() || undefined,
        externalUrl: externalUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        date: date || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const getTypeIcon = (dType: DocumentItem['type']) => {
    switch (dType) {
      case 'flight':
        return <Plane className="w-5 h-5 text-rose-400" />;
      case 'train':
        return <Train className="w-5 h-5 text-amber-400" />;
      case 'hotel':
        return <Building2 className="w-5 h-5 text-indigo-400" />;
      case 'activity':
        return <Ticket className="w-5 h-5 text-emerald-400" />;
      case 'insurance':
      case 'passport':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeLabel = (dType: DocumentItem['type']) => {
    switch (dType) {
      case 'flight':
        return 'Billet d’avion';
      case 'train':
        return 'Billet de train';
      case 'hotel':
        return 'Voucher d’hôtel';
      case 'activity':
        return 'Billet d’activité';
      case 'passport':
        return 'Passeport / Pièce d’identité';
      case 'insurance':
        return 'Assurance & Rapatriement';
      default:
        return 'Document officiel';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-serif font-bold text-slate-100">
              Documents, Billets & QR Codes
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{documents.length} document{documents.length > 1 ? 's' : ''} numérisé{documents.length > 1 ? 's' : ''}</span>
            <span aria-hidden="true">·</span>
            <span>Génération de QR codes scannables intégrée</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-medium">Accessibles hors-ligne</span>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-cyan-950/30 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un document</span>
        </button>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-300">Aucun document enregistré</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Centralisez vos références de vol, billets de train, attestations d'assurance et cartes d'embarquement.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold text-xs"
          >
            Ajouter un 1er document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const step = steps.find((s) => s.id === doc.stepId);
            const qrImg = qrDataUrls[doc.id];

            return (
              <div
                key={doc.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800/90 hover:border-slate-700 p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                            {getTypeLabel(doc.type)}
                          </span>
                          {step && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span className="text-xs text-slate-400">{step.destination}</span>
                            </>
                          )}
                        </div>
                        <h4 className="text-base font-serif font-bold text-slate-100 mt-0.5">
                          {doc.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => openEditModal(doc)}
                        title="Modifier"
                        className="p-1.5 text-slate-400 hover:text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        title="Supprimer"
                        className="p-1.5 text-rose-400/80 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Ref & Date */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {doc.bookingRef && (
                      <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
                        Réf : <strong className="text-amber-400">{doc.bookingRef}</strong>
                      </span>
                    )}
                    {doc.date && (
                      <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{doc.date}</span>
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {doc.notes && (
                    <p className="mt-3 text-xs text-slate-400 italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Row: QR Code Trigger & External URL */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  {(doc.qrCodeContent || doc.bookingRef) && qrImg ? (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveQrModal({
                          title: doc.title,
                          qrUrl: qrImg,
                          content: doc.qrCodeContent || doc.bookingRef || '',
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>Afficher le QR Code</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500">Aucun QR code</span>
                  )}

                  {doc.externalUrl && (
                    <a
                      href={doc.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                    >
                      <span>Consulter le lien</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Full Modal Display */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-100">
              {activeQrModal.title}
            </h3>
            <p className="text-xs text-slate-400">
              Scannable au guichet, portique d’embarquement ou réception.
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mx-auto">
              <img
                src={activeQrModal.qrUrl}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 break-all">
              {activeQrModal.content}
            </div>

            <button
              onClick={() => setActiveQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{editingDoc ? 'Modifier le document' : 'Ajouter un document ou billet'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Type de document *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="flight">✈️ Billet d’avion</option>
                    <option value="train">🚄 Billet de train</option>
                    <option value="hotel">🏨 Voucher hôtel</option>
                    <option value="activity">🎯 Pass / Billet activité</option>
                    <option value="insurance">🛡️ Assurance voyage</option>
                    <option value="passport">🛂 Passeport / Visa</option>
                    <option value="other">📄 Autre document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Étape associée
                  </label>
                  <select
                    value={stepId}
                    onChange={(e) => setStepId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titre du document *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Billet Air France CDG-PEK, Attestation AXA..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Numéro / Référence de réservation
                  </label>
                  <input
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder="Ex: PNR-8K29MQ, RES-991"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date du document
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contenu pour générer le QR Code (Code-barres / Référence scannable)
                </label>
                <input
                  type="text"
                  value={qrCodeContent}
                  onChange={(e) => setQrCodeContent(e.target.value)}
                  placeholder="Ex: URL de vérification, code PNR ou identifiant de billet"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lien externe (Google Drive, Dropbox, PDF en ligne)
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terminaux, numéro d'assistance 24/7, consignes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
                >
                  {editingDoc ? 'Enregistrer' : 'Ajouter le document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
