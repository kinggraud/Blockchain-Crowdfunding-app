import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStateContext } from '../context';

const Logout = () => {
  const navigate = useNavigate();
  // Pull disconnect hook and userStatus reset handler directly out of our updated context layers
  const { disconnect, setUserStatus } = useStateContext(); 
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // 1. Break active link instance mapping directly inside thirdweb provider context
        if (disconnect) {
          await disconnect();
        }

        // 2. Revert registration profile status variables cleanly back to zero/unregistered baseline values
        if (setUserStatus) {
          setUserStatus({ exists: false, role: 0, domain: "", isVerified: false });
        }

        // 3. Purge standard authentication cache storage tokens
        localStorage.removeItem('user_authenticated');
        localStorage.removeItem('profile_data');

      } catch (error) {
        console.error("Error during session logout cleanup execution loop:", error);
      }
    };

    performLogout();

    // 4. Execution Countdown transition loop tracker
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/'); // Revert safely back to unauthenticated main landing board
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, disconnect, setUserStatus]);

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] bg-[#1c1c24]/80 backdrop-blur-xl border border-[#3a3a43] rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative z-10"
      >
        <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 text-2xl flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-inner animate-pulse">
          🔓
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          Logging You Out
        </h1>
        
        <p className="text-gray-400 text-sm sm:text-base mb-8 leading-relaxed">
          Disconnecting wallet address configurations and resetting active academic profile dashboards...
        </p>

        <div className="relative w-20 h-20 mx-auto flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-4 border-[#3a3a43] rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#8c6dfd] border-r-[#8c6dfd] rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
          <span className="text-xl font-bold text-white">{countdown}s</span>
        </div>

        <p className="text-xs text-slate-500 italic mt-6">
          🔄 Your application view is reverting back to the pre-registration layout standard safely.
        </p>
      </motion.div>
    </div>
  );
};

export default Logout;