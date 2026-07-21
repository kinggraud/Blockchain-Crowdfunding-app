import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FundCard from './FundCard';
import { loader } from '../assets';

const DisplayCampaigns = ({ title, isLoading, campaigns, isProfileView = false }) => {
  const navigate = useNavigate();
  // 🔍 State to trigger re-renders exactly as deadlines hit
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000); // Check every second

    return () => clearInterval(timer);
  }, []);

  const handleNavigate = (campaign) => {
    navigate(`/campaign-details/${campaign.title}`, { state: campaign });
  };

  // 🔍 UPDATED: If it's the profile view, display ALL campaigns. If homepage, filter out expired ones.
  const renderedCampaigns = campaigns?.filter((campaign) => {
    if (isProfileView) return true; // Keep everything on the profile page!

    let parsedDeadline = Number(campaign.deadline);

    // 🛡️ SAFETY CHECK: If the contract returned a 13-digit millisecond timestamp, scale it to 10-digit seconds
    if (parsedDeadline > 9999999999) {
      parsedDeadline = Math.floor(parsedDeadline / 1000);
    }

    // Compares both values accurately in Unix seconds
    return parsedDeadline > currentTime;
  }) || [];

  return (
    <div className="font-epilogue">
      <h1 className="font-semibold text-[18px] text-white text-left">
        {title} ({renderedCampaigns.length})
      </h1>

      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )}

        {!isLoading && renderedCampaigns.length === 0 && (
          <p className="font-semibold text-[14px] text-[#808191] leading-[30px]">
            No campaigns found.
          </p>
        )}

        {!isLoading && renderedCampaigns.length > 0 && renderedCampaigns.map((campaign) => {
          // Calculate if this specific card is expired for badge rendering
          let parsedDeadline = Number(campaign.deadline);
          if (parsedDeadline > 9999999999) parsedDeadline = Math.floor(parsedDeadline / 1000);
          const isExpired = parsedDeadline <= currentTime;

          return (
            <div 
              key={campaign.pId || campaign.id} 
              onClick={() => handleNavigate(campaign)}
              className="cursor-pointer relative group"
            >
              {/* 🌟 STATUS TAG OVERLAY (Renders on all cards when viewing profile history) */}
              <div className="absolute top-3 right-3 z-10">
                {isExpired ? (
                  <span className="bg-red-500/90 dark:bg-red-600/90 text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-md select-none">
                    🚫 Ended
                  </span>
                ) : (
                  <span className="bg-[#1dc071]/90 text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-md select-none">
                    ⚡ Active
                  </span>
                )}
              </div>

              <FundCard {...campaign} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DisplayCampaigns;