import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SignupModal from "./SignupModal";

const Footer = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* UPDATED: Added bg-slate-100 and transition classes */}
      <footer className="relative bg-slate-100 dark:bg-[#0f0f12] pt-24 pb-12 overflow-hidden transition-colors duration-300">
        
        {/* Subtle Background Glow - Adjusted for Light Mode visibility */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8c6dfd]/50 to-transparent" />
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#8c6dfd] rounded-full blur-[120px] opacity-10" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
          
          {/* Brand Identity */}
          <div className="md:col-span-4">
            {/* UPDATED: text-slate-900 for Light Mode */}
            <h2 className="text-3xl font-extrabold mb-6 tracking-tighter text-slate-900 dark:text-white">
              FundSphere<span className="text-[#8c6dfd]">.</span>
            </h2>
            {/* UPDATED: text-slate-600 for Light Mode */}
            <p className="text-slate-600 dark:text-gray-400 text-base leading-relaxed max-w-sm mb-8">
              Revolutionizing academic funding through blockchain transparency. Empowering the next generation of innovators, one block at a time.
            </p>
            
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                /* UPDATED: bg-white and border-slate-200 for Light Mode */
                <div key={i} className="w-10 h-10 rounded-full bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] flex items-center justify-center hover:border-[#8c6dfd] transition-colors cursor-pointer group">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 group-hover:bg-[#8c6dfd]" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            {/* UPDATED: text-slate-900 for Light Mode */}
            <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Platform</h3>
            <ul className="space-y-4 text-slate-600 dark:text-gray-400 font-medium">
              <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/">Home</Link></li>
              <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/profile">Profile</Link></li>
              <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/create-campaign">Create</Link></li>
              <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal/Resources */}
          <div className="md:col-span-2">
            <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Legal</h3>
            <ul className="space-y-4 text-slate-600 dark:text-gray-400 font-medium">
              <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/privacy">Privacy</Link></li>
              <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/terms">Terms</Link></li>
              <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/help">Help Center</Link></li>
            </ul>
          </div>

          {/* CTA Section */}
          <div className="md:col-span-4">
            {/* UPDATED: bg-white and border-slate-200 for Light Mode */}
            <div className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] p-8 rounded-3xl relative overflow-hidden group shadow-sm dark:shadow-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#8c6dfd] opacity-5 blur-2xl group-hover:opacity-10 transition-opacity" />
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Ready to launch?</h3>
              <p className="text-slate-500 text-sm mb-6">Join the ecosystem and secure funding</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-[#8c6dfd] py-3 rounded-xl font-bold text-white hover:bg-[#7a59e6] transition-all shadow-lg shadow-[#8c6dfd]/10"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* UPDATED: border-slate-200 for Light Mode */}
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-200 dark:border-[#1c1c24] flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-medium uppercase tracking-widest">
          <p>© {new Date().getFullYear()} FundSphere Labs. Built for Web3.</p>
          <div className="flex gap-8">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Status</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">System Log</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Mainnet</span>
          </div>
        </div>
      </footer>

      <SignupModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(role) => {
          console.log("Selected role:", role);
          setShowModal(false);
        }}
      />
    </>
  );
};

export default Footer;