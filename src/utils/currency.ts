// Currency conversion utility
// Uses exchangerate-api.io free tier (1500 requests/month)

export type SupportedCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'BDT' | 'PKR';

interface ExchangeRates {
  USD: number;
  INR: number;
  EUR: number;
  GBP: number;
  BDT: number;
  PKR: number;
}

// Static fallback rates (updated: Dec 2025)
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  INR: 84.5,
  EUR: 0.92,
  GBP: 0.79,
  BDT: 110,
  PKR: 278,
};

let cachedRates: ExchangeRates | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch latest exchange rates from API
 */
async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    return {
      USD: 1,
      INR: data.rates.INR || FALLBACK_RATES.INR,
      EUR: data.rates.EUR || FALLBACK_RATES.EUR,
      GBP: data.rates.GBP || FALLBACK_RATES.GBP,
      BDT: data.rates.BDT || FALLBACK_RATES.BDT,
      PKR: data.rates.PKR || FALLBACK_RATES.PKR,
    };
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using fallback:', error);
    return FALLBACK_RATES;
  }
}

/**
 * Get exchange rates (cached for 24 hours)
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();

  // Return cached rates if still valid
  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }

  // Fetch fresh rates
  cachedRates = await fetchExchangeRates();
  lastFetchTime = now;

  return cachedRates;
}

/**
 * Convert USD to target currency
 */
export async function convertCurrency(
  amountUSD: number,
  targetCurrency: SupportedCurrency
): Promise<number> {
  if (targetCurrency === 'USD') {
    return amountUSD;
  }

  const rates = await getExchangeRates();
  return amountUSD * rates[targetCurrency];
}

/**
 * Format currency with proper symbol and rounding
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency
): string {
  const symbols: Record<SupportedCurrency, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    BDT: '৳',
    PKR: '₨',
  };

  // Round to nearest whole number for cleaner display
  const rounded = Math.round(amount);

  // Format with commas for Indian numbering system (INR)
  if (currency === 'INR') {
    return `${symbols[currency]}${rounded.toLocaleString('en-IN')}`;
  }

  // Standard formatting for other currencies
  return `${symbols[currency]}${rounded.toLocaleString('en-US')}`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  const symbols: Record<SupportedCurrency, string> = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    BDT: '৳',
    PKR: '₨',
  };
  return symbols[currency];
}

/**
 * Detect user's preferred currency based on timezone/location
 * This is a simple heuristic - you could enhance with IP-based detection
 */
export function detectUserCurrency(): SupportedCurrency {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // India timezone
  if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) {
    return 'INR';
  }

  // Pakistan timezone
  if (timezone.includes('Asia/Karachi')) {
    return 'PKR';
  }

  // Bangladesh timezone
  if (timezone.includes('Asia/Dhaka')) {
    return 'BDT';
  }

  // Europe timezones
  if (timezone.includes('Europe/')) {
    if (timezone.includes('London')) {
      return 'GBP';
    }
    return 'EUR';
  }

  // Default to USD
  return 'USD';
}
