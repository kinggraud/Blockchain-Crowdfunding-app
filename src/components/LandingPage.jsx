import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// 🪙 Pull in Thirdweb connection hooks for direct wallet management
import { useAddress, useConnect, MetaMaskWallet } from '@thirdweb-dev/react';

// 🔐 Import your new AuthModal component
import AuthModal from '../components/AuthModal';

// --- IMAGE CAROUSEL ARRAYS ---
const educationImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop"  
];

const communityImages = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1541515929569-1771522cbaa9?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=600&auto=format&fit=crop"  
];

const medicalImages = [
  "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop"  
];

const AutoChangingImage = ({ images, altText }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="w-full h-[350px] sm:h-[450px] rounded-[24px] overflow-hidden shadow-2xl relative border border-slate-200 dark:border-slate-800">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={altText}
          className="w-full h-full object-cover absolute top-0 left-0"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
    </div>
  );
};

const LandingPage = ({ onGetStarted }) => {
  const navigate = useNavigate();
  const address = useAddress();
  const connect = useConnect();
  const metamaskConfig = new MetaMaskWallet();

  // 🔑 State for controlling Auth Modal popup visibility
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Helper function to handle cleaning up the scroll states safely
  const resetScrollPosition = () => {
    const mainScroll = document.getElementById("main-scroll-container");
    if (mainScroll) {
      mainScroll.scrollTo(0, 0);
      mainScroll.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#13131a] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden font-epilogue">
      
      {/* 🌟 HERO BANNER CONTAINER */}
      <section className="max-w-[1280px] mx-auto px-4 pt-12 pb-6 flex flex-col items-center text-center relative">
        
        {/* 🔙 BACK TO APP DASHBOARD NAVIGATION LINK BUTTON 
        <div className="w-full max-w-[900px] flex justify-start mb-4">
          <button 
            onClick={() => {
              if (onGetStarted) onGetStarted();
              resetScrollPosition();
              navigate('/home');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1c1c24] hover:bg-slate-100 dark:hover:bg-[#2c2f32] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#3a3a43] transition-all cursor-pointer shadow-sm"
          >
            📊 Jump to App Dashboard
          </button>
        </div>
        */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-[#1c1c24]/80 backdrop-blur-md border border-slate-200 dark:border-[#3a3a43] rounded-[32px] p-6 sm:p-12 max-w-[900px] shadow-xl w-full"
        >
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#8c6dfd]/10 text-[#8c6dfd] tracking-wide uppercase">
            Web3 Fundraising Platform
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mt-6 tracking-tight leading-tight">
            Empower Change Globally with <span className="text-[#1dc071]">Transparent</span> Escrow Style Crowdfunding
          </h1>
          <p className="text-slate-500 dark:text-[#808191] max-w-[650px] mx-auto mt-4 text-sm sm:text-base font-normal">
            Every donation stays locked safely in the smart contract escrow. Funds are only transferred if milestones are verified, protecting your contribution from fraud.
          </p>
        </motion.div>
      </section>

      {/* 📊 ASYMMETRIC CONTENT BLOCK */}
      <section className="border-t border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c1c24] transition-colors">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 sm:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            <h2 className="text-4xl font-extrabold tracking-tight">
              Honest Fundraising <span className="italic underline text-[#8c6dfd]">(finally)</span> Has a Home.
            </h2>
          </div>
          <div className="p-8 sm:p-16 flex flex-col justify-center bg-slate-50/50 dark:bg-black/10">
            <p className="text-lg text-slate-600 dark:text-[#808191] leading-relaxed">
              Launch public campaigns, handle real-time milestones, analyze contributors, and build trusting decentralized circles. This is the optimal cryptographic alternative to web2 crowdfunding.
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#1dc071] bg-[#1dc071]/10 px-4 py-2 rounded-xl">
                🛡️ Zero Admin Fees • 100% Direct Payouts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 🏃‍♂️ INFINITE RUNNING TEXT TICKER FEATURE */}
      <div className="bg-[#8c6dfd] text-white py-3 font-bold text-xs sm:text-sm tracking-widest uppercase overflow-hidden whitespace-nowrap select-none">
        <div className="inline-block animate-marquee uppercase">
          LAUNCH CAMPAIGNS • TRANSPARENT ESCROW • AUTOMATIC REFUNDS • ZERO MIDDLEMEN • SECURE WALLET SIGN-IN • VERIFIED RECIPIENTS • LAUNCH CAMPAIGNS • TRANSPARENT ESCROW • AUTOMATIC REFUNDS • ZERO MIDDLEMEN • SECURE WALLET SIGN-IN • VERIFIED RECIPIENTS •
        </div>
      </div>

      {/* 🔄 ALTERNATING CONTENT BLOCKS */}
      <section className="max-w-[1280px] mx-auto px-4 py-16 space-y-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <AutoChangingImage images={educationImages} altText="Education fundraising campaign" />
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-xl">🎓</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Support Emerging Scholars</h3>
            <p className="text-slate-600 dark:text-[#808191] leading-relaxed">
              Fund tuition, provide direct academic support structures, supply classrooms, or enable underprivileged graduating students to unlock higher learning potential securely without institutional leaks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 order-2 md:order-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-xl">🚰</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Revitalize Impoverished Communities</h3>
            <p className="text-slate-600 dark:text-[#808191] leading-relaxed">
              Help establish reliable water pipelines, supply relief infrastructure to disaster areas, or deploy resources to regions lacking foundational amenities directly via targeted global crypto pipelines.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <AutoChangingImage images={communityImages} altText="Community development framework" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <AutoChangingImage images={medicalImages} altText="Medical aid relief" />
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl">❤️</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Deploy Life-Saving Medical Care</h3>
            <p className="text-slate-600 dark:text-[#808191] leading-relaxed">
              Provide necessary medical machinery, cover high-stakes operations, or fund mobile healthcare outreach missions to protect populations navigating unexpected wellness emergencies.
            </p>
          </div>
        </div>
      </section>

      {/* 🚀 STICKY GET STARTED CTA FOOTER WRAPPER */}
      <footer className="sticky bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#1c1c24]/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-6 px-4 shadow-2xl transition-colors">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-base">Ready to interact with the next generation of charity?</h4>
            <p className="text-xs text-slate-500 dark:text-[#808191]">Create an account or log in to manage your campaigns.</p>
          </div>
          
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="px-8 py-3 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl text-sm transition-all shadow-lg cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </footer>

      {/* Auth Modal Popup Component */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

    </div>
  );
};

export default LandingPage;