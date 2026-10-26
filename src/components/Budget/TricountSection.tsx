import React, { useState, useMemo } from 'react';
import { Expense } from '../../types/travel';
import { formatMoney, convertCurrency } from '../../services/currency';
import { Users, UserPlus, ArrowRight, CheckCircle2, DollarSign, Plus, Trash2 } from 'lucide-react';

interface TricountSectionProps {
  expenses: Expense[];
  displayCurrency: string;
  onUpdateExpense: (expense: Expense) => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'tripId'>) => void;
}

interface Balance {
  person: string;
  paid: number;
  share: number;
  net: number; // positive = is owed money, negative = owes money
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export const TricountSection: React.FC<TricountSectionProps> = ({
  expenses,
  displayCurrency,
  onUpdateExpense,
  onAddExpense,
}) => {
  // Local travelers / participants
  const [participants, setParticipants] = useState<string[]>(() => {
    const existing = new Set<string>(['Moi']);
    expenses.forEach((e) => {
      if (e.paidBy) existing.add(e.paidBy);
      if (Array.isArray(e.splitBetween)) {
        e.splitBetween.forEach((p: string) => existing.add(p));
      }
    });
    return Array.from(existing);
  });

  const [newPersonName, setNewPersonName] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCurrency, setExpCurrency] = useState(displayCurrency);
  const [expPaidBy, setExpPaidBy] = useState('Moi');
  const [expSplit, setExpSplit] = useState<string[]>(participants);

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPersonName.trim();
    if (!clean || participants.includes(clean)) return;
    setParticipants([...participants, clean]);
    setExpSplit([...expSplit, clean]);
    setNewPersonName('');
  };

  const handleRemoveParticipant = (name: string) => {
    if (name === 'Moi') return;
    setParticipants(participants.filter((p) => p !== name));
    setExpSplit(expSplit.filter((p) => p !== name));
  };

  // Convert all expenses to display currency
  const normalizedExpenses = useMemo(() => {
    return expenses.map((e) => {
      const converted = convertCurrency(e.amount, e.currency || 'EUR', displayCurrency);
      const paidBy = e.paidBy || 'Moi';
      const splitBetween =
        Array.isArray(e.splitBetween) && e.splitBetween.length > 0
          ? e.splitBetween
          : participants;
      return {
        ...e,
        amountInDisplay: converted,
        paidBy,
        splitBetween,
      };
    });
  }, [expenses, displayCurrency, participants]);

  // Compute Balances
  const balances: Balance[] = useMemo(() => {
    const paidMap: Record<string, number> = {};
    const shareMap: Record<string, number> = {};

    participants.forEach((p) => {
      paidMap[p] = 0;
      shareMap[p] = 0;
    });

    normalizedExpenses.forEach((e) => {
      const payer = e.paidBy;
      if (paidMap[payer] === undefined) paidMap[payer] = 0;
      paidMap[payer] += e.amountInDisplay;

      const beneficiaries = e.splitBetween.filter((p: string) => participants.includes(p));
      const count = beneficiaries.length > 0 ? beneficiaries.length : participants.length;
      const sharePerPerson = e.amountInDisplay / count;

      if (beneficiaries.length > 0) {
        beneficiaries.forEach((b: string) => {
          if (shareMap[b] === undefined) shareMap[b] = 0;
          shareMap[b] += sharePerPerson;
        });
      } else {
        participants.forEach((p) => {
          shareMap[p] += sharePerPerson;
        });
      }
    });

    return participants.map((p) => {
      const paid = paidMap[p] || 0;
      const share = shareMap[p] || 0;
      return {
        person: p,
        paid,
        share,
        net: paid - share,
      };
    });
  }, [normalizedExpenses, participants]);

  // Simplified Debts algorithm
  const settlements: Settlement[] = useMemo(() => {
    const debtors = balances
      .filter((b) => b.net < -0.01)
      .map((b) => ({ person: b.person, amount: -b.net }))
      .sort((a, b) => b.amount - a.amount);

    const creditors = balances
      .filter((b) => b.net > 0.01)
      .map((b) => ({ person: b.person, amount: b.net }))
      .sort((a, b) => b.amount - a.amount);

    const result: Settlement[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const settledAmount = Math.min(debtor.amount, creditor.amount);

      if (settledAmount > 0.01) {
        result.push({
          from: debtor.person,
          to: creditor.person,
          amount: settledAmount,
        });
      }

      debtor.amount -= settledAmount;
      creditor.amount -= settledAmount;

      if (debtor.amount <= 0.01) dIdx++;
      if (creditor.amount <= 0.01) cIdx++;
    }

    return result;
  }, [balances]);

  const totalGroupSpent = normalizedExpenses.reduce((sum, e) => sum + e.amountInDisplay, 0);

  const handleCreateTricountExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(expAmount);
    if (!expTitle || isNaN(val) || val <= 0) return;

    onAddExpense({
      description: expTitle,
      amount: val,
      currency: expCurrency,
      category: 'other',
      date: new Date().toISOString().slice(0, 10),
      paymentStatus: 'paye',
      amountPaid: val,
      paidBy: expPaidBy,
      splitBetween: expSplit.length > 0 ? expSplit : participants,
    });

    setExpTitle('');
    setExpAmount('');
    setIsAddExpenseOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Summary */}
      <div className="p-5 rounded-2xl bg-[#111820]/90 border border-[rgba(198,165,106,0.25)] shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#c6a56a]" />
              <h3 className="text-lg font-serif font-bold text-[#edf0eb]">
                Tricount du Voyage — Partage & Équilibre des Dépenses
              </h3>
            </div>
            <p className="text-xs text-[#98a2a8] mt-1">
              Suivez qui a payé quoi et découvrez automatiquement qui doit rembourser qui en temps réel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-[#98a2a8] block">Total Groupe Dépensé</span>
              <span className="text-base font-bold text-[#c6a56a]">
                {formatMoney(totalGroupSpent, displayCurrency)}
              </span>
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] font-bold text-xs hover:brightness-110 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Dépense partagée</span>
            </button>
          </div>
        </div>

        {/* Participants Pills */}
        <div className="mt-4 pt-3.5 border-t border-[rgba(198,165,106,0.15)] flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#98a2a8] mr-1">Participants :</span>
          {participants.map((person) => (
            <span
              key={person}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] text-[#edf0eb]"
            >
              <span>👤 {person}</span>
              {person !== 'Moi' && (
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(person)}
                  className="text-[#98a2a8] hover:text-[#b84f4b] text-[10px] ml-0.5 cursor-pointer"
                  title="Supprimer le participant"
                >
                  ✕
                </button>
              )}
            </span>
          ))}

          {/* Add participant inline form */}
          <form onSubmit={handleAddParticipant} className="flex items-center gap-1.5">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="Ajouter un ami..."
              className="bg-[#0b0f14] border border-[rgba(198,165,106,0.2)] text-xs text-[#edf0eb] px-2.5 py-1 rounded-full placeholder-[#657079] focus:outline-none focus:border-[#c6a56a] w-32"
            />
            <button
              type="submit"
              className="p-1 rounded-full bg-[#151d26] text-[#c6a56a] hover:bg-[#1a232e] border border-[rgba(198,165,106,0.2)] cursor-pointer"
              title="Ajouter au voyage"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Grid: Balances + Settlements (Qui doit à qui) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Solde individuel par personne */}
        <div className="p-5 rounded-2xl bg-[#111820]/90 border border-[rgba(198,165,106,0.2)] space-y-3 shadow-lg">
          <h4 className="text-sm font-serif font-bold text-[#edf0eb] flex items-center gap-2">
            <span>⚖️ Soldes & Dépenses par personne</span>
          </h4>

          <div className="divide-y divide-[rgba(198,165,106,0.1)]">
            {balances.map((b) => {
              const isPositive = b.net > 0.01;
              const isNegative = b.net < -0.01;

              return (
                <div key={b.person} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#edf0eb] text-sm block">👤 {b.person}</span>
                    <span className="text-[11px] text-[#98a2a8]">
                      A payé : {formatMoney(b.paid, displayCurrency)} · Part : {formatMoney(b.share, displayCurrency)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-mono font-bold px-2.5 py-1 rounded-lg inline-block ${
                        isPositive
                          ? 'text-[#79b59b] bg-[#79b59b]/15 border border-[#79b59b]/30'
                          : isNegative
                          ? 'text-[#b84f4b] bg-[#b84f4b]/15 border border-[#b84f4b]/30'
                          : 'text-[#98a2a8] bg-[#0b0f14]'
                      }`}
                    >
                      {isPositive ? `+ ${formatMoney(b.net, displayCurrency)}` : isNegative ? `- ${formatMoney(Math.abs(b.net), displayCurrency)}` : `0 ${displayCurrency}`}
                    </span>
                    <span className="block text-[10px] text-[#657079] mt-0.5">
                      {isPositive ? 'On lui doit' : isNegative ? 'Doit rembourser' : 'À l’équilibre'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Remboursements suggérés (Qui rembourse qui) */}
        <div className="p-5 rounded-2xl bg-[#111820]/90 border border-[rgba(198,165,106,0.2)] space-y-3 shadow-lg">
          <h4 className="text-sm font-serif font-bold text-[#edf0eb] flex items-center gap-2">
            <span>🤝 Règlements simplifiés (Qui doit à qui)</span>
          </h4>

          {settlements.length === 0 ? (
            <div className="p-8 text-center bg-[#0b0f14] rounded-xl border border-[rgba(198,165,106,0.15)] text-xs text-[#98a2a8]">
              <CheckCircle2 className="w-8 h-8 text-[#79b59b] mx-auto mb-2" />
              <p className="font-semibold text-[#edf0eb]">Tous les comptes sont parfaitement équilibrés !</p>
              <p className="text-[11px] text-[#657079] mt-1">Personne ne doit d'argent pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {settlements.map((s, idx) => (
                <div
                  key={`${s.from}-${s.to}-${idx}`}
                  className="p-3 rounded-xl bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 text-[#edf0eb]">
                    <span className="font-bold text-[#b84f4b]">{s.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c6a56a]" />
                    <span className="font-bold text-[#79b59b]">{s.to}</span>
                  </div>

                  <span className="font-mono font-bold text-[#c6a56a] bg-[rgba(198,165,106,0.12)] px-2.5 py-1 rounded-md border border-[rgba(198,165,106,0.2)]">
                    {formatMoney(s.amount, displayCurrency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shared Expenses List */}
      <div className="p-5 rounded-2xl bg-[#111820]/90 border border-[rgba(198,165,106,0.2)] space-y-3 shadow-lg">
        <h4 className="text-sm font-serif font-bold text-[#edf0eb] flex items-center justify-between">
          <span>Historique des dépenses partagées</span>
          <span className="text-xs text-[#98a2a8] font-normal font-sans">
            {normalizedExpenses.length} dépense{normalizedExpenses.length > 1 ? 's' : ''}
          </span>
        </h4>

        {normalizedExpenses.length === 0 ? (
          <p className="text-xs text-[#657079] text-center py-6">
            Aucune dépense enregistrée. Cliquez sur « Dépense partagée » ci-dessus.
          </p>
        ) : (
          <div className="divide-y divide-[rgba(198,165,106,0.1)]">
            {normalizedExpenses.map((exp) => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-[#edf0eb]">{exp.description || 'Dépense'}</p>
                  <p className="text-[11px] text-[#98a2a8]">
                    Payé par <strong className="text-[#c6a56a]">{exp.paidBy}</strong> · Pour :{' '}
                    {exp.splitBetween.join(', ')}
                  </p>
                </div>

                <div className="text-right font-mono font-bold text-[#edf0eb]">
                  {formatMoney(exp.amountInDisplay, displayCurrency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add Shared Expense */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111820] border border-[rgba(198,165,106,0.3)] w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(198,165,106,0.2)]">
              <h4 className="text-sm font-serif font-bold text-[#edf0eb] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#c6a56a]" />
                <span>Ajouter une dépense partagée (Tricount)</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="text-[#98a2a8] hover:text-[#edf0eb] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTricountExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                  Intitulé de la dépense *
                </label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="Ex: Restaurant Trattoria, Plein d'essence, Billets musée..."
                  className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] rounded-xl px-3 py-2 text-xs text-[#edf0eb] focus:outline-none focus:border-[#c6a56a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                    Montant *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] rounded-xl px-3 py-2 text-xs text-[#edf0eb] font-mono focus:outline-none focus:border-[#c6a56a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                    Devise
                  </label>
                  <select
                    value={expCurrency}
                    onChange={(e) => setExpCurrency(e.target.value)}
                    className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] rounded-xl px-3 py-2 text-xs text-[#edf0eb] focus:outline-none focus:border-[#c6a56a]"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="CNY">CNY (¥)</option>
                    <option value="USD">USD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                  Payé par qui ?
                </label>
                <select
                  value={expPaidBy}
                  onChange={(e) => setExpPaidBy(e.target.value)}
                  className="w-full bg-[#0b0f14] border border-[rgba(198,165,106,0.25)] rounded-xl px-3 py-2 text-xs text-[#edf0eb] focus:outline-none focus:border-[#c6a56a]"
                >
                  {participants.map((p) => (
                    <option key={p} value={p}>
                      👤 {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#edf0eb] mb-1">
                  Pour qui ? (Partagé entre)
                </label>
                <div className="flex flex-wrap gap-2 p-2 bg-[#0b0f14] rounded-xl border border-[rgba(198,165,106,0.2)]">
                  {participants.map((p) => {
                    const isChecked = expSplit.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (expSplit.length > 1) {
                              setExpSplit(expSplit.filter((item) => item !== p));
                            }
                          } else {
                            setExpSplit([...expSplit, p]);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#c6a56a]/20 border-[#c6a56a] text-[#eadcc0] font-bold'
                            : 'bg-[#151d26] border-transparent text-[#657079]'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#98a2a8] hover:text-[#edf0eb] cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c6a56a] to-[#d8b97e] text-[#0b0f14] font-bold text-xs hover:brightness-110 cursor-pointer shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
