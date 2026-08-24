import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStateContext } from '../context';
import { Loader, FundCard } from '../components';
import { daysLeft } from '../utils';

const ActiveCampaigns = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract query parameters
  const cameFromLanding = searchParams.get('from') === 'landing';
  const initialSearch = searchParams.get('search') || '';

  const { getCampaigns, contract } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Sync search input if query param changes dynamically
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchActiveCampaigns = async () => {
      setIsLoading(true);
      try {
        if (getCampaigns) {
          const data = await getCampaigns();
          const activeOnly = (data || []).filter(
            (campaign) => daysLeft(campaign.deadline) > 0
          );
          setCampaigns(activeOnly);
        }
      } catch (error) {
        console.error("Error fetching active campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (contract) {
      fetchActiveCampaigns();
    }
  }, [contract, getCampaigns]);

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#13131a] text-slate-900 dark:text-white px-4 py-8 font-epilogue">
      {isLoading && <Loader />}

      <div className="max-w-[1280px] mx-auto">
        {/* Navigation Bar / Back Action */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-[#3a3a43]">
          <button
            type="button"
            onClick={() => navigate(-1)} // Use native browser back history directly
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2c2c35] transition-all cursor-pointer shadow-sm group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Previous Page</span>
          </button>
        </div>

        {/* Title & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Active Campaigns ({filteredCampaigns.length})</h1>
            <p className="text-slate-500 dark:text-[#808191] text-sm mt-1">
              Ongoing escrow campaigns currently accepting contributions.
            </p>
          </div>

          <input
            type="text"
            placeholder="Filter active campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2.5 px-4 rounded-xl bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] outline-none text-sm text-slate-800 dark:text-white focus:border-[#8c6dfd]"
          />
        </div>

        {/* Grid Display */}
        {!isLoading && filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#1c1c24] rounded-2xl border border-slate-200 dark:border-[#3a3a43]">
            <p className="text-slate-400 text-sm font-semibold">No active campaigns found.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-[26px]">
            {filteredCampaigns.map((campaign) => (
              <FundCard 
                key={campaign.pId ?? campaign.title}
                {...campaign}
                handleClick={() => navigate(`/campaign-details/${campaign.title}`, { state: campaign })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveCampaigns;