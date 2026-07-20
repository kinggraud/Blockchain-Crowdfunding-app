import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useStateContext } from '../context'; // Imported the context hook
import { FundCard } from './index';
import { loader } from '../assets';

const DisplayCampaigns = ({ title, isLoading, campaigns }) => {
  const navigate = useNavigate();
  
  // Pull the global search term from your state context
  const { searchTerm } = useStateContext();

  const handleNavigate = (campaign) => {
    // We use the title for the URL, but the entire 'campaign' object 
    // (including pId) is sent in the state.
    navigate(`/campaign-details/${campaign.title}`, { state: campaign });
  }

  // Filter campaigns dynamically based on title or description
  // Uses optional chaining (?.) and a fallback empty array [] to prevent loading crashes
  const filteredCampaigns = (campaigns || []).filter(c => 
    c.title?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    c.description?.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div>
        {/* Updated layout counting the filtered results dynamically */}
        <h1 className="font-epilogue font-semibold text-[18px] text-slate-900 dark:text-white text-left">
          {title} ({filteredCampaigns.length})
        </h1>

        <div className="flex flex-wrap mt-[20px] gap-[26px]">
            {isLoading && (
                <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain"/>
            )}

            {!isLoading && filteredCampaigns.length === 0 && (
                <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
                  No campaigns found matching your search.
                </p>
            )}

            {/* Changed from original campaigns map to use the dynamic filtered list instead */}
            {!isLoading && filteredCampaigns.length > 0 && filteredCampaigns.map((campaign) => (
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

export default DisplayCampaigns;