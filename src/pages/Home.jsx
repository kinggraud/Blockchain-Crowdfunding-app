import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DisplayCampaigns from '../components/DisplayCampaigns';
import { useStateContext } from '../context';

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const campaignRef = useRef(null);

  const { address, contract, getCampaigns } = useStateContext();

  const fetchCampaigns = async () => {
    if (!contract) return;
    try {
      setIsLoading(true);
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [address, contract]);

  return (
    /* Main Wrapper: Swaps between Light Slate and Deep Charcoal */
    <div className="w-full bg-slate-50 dark:bg-[#0f0f12] text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden">
      
      {/* 🌌 SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#8c6dfd] rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[300px] h-[300px] bg-[#1dc071] rounded-full blur-[100px] opacity-10" />

        <div className="relative z-10 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full border border-slate-200 dark:border-[#3a3a43] bg-white/50 dark:bg-[#1c1c24]/50 backdrop-blur-md text-[#8c6dfd] text-sm font-medium"
          >
            ✨ Final Year Project: Academic Blockchain Protocol
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight leading-tight"
          >
            Fund Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d]">
              Dreams
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A decentralized platform designed to raise funds for your needs, by using smart contracts to ensure transparency and security of all funds raised.
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/create-campaign')}
              className="bg-[#8c6dfd] hover:bg-[#7a59e6] text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#8c6dfd]/20"
            >
              Start a Campaign
            </button>
            
            <button 
              onClick={() => campaignRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] hover:bg-slate-100 dark:hover:bg-[#2c2f36] px-10 py-4 rounded-2xl font-bold transition-all text-slate-900 dark:text-white shadow-sm"
            >
              Browse Projects
            </button>
          </motion.div>
        </div>
      </section>

      {/* 🧊 SECTION 2: THE THREE PILLARS */}
      <section className="py-24 px-6 relative bg-white dark:bg-[#0f0f12]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Core Architecture</h2>
            <div className="h-1 w-20 bg-[#8c6dfd] mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Domain Vetting", desc: "Every campaign is tied to a specific domain (e.g., Engineering, Medicine) and every campaign creator is verified by a head", icon: "🛡️" },
              { title: "Smart Contracts", desc: "Automated logic ensures funds reach the right wallet without any central authority interference.", icon: "⚙️" },
              { title: "Immutable History", desc: "Every donation and registration is permanently recorded on the blockchain for full transparency.", icon: "💎" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-3xl bg-slate-100 dark:bg-gradient-to-b dark:from-[#1c1c24] dark:to-[#13131a] border border-slate-200 dark:border-[#2c2f36] hover:border-[#8c6dfd]/50 transition-all shadow-sm dark:shadow-none"
              >
                <div className="text-4xl mb-6 bg-white dark:bg-[#13131a] w-16 h-16 flex items-center justify-center rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 📜 SECTION 4: ACTIVE CAMPAIGNS */}
      <section ref={campaignRef} className="py-20 px-6 bg-slate-50 dark:bg-[#09090b]">
        <div className="max-w-7xl mx-auto">
          <DisplayCampaigns
            title="Active Campaigns"
            isLoading={isLoading}
            campaigns={campaigns}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;