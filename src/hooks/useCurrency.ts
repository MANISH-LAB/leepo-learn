import { useState, useEffect } from 'react';
import {
  SupportedCurrency,
  detectUserCurrency,
  convertCurrency,
  formatCurrency,
} from '../utils/currency';

interface UseCurrencyReturn {
  userCurrency: SupportedCurrency;
  convertAndFormat: (amountUSD: number) => Promise<string>;
  isConverting: boolean;
}

/**
 * Hook to handle currency detection and conversion
 */
export function useCurrency(): UseCurrencyReturn {
  const [userCurrency, setUserCurrency] = useState<SupportedCurrency>('USD');
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    // Detect user's currency on mount
    const detected = detectUserCurrency();
    setUserCurrency(detected);
  }, []);

  const convertAndFormat = async (amountUSD: number): Promise<string> => {
    setIsConverting(true);
    try {
      const converted = await convertCurrency(amountUSD, userCurrency);
      return formatCurrency(converted, userCurrency);
    } finally {
      setIsConverting(false);
    }
  };

  return {
    userCurrency,
    convertAndFormat,
    isConverting,
  };
}
