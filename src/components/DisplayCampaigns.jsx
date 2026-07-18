import React from 'react'
import { useNavigate } from 'react-router-dom'; 
import { FundCard } from './index';
import { loader } from '../assets';

const DisplayCampaigns = ( { title, isLoading, campaigns } ) => {
    const navigate = useNavigate();

    const handleNavigate = (campaign) => {
        // We use the title for the URL, but the entire 'campaign' object 
        // (including pId) is sent in the state.
        navigate(`/campaign-details/${campaign.title}`, { state: campaign });
    }

  return (
    <div>
        {/* UPDATED: Added text-slate-900 for Light Mode visibility */}
        <h1 className="font-epilogue font-semibold text-[18px] text-slate-900 dark:text-white text-left">
          {title} ({campaigns?.length || 0})
        </h1>

        <div className="flex flex-wrap mt-[20px] gap-[26px]">
            {isLoading && (
                <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain"/>
            )}

            {!isLoading && campaigns.length === 0 && (
                <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
                  You have not created any campaigns yet
                </p>
            )}

            {!isLoading && campaigns.length > 0 && campaigns.map((campaign) => (
              <FundCard 
                // CRITICAL: Use pId from our context mapping as the key
                key={campaign.pId} 
                {...campaign}
                // This triggers the handleNavigate function when a card is clicked
                handleClick={() => handleNavigate(campaign)}
              />
            ))}
        </div>
    </div>
  )
}

export default DisplayCampaigns