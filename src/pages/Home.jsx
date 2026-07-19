import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DisplayCampaigns from '../components/DisplayCampaigns';
import { useStateContext } from '../context';

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const campaignRef = useRef(null);

  const { address, contract, getCampaigns } = useStateContext();

  const fetchCampaigns = async () => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const data = await getCampaigns();
      setCampaigns(data);
      setFilteredCampaigns(data);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [address, contract]);

  // Handle live keyword filtering across campaign titles and descriptions
  useEffect(() => {
    const filtered = campaigns.filter(campaign => 
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCampaigns(filtered);
  }, [searchQuery, campaigns]);

  // Select only the first 2 active campaigns to showcase in the top featured spotlights grid
  const featuredCampaigns = campaigns.slice(0, 2);

  // Fallback stock images for campaigns missing structural image targets
  const fallbackImages = [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop", // Education
    "https://images.unsplash.com/photo-1541515929569-1771522cbaa9?q=80&w=600&auto=format&fit=crop"  // Aid
  ];

  return (
    <div className="w-full space-y-12 pb-12 font-epilogue text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* 🌟 1. SELECT FEATURED HIGHLIGHTS (Top Curated Spot) */}
      <div className="pt-4">
        <div className="flex flex-col mb-6">
          <span className="text-[#8c6dfd] font-bold text-xs tracking-wider uppercase">Curated Collections</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">Featured Spotlights</h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8c6dfd]" />
          </div>
        ) : featuredCampaigns.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-[#1c1c24] border border-dashed border-slate-200 dark:border-[#3a3a43] rounded-[24px]">
            <p className="text-sm text-slate-400">No active campaigns available to spotlight right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredCampaigns.map((campaign, index) => (
              <div 
                key={index}
                onClick={() => navigate(`/campaign-details/${campaign.pId || index}`, { state: campaign })}
                className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row h-full cursor-pointer group"
              >
                {/* Visual Image Block */}
                <div className="sm:w-2/5 h-[200px] sm:h-auto relative overflow-hidden">
                  <img 
                    src={campaign.image || fallbackImages[index % fallbackImages.length]} 
                    alt={campaign.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
                      ⭐ Highlighted
                    </span>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-[16px] line-clamp-2 leading-tight group-hover:text-[#8c6dfd] transition-colors">
                      {campaign.title}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-[#808191] mt-1 truncate">
                      By: {campaign.owner}
                    </p>
                    <p className="text-slate-500 dark:text-[#808191] text-xs font-normal mt-3 line-clamp-3 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                  
                  {/* Clean progress footprint */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#2c2f36] flex justify-between items-center text-xs">
                    <div>
                      <span className="block font-extrabold text-[#1dc071]">
                        {campaign.amountCollected} ETH
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Target: {campaign.target} ETH
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-[#2c2f36] rounded-lg text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                      Active Goal
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🏃‍♂️ INFINITE RUNNING TEXT TICKER SEPARATOR (Matches Landing Page Style) */}
      <div className="-mx-8 bg-slate-900 dark:bg-[#1c1c24] text-white/90 py-3.5 font-bold text-xs tracking-widest uppercase overflow-hidden whitespace-nowrap border-y border-slate-200 dark:border-[#3a3a43] select-none">
        <div className="inline-block animate-marquee uppercase">
          LIVE CONTRACT UPDATES • DECENTRALIZED TRUST CIRCLES • ZERO ADMINISTRATIVE LEAKS • SECURE WALLET ESCROW • LIVE CONTRACT UPDATES • DECENTRALIZED TRUST CIRCLES • ZERO ADMINISTRATIVE LEAKS • SECURE WALLET ESCROW •
        </div>
      </div>

      {/* 🔍 2. SEARCHABLE LIVE CAMPAIGNS SECTION */}
      <div ref={campaignRef} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#1dc071] font-bold text-xs tracking-wider uppercase">Real-Time Data Pool</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">Live Campaigns</h2>
          </div>

          {/* Interactive Search Field */}
          <div className="w-full sm:max-w-[350px] flex items-center bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-xl px-4 py-2.5 shadow-inner focus-within:ring-2 ring-[#8c6dfd]/20 transition-all">
            <input 
              type="text"
              placeholder="Search active campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
            />
            <span className="text-slate-400 text-sm ml-2">🔍</span>
          </div>
        </div>

        {/* Handing over filtered arrays straight to your reusable card renderer */}
        <div className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-[28px] p-6 shadow-sm">
          <DisplayCampaigns
            title=""
            isLoading={isLoading}
            campaigns={filteredCampaigns}
          />
        </div>
      </div>

    </div>
  );
};

export default Home;