import { useEffect, useState } from 'react';
import { useCurrency } from '../../hooks/useCurrency';

interface PriceProps {
  amountUSD: number;
  className?: string;
  showConverted?: boolean;
  convertedClassName?: string;
}

/**
 * Price component that displays USD price with converted currency below
 */
export function Price({
  amountUSD,
  className = '',
  showConverted = true,
  convertedClassName = ''
}: PriceProps) {
  const { userCurrency, convertAndFormat } = useCurrency();
  const [convertedPrice, setConvertedPrice] = useState<string>('');

  useEffect(() => {
    if (showConverted && userCurrency !== 'USD') {
      convertAndFormat(amountUSD).then(setConvertedPrice);
    }
  }, [amountUSD, userCurrency, convertAndFormat, showConverted]);

  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <span className={className}>${amountUSD}</span>
      {showConverted && userCurrency !== 'USD' && convertedPrice && (
        <span className={`text-xs text-slate-500 font-medium ${convertedClassName}`}>
          ≈ {convertedPrice}
        </span>
      )}
    </div>
  );
}
