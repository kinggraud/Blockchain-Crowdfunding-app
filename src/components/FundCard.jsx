import React from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { tagType, thirdweb } from '../assets';
import { daysLeft } from '../utils';

// 🔍 Utility: Map creator currency selection directly to visual symbols
const getCurrencySymbol = (currency) => {
  if (!currency) return 'Ξ'; // Default fallback to ETH symbol if undefined
  
  const upperCurrency = currency.toString().toUpperCase().trim();
  
  switch (upperCurrency) {
    case 'ETH':
    case 'ETHEREUM':
      return 'Ξ';
    case 'NGN':
    case 'NAIRA':
    case '0':
      return '₦';
    case 'USD':
    case 'DOLLAR':
    case '1':
      return '$';
    case 'EUR':
    case 'EURO':
    case '2':
      return '€';
    case 'GBP':
    case 'POUND':
      return '£';
    default:
      return upperCurrency.length === 1 ? upperCurrency : `${upperCurrency} `; 
  }
};

// 🧮 Safe formatter that converts BigNumber/Wei strings into human-readable numbers
const parseAndFormatAmount = (value) => {
  if (value === undefined || value === null || value === '') return '0';

  try {
    const strVal = value.toString();

    // If the value is a raw Wei string (18 decimals, e.g. length > 14 or standard 1e18 range)
    if (strVal.length > 14 && !strVal.includes('.')) {
      const formattedEth = ethers.utils 
        ? ethers.utils.formatEther(strVal) 
        : ethers.formatEther(strVal);
      
      const parsedNum = parseFloat(formattedEth);
      return isNaN(parsedNum) ? '0' : parsedNum.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }

    // Standard number formatting
    const parsed = Number(strVal);
    if (isNaN(parsed)) return '0';

    return parsed.toLocaleString(undefined, { maximumFractionDigits: 4 });
  } catch (error) {
    console.error("Error formatting card amount:", error);
    return '0';
  }
};

const FundCard = ({ 
  owner, 
  title, 
  description, 
  target, 
  deadline, 
  amountCollected, 
  image, 
  handleClick, 
  pId, 
  currency 
}) => {

  console.log(deadline);
console.log(typeof deadline);
console.log(new Date(deadline));
  const remainingDays = daysLeft(deadline);
  
  // 🔍 Extract symbol and formatted values
  const currencySymbol = getCurrencySymbol(currency);
  const formattedCollected = parseAndFormatAmount(amountCollected);
  const formattedTarget = parseAndFormatAmount(target);

  // 📊 Progress Calculation Handler
  const calculateProgress = (collectedVal, targetVal) => {
    try {
      // Normalize raw Wei to ETH float for calculation if needed
      let c = collectedVal ? collectedVal.toString() : '0';
      let t = targetVal ? targetVal.toString() : '1';

      if (c.length > 14 && !c.includes('.')) {
        c = ethers.utils ? ethers.utils.formatEther(c) : ethers.formatEther(c);
      }
      if (t.length > 14 && !t.includes('.')) {
        t = ethers.utils ? ethers.utils.formatEther(t) : ethers.formatEther(t);
      }

      const numCollected = parseFloat(c) || 0;
      const numGoal = parseFloat(t) || 1; // Prevent division by zero

      const percentage = Math.round((numCollected / numGoal) * 100);
      return percentage > 100 ? 100 : percentage;
    } catch {
      return 0;
    }
  };

  const progress = calculateProgress(amountCollected, target);

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="sm:w-[288px] w-full rounded-[20px] bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] hover:border-[#8c6dfd]/50 transition-all cursor-pointer overflow-hidden shadow-md dark:shadow-2xl group"
      onClick={handleClick}
    >
      {/* 🖼️ IMAGE SECTION */}
      <div className="relative h-[158px] w-full overflow-hidden">
        <img 
          src={image} 
          alt="fund" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-white/80 dark:bg-[#13131a]/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
          <p className="text-[#4acd8d] text-[10px] font-bold uppercase tracking-widest">Verified</p>
        </div>
      </div>

      <div className="flex flex-col p-5">
        {/* 🏷️ CATEGORY TAG */}
        <div className="flex flex-row items-center mb-3">
          <div className="p-1.5 bg-slate-100 dark:bg-[#13131a] rounded-lg">
            <img src={tagType} alt="tag" className="w-[14px] h-[14px] object-contain" />
          </div>
          <p className="ml-[10px] font-epilogue font-medium text-[12px] text-slate-500 dark:text-[#808191]">
            Crowdfunding Campaign
          </p>
        </div>

        {/* 📝 TEXT CONTENT */}
        <div className="block mb-4">
          <h3 className="font-epilogue font-bold text-[18px] text-slate-900 dark:text-white text-left leading-[24px] truncate group-hover:text-[#8c6dfd] transition-colors">
            {title}
          </h3>
          <p className="mt-[6px] font-epilogue font-normal text-slate-600 dark:text-[#808191] text-left leading-[20px] line-clamp-2">
            {description}
          </p>
        </div>

        {/* 📊 DYNAMIC PROGRESS BAR */}
        <div className="w-full bg-slate-200 dark:bg-[#3a3a43] h-[6px] rounded-full mb-5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d]"
          />
        </div>

        {/* 💰 DYNAMIC STATS */}
        <div className="flex justify-between flex-wrap gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-bold text-[14px] text-slate-700 dark:text-[#b2b3bd] leading-[22px]">
              {currencySymbol}{formattedCollected}
            </h4>
            <p className="mt-[2px] font-epilogue font-normal text-[11px] leading-[18px] text-slate-500 dark:text-[#808191] uppercase tracking-wider">
              Raised of {currencySymbol}{formattedTarget}
            </p>
          </div>

          <div className="flex flex-col items-end">
          <h4 className="font-epilogue font-bold text-[14px] text-slate-700 dark:text-[#b2b3bd] leading-[22px]">
            {remainingDays > 0 ? remainingDays : 'Ended'}
          </h4>

          {remainingDays > 0 && (
            <p className="mt-[2px] font-epilogue font-normal text-[11px] leading-[18px] text-slate-500 dark:text-[#808191] uppercase tracking-wider text-right">
              {remainingDays === 1 ? 'Day Left' : 'Days Left'}
            </p>
          )}
        </div>
        </div>

        {/* 👤 OWNER SECTION */}
        <div className="flex items-center mt-6 pt-4 border-t border-slate-100 dark:border-[#3a3a43] gap-[10px]">
          <div className="w-[28px] h-[28px] rounded-full flex justify-center items-center bg-slate-50 dark:bg-[#2c2f32] border border-slate-200 dark:border-[#3a3a43]">
            <img src={thirdweb} alt="user" className="w-1/2 h-1/2 object-contain grayscale opacity-60"/>
          </div>
          <p className="flex-1 font-epilogue font-medium text-[12px] text-slate-500 dark:text-[#808191] truncate">
            by <span className="text-slate-700 dark:text-[#b2b3bd] hover:text-[#8c6dfd] dark:hover:text-white transition-colors">{owner}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FundCard;