export interface ExchangeRateData {
  base: string;
  date: string;
  rates: Record<string, number>;
  source: string;
  isFallback: boolean;
}

// Robust fallback rates in case user is offline or external API is unavailable
const DEFAULT_FALLBACK_RATES: Record<string, number> = {
  EUR: 1.0,
  CNY: 7.78,
  USD: 1.08,
  AUD: 1.66,
  JPY: 164.5,
  GBP: 0.85,
  CAD: 1.48,
  CHF: 0.96,
  HKD: 8.44,
  THB: 39.5,
  SGD: 1.46,
  KRW: 1475.0,
  IDR: 17200.0,
  VND: 27100.0,
  INR: 90.2,
  MXN: 18.2,
  BRL: 5.6,
  NZD: 1.81,
  AED: 3.97,
  MAD: 10.8,
  ZAR: 19.8,
};

let cachedRates: ExchangeRateData = {
  base: 'EUR',
  date: '2026-10-19',
  rates: DEFAULT_FALLBACK_RATES,
  source: 'Taux indicatifs de référence',
  isFallback: true,
};

export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chinois (CNY)' },
  { code: 'AUD', symbol: 'A$', name: 'Dollar Australien (AUD)' },
  { code: 'USD', symbol: '$', name: 'Dollar Américain (USD)' },
  { code: 'JPY', symbol: '¥', name: 'Yen Japonais (JPY)' },
  { code: 'GBP', symbol: '£', name: 'Livre Sterling (GBP)' },
  { code: 'CHF', symbol: 'CHF', name: 'Franc Suisse (CHF)' },
  { code: 'CAD', symbol: 'C$', name: 'Dollar Canadien (CAD)' },
  { code: 'THB', symbol: '฿', name: 'Baht Thaïlandais (THB)' },
  { code: 'SGD', symbol: 'S$', name: 'Dollar Singapourien (SGD)' },
  { code: 'HKD', symbol: 'HK$', name: 'Dollar de Hong Kong (HKD)' },
];

export async function fetchLiveExchangeRates(): Promise<ExchangeRateData> {
  // Try retrieving from localStorage first if cached today
  try {
    const saved = localStorage.getItem('voyageur_exchange_rates');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.rates && parsed.date) {
        cachedRates = parsed;
      }
    }
  } catch {
    // Ignore localStorage parse error
  }

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/EUR', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.rates) {
        const result: ExchangeRateData = {
          base: 'EUR',
          date: data.time_last_update_utc ? new Date(data.time_last_update_utc).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
          rates: { ...DEFAULT_FALLBACK_RATES, ...data.rates },
          source: 'ExchangeRate Open API (Banques centrales)',
          isFallback: false,
        };
        cachedRates = result;
        try {
          localStorage.setItem('voyageur_exchange_rates', JSON.stringify(result));
        } catch {
          // ignore
        }
        return result;
      }
    }
  } catch (err) {
    console.warn('Could not fetch external exchange rates, using robust fallback rates.', err);
  }

  return cachedRates;
}

export function getCachedRates(): ExchangeRateData {
  return cachedRates;
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  ratesData?: ExchangeRateData
): number {
  if (amount === 0 || from === to) return amount;
  const rates = (ratesData || cachedRates).rates;
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  // Convert from origin to EUR, then EUR to target
  const amountInEur = amount / fromRate;
  const converted = amountInEur * toRate;
  return Math.round(converted * 100) / 100;
}

export function formatMoney(amount: number, currency: string = 'EUR'): string {
  const currencyMatch = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  const symbol = currencyMatch ? currencyMatch.symbol : currency;
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${symbol}`;
}

export function formatPriceWithConversion(
  amount: number,
  originCurrency: string = 'EUR',
  targetDisplayCurrency: string = 'EUR',
  showOriginal: boolean = true
): { formatted: string; convertedAmount: number; originalText?: string } {
  if (!amount || amount === 0) {
    return { formatted: '0 ' + targetDisplayCurrency, convertedAmount: 0 };
  }
  const converted = convertCurrency(amount, originCurrency, targetDisplayCurrency);
  const formatted = formatMoney(converted, targetDisplayCurrency);

  let originalText: string | undefined = undefined;
  if (showOriginal && originCurrency !== targetDisplayCurrency) {
    originalText = `(orig. ${formatMoney(amount, originCurrency)})`;
  }

  return { formatted, convertedAmount: converted, originalText };
}

