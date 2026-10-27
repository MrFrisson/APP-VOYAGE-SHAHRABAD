import React, { useState } from 'react';
import {
  Trip,
  Step,
  Expense,
  Accommodation,
  Transport,
  ExpenseCategory,
  PaymentStatus,
} from '../../types/travel';
import { convertCurrency, formatMoney, getCachedRates } from '../../services/currency';
import {
  DollarSign,
  PieChart,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Plane,
  ShoppingBag,
  Utensils,
  FileText,
  HelpCircle,
  Share2,
  Users,
} from 'lucide-react';
import { TricountSection } from './TricountSection';
import { ShahrabadDatePicker } from '../Common/ShahrabadDatePicker';

interface BudgetViewProps {
  trip: Trip;
  steps: Step[];
  accommodations: Accommodation[];
  transports: Transport[];
  expenses: Expense[];
  displayCurrency?: string;
  onSelectDisplayCurrency?: (currency: string) => void;
  onShareBudget?: () => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'tripId'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onUpdateTripBudget: (newBudget: number) => void;
}

const CATEGORY_INFO: Record<
  ExpenseCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  accommodation: { label: 'Hébergement', icon: <Building2 className="w-4 h-4" />, color: 'bg-indigo-500' },
  transport: { label: 'Transport', icon: <Plane className="w-4 h-4" />, color: 'bg-rose-500' },
  activity: { label: 'Activités', icon: <PieChart className="w-4 h-4" />, color: 'bg-emerald-500' },
  food: { label: 'Nourriture & Repas', icon: <Utensils className="w-4 h-4" />, color: 'bg-amber-500' },
  shopping: { label: 'Shopping & Souvenirs', icon: <ShoppingBag className="w-4 h-4" />, color: 'bg-purple-500' },
  admin: { label: 'Frais admin & Visas', icon: <FileText className="w-4 h-4" />, color: 'bg-blue-500' },
  other: { label: 'Autres dépenses', icon: <HelpCircle className="w-4 h-4" />, color: 'bg-slate-500' },
};

