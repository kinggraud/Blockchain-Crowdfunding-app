// src/utils/cryptoUtils.js

// 🛡️ PRESENTATION FALLBACKS: Used if the internet fails or APIs time out during presentation
export let EXCHANGE_RATES = {
  ETH: 1.0,
  USD: 3000.00,
  GBP: 2350.00,
  EUR: 2750.00,
  NGN: 4500000.00
};

export const CURRENCY_SYMBOLS = {
  ETH: 'Ξ',
  USD: '$',
  GBP: '£',
  EUR: '€',
  NGN: '₦'
};

/**
 * Dynamically fetches live exchange rates with automatic multi-API fallback to prevent CORS blocks.
 */
export const fetchLiveRates = async () => {
  try {
    // 1️⃣ Primary Attempt: CoinGecko Free API (Generally very permissive with browser CORS)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,ngn,gbp,eur'
    );

    if (response.ok) {
      const data = await response.json();
      if (data?.ethereum) {
        EXCHANGE_RATES = {
          ETH: 1.0,
          USD: data.ethereum.usd || EXCHANGE_RATES.USD,
          GBP: data.ethereum.gbp || EXCHANGE_RATES.GBP,
          EUR: data.ethereum.eur || EXCHANGE_RATES.EUR,
          NGN: data.ethereum.ngn || EXCHANGE_RATES.NGN
        };
        console.log("⚡ Live rates synced via CoinGecko:", EXCHANGE_RATES);
        return EXCHANGE_RATES;
      }
    }
  } catch (err) {
    console.warn("⚠️ CoinGecko API fetch failed. Trying secondary provider...", err);
  }

  try {
    // 2️⃣ Secondary Fallback Attempt: CryptoCompare API
    const response = await fetch(
      'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,NGN,GBP,EUR'
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.USD) {
        EXCHANGE_RATES = {
          ETH: 1.0,
          USD: data.USD,
          GBP: data.GBP || EXCHANGE_RATES.GBP,
          EUR: data.EUR || EXCHANGE_RATES.EUR,
          NGN: data.NGN || EXCHANGE_RATES.NGN
        };
        console.log("⚡ Live rates synced via CryptoCompare:", EXCHANGE_RATES);
        return EXCHANGE_RATES;
      }
    }
  } catch (err) {
    console.warn("⚠️ CryptoCompare fetch failed (CORS or network error). Using baseline fallbacks.", err);
  }

  // 3️⃣ Final Fallback: Return baseline constants safely
  return EXCHANGE_RATES;
};

/**
 * Converts fiat amount into its ETH equivalent string (Rounded to 4 decimal places)
 */
export const convertToEth = (amount, currency) => {
  if (!amount || isNaN(amount)) return "0.0000";
  const rate = EXCHANGE_RATES[currency] || 1;
  const ethValue = parseFloat(amount) / rate;
  return ethValue.toFixed(4); // Strictly locked to 4 decimal places
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