import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStateContext } from "../context";

const Footer = () => {
  const navigate = useNavigate();
  const context = useStateContext() || {};
  const { 
    address, 
    connect, 
    setIsSignupModalOpen, 
    setSignupInitialRole 
  } = context;

  const normalizedAddr = address ? address.toLowerCase() : '';

  // Check registration status from localStorage
  const hasAdminRecord = Boolean(
    localStorage.getItem(`admin_account_${normalizedAddr}`) ||
    localStorage.getItem(`admin_status_${normalizedAddr}`)
  );

  const hasRecipientRecord = Boolean(
    localStorage.getItem(`user_account_${normalizedAddr}`) ||
    localStorage.getItem(`recipient_status_${normalizedAddr}`)
  );

  // Intelligent click handler based on registration status
  const handleAccountAction = (role) => {
    // 1. If wallet not connected, prompt wallet connection first
    if (!address && connect) {
      connect();
      return;
    }

    if (role === 'admin') {
      if (hasAdminRecord) {
        // Already registered admin -> Go straight to Admin Dashboard
        navigate('/admin-configuration');
      } else {
        // Unregistered -> Open Admin Registration Modal
        if (setSignupInitialRole) setSignupInitialRole('admin');
        if (setIsSignupModalOpen) setIsSignupModalOpen(true);
      }
    } else {
      if (hasRecipientRecord) {
        // Already registered recipient -> Go straight to Profile
        navigate('/profile');
      } else {
        // Unregistered -> Open Recipient Registration Modal
        if (setSignupInitialRole) setSignupInitialRole('recipient');
        if (setIsSignupModalOpen) setIsSignupModalOpen(true);
      }
    }
  };

  return (
    <footer className="relative bg-slate-100 dark:bg-[#0f0f12] pt-24 pb-12 overflow-hidden transition-colors duration-300 font-epilogue">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8c6dfd]/50 to-transparent" />
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#8c6dfd] rounded-full blur-[120px] opacity-10" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
        
        {/* Brand Identity */}
        <div className="md:col-span-4">
          <h2 className="text-3xl font-extrabold mb-6 tracking-tighter text-slate-900 dark:text-white">
            Escrow Crowdfunding<span className="text-[#8c6dfd]">.</span>
          </h2>
          <p className="text-slate-600 dark:text-gray-400 text-base leading-relaxed max-w-sm mb-8">
            Revolutionizing funding through blockchain transparency.
          </p>
          
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] flex items-center justify-center hover:border-[#8c6dfd] transition-colors cursor-pointer group"
              >
                <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 group-hover:bg-[#8c6dfd]" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2">
          <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase text-xs tracking-[0.2em]">Platform</h3>
          <ul className="space-y-4 text-slate-600 dark:text-gray-400 font-medium">
            <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/">Home</Link></li>
            <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/profile">Profile</Link></li>
            <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/create-campaign">Create</Link></li>
            <li className="hover:text-[#8c6dfd] transition-colors"><Link to="/home">Dashboard</Link></li>
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

        {/* Account Access & Setup CTA Section */}
        <div className="md:col-span-4">
          <div className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] p-8 rounded-3xl relative overflow-hidden group shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#8c6dfd] opacity-5 blur-2xl group-hover:opacity-10 transition-opacity" />
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to launch?</h3>
            <p className="text-slate-500 text-sm mb-6">Manage campaigns or access administrator operations.</p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleAccountAction('recipient')}
                className="w-full bg-[#8c6dfd] py-3 rounded-xl font-bold text-white hover:bg-[#7a59e6] transition-all shadow-lg shadow-[#8c6dfd]/10 cursor-pointer text-sm"
              >
                {hasRecipientRecord ? 'Go to Recipient Profile' : 'Register Recipient Account'}
              </button>
              
              <button
                onClick={() => handleAccountAction('admin')}
                className="w-full bg-transparent border border-[#3a3a43] text-slate-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:border-[#8c6dfd] hover:text-[#8c6dfd] transition-all cursor-pointer text-sm"
              >
                {hasAdminRecord ? 'Access Admin Portal' : 'Register Admin Account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-200 dark:border-[#1c1c24] flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-medium uppercase tracking-widest">
        <p>© {new Date().getFullYear()} Escrow Crowdfunding. All rights reserved.</p>
        <div className="flex gap-8">
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Status</span>
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">System Log</span>
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Sepolia Testnet</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;