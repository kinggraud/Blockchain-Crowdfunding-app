import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Ensure this points to your firebase config
import { useStateContext } from '../context';

const Logout = () => {
  const navigate = useNavigate();
  
  // Extract context values safely
  const context = useStateContext() || {};
  const { 
    disconnect, 
    setUserStatus, 
    setRecipientStatus, 
    setAdminStatus, 
    setIsSignupModalOpen,
    setUser // If your context has setUser, clear it here as well
  } = context;

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const performFullLogout = async () => {
      try {
        // 1. Sign out from Firebase Auth
        if (auth) {
          await signOut(auth);
          console.log("🔥 FIREBASE AUTH: User signed out successfully");
        }

        // 2. Disconnect Web3 Wallet provider connection
        if (disconnect) {
          await disconnect();
        }

        // 3. Clear active Context state for the current session
        if (setUser) setUser(null);
        if (setUserStatus) setUserStatus(null);
        if (setRecipientStatus) setRecipientStatus(null);
        if (setAdminStatus) setAdminStatus(null);
        if (setIsSignupModalOpen) setIsSignupModalOpen(false);

        // 4. Selective LocalStorage Cleanup (Preserves registered accounts & environments)
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          if (key) {
            // Check if key is a persistent user/platform record
            const isProtectedKey = 
              key.startsWith('admin_environments') || 
              key.startsWith('pending_campaign_submissions') ||
              key.startsWith('admin_status_') ||
              key.startsWith('admin_account_') ||
              key.startsWith('recipient_status_') ||
              key.startsWith('recipient_account_') ||
              key.startsWith('user_account_') ||
              key.startsWith('registered_users');

            // If it's NOT a protected profile or platform key, queue it for removal
            if (!isProtectedKey) {
              keysToRemove.push(key);
            }
          }
        }
        
        // Remove active session tokens and state flags
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        sessionStorage.clear();

        console.log("🧹 LOGOUT CLEANUP: Session purged while preserving persistent user accounts & environments.");

      } catch (error) {
        console.error("Error during session logout cleanup execution:", error);
      }
    };

    performFullLogout();

    // 5. Execution Countdown transition loop tracker
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/landing', { replace: true }); // Redirects straight to Landing page
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, disconnect, setUserStatus, setRecipientStatus, setAdminStatus, setIsSignupModalOpen, setUser]);

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] bg-[#1c1c24]/80 backdrop-blur-xl border border-[#3a3a43] rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative z-10 font-epilogue"
      >
        <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 text-2xl flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-inner animate-pulse">
          🔓
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          Logging You Out
        </h1>
        
        <p className="text-gray-400 text-sm sm:text-base mb-8 leading-relaxed">
          Revoking Firebase session, disconnecting wallet, and clearing active session data...
        </p>

        <div className="relative w-20 h-20 mx-auto flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-4 border-[#3a3a43] rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#8c6dfd] border-r-[#8c6dfd] rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
          <span className="text-xl font-bold text-white">{countdown}s</span>
        </div>

        <p className="text-xs text-slate-500 italic mt-6">
          🔄 Your session has been revoked. You will need to sign in again to continue.
        </p>
      </motion.div>
    </div>
  );
};

export default Logout;