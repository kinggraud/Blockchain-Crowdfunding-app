import React from 'react';
import { motion } from 'framer-motion';
import { tagType, thirdweb } from '../assets';
import { daysLeft } from '../utils';

const FundCard = ({ owner, title, description, target, deadline, amountCollected, image, handleClick, pId }) => {
  const remainingDays = daysLeft(deadline);
  
  const calculateProgress = (collected, goal) => {
    const percentage = Math.round((collected / goal) * 100);
    return percentage > 100 ? 100 : percentage;
  };

  const progress = calculateProgress(amountCollected, target);

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      // UPDATED: bg-white and border-slate-200 for Light Mode
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
        {/* UPDATED: bg-white/80 for Light Mode overlay */}
        <div className="absolute top-3 right-3 bg-white/80 dark:bg-[#13131a]/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
          <p className="text-[#4acd8d] text-[10px] font-bold uppercase tracking-widest">Verified</p>
        </div>
      </div>

      <div className="flex flex-col p-5">
        {/* 🏷️ CATEGORY TAG */}
        <div className="flex flex-row items-center mb-3">
          {/* UPDATED: bg-slate-100 for Light Mode */}
          <div className="p-1.5 bg-slate-100 dark:bg-[#13131a] rounded-lg">
            <img src={tagType} alt="tag" className="w-[14px] h-[14px] object-contain" />
          </div>
          <p className="ml-[10px] font-epilogue font-medium text-[12px] text-slate-500 dark:text-[#808191]">Academic Research</p>
        </div>

        {/* 📝 TEXT CONTENT */}
        <div className="block mb-4">
          {/* UPDATED: text-slate-900 for Light Mode */}
          <h3 className="font-epilogue font-bold text-[18px] text-slate-900 dark:text-white text-left leading-[24px] truncate group-hover:text-[#8c6dfd] transition-colors">
            {title}
          </h3>
          {/* UPDATED: text-slate-600 for Light Mode */}
          <p className="mt-[6px] font-epilogue font-normal text-slate-600 dark:text-[#808191] text-left leading-[20px] line-clamp-2">
            {description}
          </p>
        </div>

        {/* 📊 DYNAMIC PROGRESS BAR */}
        {/* UPDATED: bg-slate-200 for Light Mode bar background */}
        <div className="w-full bg-slate-200 dark:bg-[#3a3a43] h-[6px] rounded-full mb-5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d]"
          />
        </div>

        {/* 💰 FUNDING STATS */}
        <div className="flex justify-between flex-wrap gap-2">
          <div className="flex flex-col">
            {/* UPDATED: text-slate-700 for Light Mode */}
            <h4 className="font-epilogue font-bold text-[14px] text-slate-700 dark:text-[#b2b3bd] leading-[22px]">
              {amountCollected} ETH
            </h4>
            <p className="mt-[2px] font-epilogue font-normal text-[11px] leading-[18px] text-slate-500 dark:text-[#808191] uppercase tracking-wider">
              Raised of {target}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <h4 className="font-epilogue font-bold text-[14px] text-slate-700 dark:text-[#b2b3bd] leading-[22px]">
              {remainingDays > 0 ? remainingDays : 'Ended'}
            </h4>
            <p className="mt-[2px] font-epilogue font-normal text-[11px] leading-[18px] text-slate-500 dark:text-[#808191] uppercase tracking-wider text-right">
              {remainingDays === 1 ? 'Day Left' : 'Days Left'}
            </p>
          </div>
        </div>

        {/* 👤 OWNER SECTION */}
        {/* UPDATED: border-slate-100 for Light Mode separator */}
        <div className="flex items-center mt-6 pt-4 border-t border-slate-100 dark:border-[#3a3a43] gap-[10px]">
          {/* UPDATED: bg-slate-50 for Light Mode avatar background */}
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
}

export default FundCard;