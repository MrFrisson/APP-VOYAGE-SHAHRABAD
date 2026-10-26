import React, { useState, useEffect } from 'react';
import {
  ExchangeRateData,
  SUPPORTED_CURRENCIES,
  convertCurrency,
  fetchLiveExchangeRates,
  getCachedRates,
} from '../../services/currency';
import { ArrowLeftRight, RefreshCw, CheckCircle2, AlertTriangle, Coins } from 'lucide-react';

export const CurrencyConverter: React.FC = () => {
  const [ratesData, setRatesData] = useState<ExchangeRateData>(getCachedRates());
  const [loading, setLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('CNY');
  const [toCurrency, setToCurrency] = useState<string>('EUR');

  const refreshRates = async () => {
    setLoading(true);
    const data = await fetchLiveExchangeRates();
    setRatesData(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshRates();
  }, []);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const convertedValue = convertCurrency(amount, fromCurrency, toCurrency, ratesData);
  const singleUnitRate = convertCurrency(1, fromCurrency, toCurrency, ratesData);

  // Quick denomination tables
  const quickAmounts = [1, 5, 10, 50, 100, 500, 1000];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-serif font-bold text-slate-100">
              Convertisseur de Devises International
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>CNY, EUR, AUD, USD, JPY et 10+ devises mondiales</span>
            <span aria-hidden="true">·</span>
            <span>Date du taux : {ratesData.date}</span>
          </div>
        </div>

        <button
          onClick={refreshRates}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>{loading ? 'Actualisation...' : 'Actualiser les taux'}</span>
        </button>
      </div>

      {/* Main Conversion Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/90 p-6 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          {/* Source Amount & Currency */}
          <div className="md:col-span-3 space-y-2">
            <label className="block text-xs font-semibold text-slate-400">
              Montant à convertir
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-lg font-bold text-slate-100 focus:outline-none"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-2 md:pt-6">
            <button
              onClick={handleSwap}
              title="Inverser les devises"
              className="w-12 h-12 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center transition-transform active:scale-90 shadow-lg"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Target Amount & Currency */}
          <div className="md:col-span-3 space-y-2">
            <label className="block text-xs font-semibold text-slate-400">
              Résultat de la conversion
            </label>
            <div className="flex gap-2">
              <div className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-lg font-bold text-amber-300 flex items-center">
                {convertedValue.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Conversion Rate Formula Line */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span>Taux de référence :</span>
            <span className="text-amber-400 font-bold">
              1 {fromCurrency} = {singleUnitRate.toFixed(4)} {toCurrency}
            </span>
            <span className="text-slate-500">
              (ou 1 {toCurrency} = {(1 / singleUnitRate).toFixed(4)} {fromCurrency})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            {ratesData.isFallback ? (
              <span className="text-amber-400 inline-flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{ratesData.source} ({ratesData.date})</span>
              </span>
            ) : (
              <span className="text-emerald-400 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{ratesData.source} ({ratesData.date})</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Conversion Cheat Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direction 1 */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg">
          <h4 className="text-sm font-serif font-bold text-slate-200 mb-3">
            Tableau de repère rapide : {fromCurrency} ➔ {toCurrency}
          </h4>
          <div className="divide-y divide-slate-800 text-xs">
            {quickAmounts.map((q) => {
              const res = convertCurrency(q, fromCurrency, toCurrency, ratesData);
              return (
                <div key={q} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    {q} {fromCurrency}
                  </span>
                  <span className="font-bold text-amber-300">
                    {res.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {toCurrency}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Direction 2 */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg">
          <h4 className="text-sm font-serif font-bold text-slate-200 mb-3">
            Tableau inverse : {toCurrency} ➔ {fromCurrency}
          </h4>
          <div className="divide-y divide-slate-800 text-xs">
            {quickAmounts.map((q) => {
              const res = convertCurrency(q, toCurrency, fromCurrency, ratesData);
              return (
                <div key={q} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    {q} {toCurrency}
                  </span>
                  <span className="font-bold text-amber-300">
                    {res.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {fromCurrency}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
