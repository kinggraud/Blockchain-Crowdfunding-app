import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FundCard from './FundCard';
import { loader } from '../assets';

const DisplayCampaigns = ({ title, isLoading, campaigns }) => {
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

  // 🔍 Filter out campaigns where the deadline timestamp is less than or equal to current time
  const activeCampaigns = campaigns.filter((campaign) => {
    const parsedDeadline = Number(campaign.deadline);
    return parsedDeadline > currentTime;
  });

  return (
    <div className="font-epilogue">
      <h1 className="font-semibold text-[18px] text-white text-left">
        {title} ({activeCampaigns.length})
      </h1>

      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {isLoading && (
          <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
        )}

        {!isLoading && activeCampaigns.length === 0 && (
          <p className="font-semibold text-[14px] text-[#808191] leading-[30px]">
            No active campaigns found.
          </p>
        )}

        {!isLoading && activeCampaigns.length > 0 && activeCampaigns.map((campaign) => (
          <div 
            key={campaign.pId || campaign.id} 
            onClick={() => handleNavigate(campaign)}
            className="cursor-pointer"
          >
            <FundCard {...campaign} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayCampaigns;