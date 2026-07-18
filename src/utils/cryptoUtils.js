// src/utils/cryptoUtils.js

// 🛡️ PRESENTATION FALLBACKS: Used if the internet fails or the API times out during your presentation
export let EXCHANGE_RATES = {
  ETH: 1.0,
  USD: 3500.00,
  GBP: 2750.00,
  EUR: 3200.00,
  NGN: 1500000.00 // Adjust to current baseline
};

export const CURRENCY_SYMBOLS = {
  ETH: 'Ξ',
  USD: '$',
  GBP: '£',
  EUR: '€',
  NGN: '₦'
};

/**
 * Dynamically fetches live exchange rates from a free public API
 */
export const fetchLiveRates = async () => {
  try {
    const response = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,NGN,GBP,EUR');
    const data = await response.json();
    
    if (data && data.USD) {
      EXCHANGE_RATES = {
        ETH: 1.0,
        USD: data.USD,
        GBP: data.GBP || EXCHANGE_RATES.GBP,
        EUR: data.EUR || EXCHANGE_RATES.EUR,
        NGN: data.NGN || EXCHANGE_RATES.NGN
      };
      console.log("⚡ Real-time exchange rates synchronized successfully:", EXCHANGE_RATES);
    }
  } catch (error) {
    console.warn("⚠️ API fetch failed. Reverting to hardcoded presentation fallbacks.", error);
  }
  return EXCHANGE_RATES;
};

/**
 * Converts fiat amount into its ETH equivalent string (Rounded to 4 decimal places)
 */
export const convertToEth = (amount, currency) => {
  if (!amount || isNaN(amount)) return "0.0000";
  const rate = EXCHANGE_RATES[currency] || 1;
  const ethValue = parseFloat(amount) / rate;
  return ethValue.toFixed(4); // Strictly locked to 4 decimal places as requested
};

/**
 * Converts an ETH amount into the chosen display currency string
 */
export const convertFromEth = (ethAmount, targetCurrency) => {
  if (!ethAmount || isNaN(ethAmount)) return "0.00";
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  const convertedValue = parseFloat(ethAmount) * rate;
  
  if (targetCurrency === 'NGN') return Math.round(convertedValue).toLocaleString();
  if (targetCurrency === 'ETH') return convertedValue.toFixed(4);
  return convertedValue.toFixed(2);
};