export const BudgetView: React.FC<BudgetViewProps> = ({
  trip,
  steps,
  accommodations,
  transports,
  expenses,
  displayCurrency: propDisplayCurrency,
  onSelectDisplayCurrency,
  onShareBudget,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateTripBudget,
}) => {
  const [internalCurrency, setInternalCurrency] = useState(trip.currency || 'EUR');
  const displayCurrency = propDisplayCurrency || internalCurrency;
  const [budgetSubTab, setBudgetSubTab] = useState<'overview' | 'tricount'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditingPrevisionalBudget, setIsEditingPrevisionalBudget] = useState(false);
  const [tempPrevisionalBudget, setTempPrevisionalBudget] = useState(trip.totalBudget || 0);

  // Form states
  const [stepId, setStepId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState(trip.currency || 'EUR');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('prevu');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const rates = getCachedRates();

  // Deduplicate and compute total budget items:
  // We use recorded expenses as primary source. If an accommodation or transport has NO corresponding linked expense, we add it automatically to avoid double-counting.
  const unifiedExpenses: {
    id: string;
    description: string;
    category: ExpenseCategory;
    stepId?: string;
    amount: number;
    currency: string;
    convertedAmount: number;
    paymentStatus: PaymentStatus;
    amountPaid: number;
    convertedPaid: number;
    isFromModule?: boolean;
    date: string;
  }[] = [];

  // 1. Add explicitly recorded expenses
  expenses.forEach((e) => {
    const converted = convertCurrency(e.amount, e.currency, displayCurrency, rates);
    const paidVal = e.paymentStatus === 'paye' ? e.amount : e.amountPaid;
    const convPaid = convertCurrency(paidVal, e.currency, displayCurrency, rates);

    unifiedExpenses.push({
      id: e.id,
      description: e.description,
      category: e.category,
      stepId: e.stepId,
      amount: e.amount,
      currency: e.currency,
      convertedAmount: converted,
      paymentStatus: e.paymentStatus,
      amountPaid: e.amountPaid,
      convertedPaid: convPaid,
      isFromModule: false,
      date: e.date,
    });
  });

  // 2. Check for accommodations not yet in expenses
  accommodations.forEach((acc) => {
    const isAlreadyLinked = expenses.some(
      (e) => (e.linkedType === 'accommodation' && e.linkedId === acc.id) || e.description.includes(acc.name)
    );
    if (!isAlreadyLinked && acc.priceTotal > 0) {
      const conv = convertCurrency(acc.priceTotal, acc.currency, displayCurrency, rates);
      const paidVal = acc.paymentStatus === 'paye' ? acc.priceTotal : acc.amountPaid;
      const convPaid = convertCurrency(paidVal, acc.currency, displayCurrency, rates);

      unifiedExpenses.push({
        id: `auto-acc-${acc.id}`,
        description: `Hôtel : ${acc.name} (${acc.nights} nuits)`,
        category: 'accommodation',
        stepId: acc.stepId,
        amount: acc.priceTotal,
        currency: acc.currency,
        convertedAmount: conv,
        paymentStatus: acc.paymentStatus,
        amountPaid: acc.amountPaid,
        convertedPaid: convPaid,
        isFromModule: true,
        date: acc.checkIn,
      });
    }
  });

  // 3. Check for transports not yet in expenses
  transports.forEach((tr) => {
    const isAlreadyLinked = expenses.some(
      (e) => (e.linkedType === 'transport' && e.linkedId === tr.id) || e.description.includes(tr.departurePlace)
    );
    if (!isAlreadyLinked && tr.price > 0) {
      const conv = convertCurrency(tr.price, tr.currency, displayCurrency, rates);
      const paidVal = tr.paymentStatus === 'paye' ? tr.price : tr.amountPaid;
      const convPaid = convertCurrency(paidVal, tr.currency, displayCurrency, rates);

      unifiedExpenses.push({
        id: `auto-tr-${tr.id}`,
        description: `Transport : ${tr.departurePlace} ➔ ${tr.arrivalPlace}`,
        category: 'transport',
        stepId: tr.stepId,
        amount: tr.price,
        currency: tr.currency,
        convertedAmount: conv,
        paymentStatus: tr.paymentStatus,
        amountPaid: tr.amountPaid,
        convertedPaid: convPaid,
        isFromModule: true,
        date: tr.departureDateTime?.slice(0, 10) || '',
      });
    }
  });

  // Calculations
  const convertedPrevisionalBudget = convertCurrency(
    trip.totalBudget,
    trip.currency,
    displayCurrency,
    rates
  );
  const totalPlanned = unifiedExpenses.reduce((sum, item) => sum + item.convertedAmount, 0);
  const totalPaid = unifiedExpenses.reduce((sum, item) => sum + item.convertedPaid, 0);
  const totalRemaining = Math.max(0, totalPlanned - totalPaid);
  const budgetDifference = convertedPrevisionalBudget - totalPlanned;

  // Breakdown by Category
  const categoryTotals: Record<ExpenseCategory, number> = {
    accommodation: 0,
    transport: 0,
    activity: 0,
    food: 0,
    shopping: 0,
    admin: 0,
    other: 0,
  };
  unifiedExpenses.forEach((item) => {
    categoryTotals[item.category] += item.convertedAmount;
  });

  // Breakdown by Step
  const stepTotals: Record<string, number> = {};
  unifiedExpenses.forEach((item) => {
    const sId = item.stepId || 'hors_etape';
    stepTotals[sId] = (stepTotals[sId] || 0) + item.convertedAmount;
  });

  const openAddModal = () => {
    setEditingExpense(null);
    setStepId(steps[0]?.id || '');
    setCategory('food');
    setDescription('');
    setAmount(0);
    setCurrency(displayCurrency);
    setPaymentStatus('prevu');
    setAmountPaid(0);
    setDate(new Date().toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setStepId(exp.stepId || '');
    setCategory(exp.category);
    setDescription(exp.description);
    setAmount(exp.amount);
    setCurrency(exp.currency);
    setPaymentStatus(exp.paymentStatus);
    setAmountPaid(exp.amountPaid);
    setDate(exp.date);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    if (editingExpense) {
      onUpdateExpense({
        ...editingExpense,
        stepId: stepId || undefined,
        category,
        description: description.trim(),
        amount,
        currency,
        date,
        paymentStatus,
        amountPaid: paymentStatus === 'paye' ? amount : Math.min(amountPaid, amount),
      });
    } else {
      onAddExpense({
        stepId: stepId || undefined,
        category,
        description: description.trim(),
        amount,
        currency,
        date,
        paymentStatus,
        amountPaid: paymentStatus === 'paye' ? amount : Math.min(amountPaid, amount),
      });
    }

    setIsModalOpen(false);
  };

  const handleSavePrevisionalBudget = () => {
    const convertedBack = convertCurrency(
      tempPrevisionalBudget,
      displayCurrency,
      trip.currency || 'EUR',
      rates
    );
    onUpdateTripBudget(Math.round(convertedBack));
    setIsEditingPrevisionalBudget(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111820] rounded-2xl border border-[rgba(198,165,106,0.25)] shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#c6a56a]" />
            <h2 className="text-xl font-serif font-bold text-[#edf0eb]">
              Budget & Suivi des Dépenses
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#98a2a8] mt-1">
            <span>Dépenses unifiées sans doublons</span>
            <span aria-hidden="true">·</span>
            <span>Taux de change indicatifs</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#c6a56a] font-medium">Contrôle financier en temps réel</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Display Currency Switcher (Primary place for currency control) */}
          <div className="flex items-center gap-1.5 bg-[#0b0f14] px-3.5 py-2 rounded-xl border border-[rgba(198,165,106,0.3)] text-xs shadow-sm">
            <span className="text-[#98a2a8]">Devise d'affichage :</span>
            <select
              value={displayCurrency}
              onChange={(e) => {
                const val = e.target.value;
                setInternalCurrency(val);
                if (onSelectDisplayCurrency) {
                  onSelectDisplayCurrency(val);
                }
              }}
              className="bg-transparent text-[#c6a56a] font-bold focus:outline-none cursor-pointer"
            >
              <option value="EUR">EUR (€)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="USD">USD ($)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF</option>
            </select>
          </div>

          {/* Share Budget Button */}
          {onShareBudget && (
            <button
              onClick={onShareBudget}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0b0f14] hover:bg-[#17212b] text-[#eadcc0] hover:text-[#c6a56a] border border-[rgba(198,165,106,0.25)] font-semibold text-xs transition-colors"
              title="Partager le budget"
            >
              <Share2 className="w-3.5 h-3.5 text-[#c6a56a]" />
              <span className="hidden sm:inline">Partager le budget</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#c6a56a] hover:bg-[#eadcc0] text-[#0b0f14] font-bold text-xs shadow-lg shadow-black/40 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Ajouter une dépense</span>
          </button>
        </div>
      </div>

      {/* Sub-tab switcher: Overview vs Tricount */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#111820] rounded-xl border border-[rgba(198,165,106,0.2)] text-xs w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setBudgetSubTab('overview')}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold transition-all cursor-pointer flex-1 sm:flex-initial ${
            budgetSubTab === 'overview'
              ? 'bg-[#c6a56a] text-[#0b0f14] shadow-md'
              : 'text-[#98a2a8] hover:text-[#edf0eb]'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Vue d'ensemble</span>
        </button>
        <button
          type="button"
          onClick={() => setBudgetSubTab('tricount')}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold transition-all cursor-pointer flex-1 sm:flex-initial ${
            budgetSubTab === 'tricount'
              ? 'bg-[#c6a56a] text-[#0b0f14] shadow-md'
              : 'text-[#98a2a8] hover:text-[#edf0eb]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Tricount (Partage)</span>
        </button>
      </div>

      {budgetSubTab === 'tricount' ? (
        <TricountSection
          expenses={expenses}
          displayCurrency={displayCurrency}
          onUpdateExpense={onUpdateExpense}
          onAddExpense={onAddExpense}
        />
      ) : (
        <>
          {/* KPI Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Forecast Previsional Budget */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Budget prévisionnel</span>
            <button
              onClick={() => {
                setTempPrevisionalBudget(Math.round(convertedPrevisionalBudget));
                setIsEditingPrevisionalBudget(!isEditingPrevisionalBudget);
              }}
              className="text-[11px] text-amber-400 hover:underline"
            >
              {isEditingPrevisionalBudget ? 'Fermer' : 'Ajuster'}
            </button>
          </div>

          {isEditingPrevisionalBudget ? (
            <div className="mt-2 flex items-center gap-1">
              <input
                type="number"
                value={tempPrevisionalBudget}
                onChange={(e) => setTempPrevisionalBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-amber-500 rounded px-2 py-1 text-sm text-slate-100"
              />
              <button
                onClick={handleSavePrevisionalBudget}
                className="px-2 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded"
              >
                OK
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <span className="text-2xl font-serif font-bold text-slate-100">
                {formatMoney(convertedPrevisionalBudget, displayCurrency)}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Objectif global fixé</p>
            </div>
          )}
        </div>

        {/* Total Planned Expenses */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Total dépenses prévues</span>
          <div className="mt-2">
            <span className="text-2xl font-serif font-bold text-slate-100">
              {formatMoney(totalPlanned, displayCurrency)}
            </span>
            <p
              className={`text-[11px] mt-0.5 font-medium ${
                budgetDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {budgetDifference >= 0
                ? `Reste ${formatMoney(budgetDifference, displayCurrency)} de marge`
                : `Dépassement de ${formatMoney(Math.abs(budgetDifference), displayCurrency)}`}
            </p>
          </div>
        </div>

        {/* Total Actually Paid */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <span className="text-xs font-semibold text-emerald-400">Total déjà réglé</span>
          <div className="mt-2">
            <span className="text-2xl font-serif font-bold text-emerald-300">
              {formatMoney(totalPaid, displayCurrency)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totalPlanned > 0
                ? `${Math.round((totalPaid / totalPlanned) * 100)}% des dépenses payées`
                : '0% payé'}
            </p>
          </div>
        </div>

        {/* Total Remaining to Pay */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <span className="text-xs font-semibold text-amber-400">Reste à payer</span>
          <div className="mt-2">
            <span className="text-2xl font-serif font-bold text-amber-300">
              {formatMoney(totalRemaining, displayCurrency)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Sur place ou avant départ</p>
          </div>
        </div>
      </div>

      {/* Progress Bar of Budget Realization */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Répartition de l'engagement budgétaire</span>
          <span className="text-slate-400">
            {formatMoney(totalPaid, displayCurrency)} payés / {formatMoney(totalPlanned, displayCurrency)} engagés
          </span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${totalPlanned > 0 ? (totalPaid / totalPlanned) * 100 : 0}%` }}
            className="h-full bg-emerald-500 transition-all duration-500"
            title="Payé"
          />
          <div
            style={{ width: `${totalPlanned > 0 ? (totalRemaining / totalPlanned) * 100 : 0}%` }}
            className="h-full bg-amber-500/70 transition-all duration-500"
            title="Reste à payer"
          />
        </div>
      </div>

      {/* Breakdown Grids: Categories & Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown by Category */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <PieChart className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-serif font-bold text-slate-100">
              Dépenses par catégorie
            </h3>
          </div>

          <div className="space-y-3">
            {(Object.keys(CATEGORY_INFO) as ExpenseCategory[]).map((catKey) => {
              const catData = CATEGORY_INFO[catKey];
              const amountCat = categoryTotals[catKey] || 0;
              const percentage = totalPlanned > 0 ? Math.round((amountCat / totalPlanned) * 100) : 0;

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-200">
                      <span className="p-1 rounded bg-slate-950 text-slate-300">{catData.icon}</span>
                      <span>{catData.label}</span>
                    </span>
                    <span className="font-semibold text-slate-100">
                      {formatMoney(amountCat, displayCurrency)} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full ${catData.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Step / City */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-serif font-bold text-slate-100">
              Budget par destination / ville
            </h3>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => {
              const amountStep = stepTotals[step.id] || 0;
              const percentage = totalPlanned > 0 ? Math.round((amountStep / totalPlanned) * 100) : 0;

              return (
                <div key={step.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>{step.emoji || '📍'}</span>
                      <span>
                        Étape {idx + 1} : {step.destination}
                      </span>
                    </span>
                    <span className="font-semibold text-slate-100">
                      {formatMoney(amountStep, displayCurrency)} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-amber-500"
                    />
                  </div>
                </div>
              );
            })}

            {stepTotals['hors_etape'] && stepTotals['hors_etape'] > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Dépenses générales hors étape (vols, visas...)</span>
                  <span className="font-semibold text-slate-300">
                    {formatMoney(stepTotals['hors_etape'], displayCurrency)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Expenses Table & Add Card */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-serif font-bold text-slate-100">
            Détail de toutes les dépenses enregistrées ({unifiedExpenses.length})
          </h3>
          <span className="text-xs text-slate-500">
            Les hôtels et transports non enregistrés en dépense manuelle sont harmonisés ici
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {unifiedExpenses.map((item) => {
            const cat = CATEGORY_INFO[item.category];

            return (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-950/40 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 shrink-0">
                    {cat.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">{cat.label}</span>
                      {item.isFromModule && (
                        <span className="text-[10px] bg-slate-950 border border-slate-800 text-amber-400 px-1.5 py-0.5 rounded">
                          Synchronisé auto
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
                      {item.description}
                    </h4>
                    {item.date && (
                      <span className="text-[11px] text-slate-500">Date : {item.date}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-bold text-slate-100 block">
                      {item.amount.toLocaleString('fr-FR')} {item.currency}
                    </span>
                    {item.currency !== displayCurrency && (
                      <span className="text-[11px] text-slate-400 block">
                        ≈ {formatMoney(item.convertedAmount, displayCurrency)}
                      </span>
                    )}
                    <div className="text-[11px] mt-0.5">
                      {item.paymentStatus === 'paye' ? (
                        <span className="text-emerald-400 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Payé
                        </span>
                      ) : item.paymentStatus === 'partiel' ? (
                        <span className="text-amber-400 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Acompte {item.amountPaid} {item.currency}
                        </span>
                      ) : (
                        <span className="text-rose-400 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> À payer
                        </span>
                      )}
                    </div>
                  </div>

                  {!item.isFromModule && (
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => {
                          const original = expenses.find((e) => e.id === item.id);
                          if (original) openEditModal(original);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(item.id)}
                        className="p-1.5 text-rose-400/80 hover:text-rose-300"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>{editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Category & Step */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {(Object.keys(CATEGORY_INFO) as ExpenseCategory[]).map((k) => (
                      <option key={k} value={k}>
                        {CATEGORY_INFO[k].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Étape / Ville
                  </label>
                  <select
                    value={stepId}
                    onChange={(e) => setStepId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Dépense générale (hors étape) --</option>
                    {steps.map((s, i) => (
                      <option key={s.id} value={s.id}>
                        Étape {i + 1} : {s.destination}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description de la dépense *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Restaurant Da Dong canard laqué, Billets TGV, Assurances..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Amount, Currency & Date */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Montant *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-100"
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

                <div className="col-span-1">
                  <ShahrabadDatePicker
                    label="Date"
                    value={date}
                    onChange={setDate}
                  />
                </div>
              </div>

              {/* Payment Status */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Statut du paiement
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    <option value="prevu">Prévu (budget prévisionnel)</option>
                    <option value="a_payer">À payer prochainement</option>
                    <option value="partiel">Partiellement payé (acompte)</option>
                    <option value="paye">Payé intégralement</option>
                  </select>
                </div>

                {paymentStatus === 'partiel' && (
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 mb-1">
                      Montant déjà payé
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={amount}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                )}
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  {editingExpense ? 'Enregistrer' : 'Ajouter la dépense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
