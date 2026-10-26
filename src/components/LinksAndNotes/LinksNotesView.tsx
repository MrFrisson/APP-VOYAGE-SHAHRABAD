import React, { useState } from 'react';
import { GeneralLink, GeneralNote, Step } from '../../types/travel';
import {
  Bookmark,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  AlertCircle,
  FileText,
  Compass,
} from 'lucide-react';

interface LinksNotesViewProps {
  tripId: string;
  steps: Step[];
  links: GeneralLink[];
  notes: GeneralNote[];
  onAddLink: (link: Omit<GeneralLink, 'id' | 'tripId'>) => void;
  onDeleteLink: (linkId: string) => void;
  onAddNote: (note: Omit<GeneralNote, 'id' | 'tripId'>) => void;
  onUpdateNote: (note: GeneralNote) => void;
  onDeleteNote: (noteId: string) => void;
}

export const LinksNotesView: React.FC<LinksNotesViewProps> = ({
  steps,
  links,
  notes,
  onAddLink,
  onDeleteLink,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<'links' | 'notes'>('notes');

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [linkCat, setLinkCat] = useState<GeneralLink['category']>('Guide');
  const [linkStepId, setLinkStepId] = useState('');

  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<GeneralNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<GeneralNote['category']>('conseils');

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    onAddLink({
      stepId: linkStepId || undefined,
      title: linkTitle.trim(),
      url: linkUrl.trim(),
      description: linkDesc.trim() || undefined,
      category: linkCat,
    });

    setIsLinkModalOpen(false);
    setLinkTitle('');
    setLinkUrl('');
    setLinkDesc('');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    if (editingNote) {
      onUpdateNote({
        ...editingNote,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
      });
    } else {
      onAddNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
      });
    }

    setIsNoteModalOpen(false);
  };

  const openAddNoteModal = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('conseils');
    setIsNoteModalOpen(true);
  };

  const openEditNoteModal = (note: GeneralNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setIsNoteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-serif font-bold text-slate-100">
              Carnet de Route, Liens Utiles & Notes
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Checklists de voyage, adresses recommandées & formalités</span>
          </div>
        </div>

        {/* Tab switch & Add buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Notes & Checklists ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'links'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Liens Utiles ({links.length})
            </button>
          </div>

          {activeTab === 'notes' ? (
            <button
              onClick={openAddNoteModal}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle note</span>
            </button>
          ) : (
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau lien</span>
            </button>
          )}
        </div>
      </div>

      {/* Notes Tab Content */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-medium text-slate-300">Aucune note enregistrée</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Notez votre liste de bagages, numéros d'urgence, ambassades ou idées de circuits.
              </p>
              <button
                onClick={openAddNoteModal}
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs"
              >
                Créer une note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800/90 hover:border-slate-700 p-5 shadow-lg flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {n.category === 'bagages'
                          ? '🧳 Bagages'
                          : n.category === 'urgences'
                          ? '🚨 Urgences'
                          : n.category === 'itineraires'
                          ? '🗺️ Itinéraire'
                          : '💡 Conseils'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditNoteModal(n)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNote(n.id)}
                          className="p-1 text-rose-400/80 hover:text-rose-300"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-serif font-bold text-slate-100 mt-2">
                      {n.title}
                    </h4>

                    <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed mt-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      {n.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Links Tab Content */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          {links.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-medium text-slate-300">Aucun lien enregistré</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Enregistrez vos liens favoris de blogs, billetteries officielles, ambassades ou transports.
              </p>
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs"
              >
                Ajouter un lien
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {links.map((link) => {
                const step = steps.find((s) => s.id === link.stepId);

                return (
                  <div
                    key={link.id}
                    className="bg-slate-900/90 rounded-2xl border border-slate-800/90 hover:border-slate-700 p-4 shadow-lg flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          {link.category}
                        </span>
                        {step && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="text-xs text-slate-400">{step.destination}</span>
                          </>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{link.title}</h4>
                      {link.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">{link.description}</p>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-semibold pt-1 break-all"
                      >
                        <span className="truncate max-w-xs">{link.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    <button
                      onClick={() => onDeleteLink(link.id)}
                      className="p-1.5 text-rose-400/80 hover:text-rose-300 rounded-lg hover:bg-slate-950 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Ajouter un lien web</span>
            </h3>

            <form onSubmit={handleSaveLink} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catégorie du lien
                </label>
                <select
                  value={linkCat}
                  onChange={(e) => setLinkCat(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="Guide">📖 Guide / Blog</option>
                  <option value="Réservation">🎟️ Réservation officielle</option>
                  <option value="Transport">🚄 Transport / Rail / Vol</option>
                  <option value="Restaurant">🍜 Restaurant & Gastronomie</option>
                  <option value="Pratique">ℹ️ Pratique & Ambassade</option>
                  <option value="Autre">🔗 Autre lien</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titre du lien *
                </label>
                <input
                  type="text"
                  required
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Ex: Portail officiel des trains 12306..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL web *</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Étape associée (facultatif)
                </label>
                <select
                  value={linkStepId}
                  onChange={(e) => setLinkStepId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="">-- Lien pour tout le voyage --</option>
                  {steps.map((s, i) => (
                    <option key={s.id} value={s.id}>
                      Étape {i + 1} : {s.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Courte description
                </label>
                <input
                  type="text"
                  value={linkDesc}
                  onChange={(e) => setLinkDesc(e.target.value)}
                  placeholder="Ex: Astuces pour acheter sans frais..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Ajouter le lien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{editingNote ? 'Modifier la note' : 'Nouvelle note de voyage'}</span>
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="conseils">💡 Conseils & Applications indispensables</option>
                  <option value="bagages">🧳 Checklist Valise & Bagages</option>
                  <option value="urgences">🚨 Numéros d’urgence & Ambassades</option>
                  <option value="itineraires">🗺️ Remarques d’itinéraires</option>
                  <option value="general">📝 Note générale libre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Titre *</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Ex: Trousse à pharmacie, Formalités d'entrée..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contenu</label>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Rédigez vos puces, conseils ou rappels..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  {editingNote ? 'Enregistrer' : 'Créer la note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
