import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { logo } from '../assets'; 
import { navlinks } from '../constants';
import { useStateContext } from '../context';

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        className={`w-[48px] h-[48px] rounded-xl flex justify-center items-center transition-all duration-300 relative ${
          isActive && isActive === name 
            ? 'bg-slate-100 shadow-sm' 
            : 'hover:bg-slate-50'
        } ${!disabled && 'cursor-pointer'} ${styles}`}
        onClick={handleClick}
      >
        <img 
          src={imgUrl} 
          alt={name} 
          className={`w-5 h-5 object-contain transition-all duration-300 ${
            isActive !== name 
              ? 'opacity-40 grayscale' 
              : 'opacity-100 text-[#1dc071]'
          }`} 
        />
        
        {isActive === name && (
          <motion.div 
            layoutId="activeDot"
            className="absolute -right-1 w-1 h-5 bg-[#1dc071] rounded-full shadow-[0_0_8px_#1dc071]"
          />
        )}
      </motion.div>

      {/* 🏷️ Floating Tooltip on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-[60px] z-50 px-3 py-1.5 bg-[#1c1c24] text-white text-xs font-semibold capitalize rounded-lg shadow-xl border border-[#3a3a43] whitespace-nowrap pointer-events-none"
          >
            {name}
            {/* Tooltip Arrow Indicator */}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1c1c24] border-l border-b border-[#3a3a43] rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const { 
    address, 
    adminStatus, 
    recipientStatus, 
    userStatus, 
    setIsSignupModalOpen, 
    setSignupInitialRole 
  } = useStateContext() || {};

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const getActiveLink = () => {
    const path = location.pathname;
    
    if (path === '/') return 'dashboard';
    if (path === '/create-campaign') return 'campaign';
    if (path === '/profile') return 'profile'; 
    if (path === '/logout') return 'logout';
    
    return 'dashboard'; 
  };

  const isActive = getActiveLink();

  // 🧹 Filter out 'withdraw' and 'payment' icons from menu
  const filteredNavlinks = navlinks.filter((link) => {
    const linkName = link.name ? link.name.toLowerCase() : '';
    const linkUrl = link.link ? link.link.toLowerCase() : '';

    return (
      !linkName.includes('withdraw') && 
      !linkName.includes('payment') && 
      !linkUrl.includes('withdraw') && 
      !linkUrl.includes('payment')
    );
  });

  const getStoredUserRecord = (prefix, rawAddress) => {
    if (!rawAddress) return null;
    const addr = String(rawAddress).toLowerCase();

    const lowerMatch = localStorage.getItem(`${prefix}_${addr}`);
    if (lowerMatch) return JSON.parse(lowerMatch);

    const rawMatch = localStorage.getItem(`${prefix}_${rawAddress}`);
    if (rawMatch) return JSON.parse(rawMatch);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase() === `${prefix}_${addr}`.toLowerCase()) {
        return JSON.parse(localStorage.getItem(key));
      }
    }

    return null;
  };

  const handleNavClick = (link) => {
    if (link.disabled) return;

    const currentAddress = address || (typeof window !== 'undefined' && window.ethereum?.selectedAddress);

    // --- 🚀 CREATE CAMPAIGN LINK HANDLER ---
    if (link.name === 'campaign' || link.link === '/create-campaign') {
      navigate('/create-campaign', { state: null });
      return;
    }

    // --- 🛡️ ADMIN LINK HANDLER ---
    if (link.name === 'admin' || link.link === '/admin' || link.link === '/admin-configuration' || link.link === '/admin-profile') {
      if (!currentAddress) {
        alert("Please connect your wallet first!");
        return;
      }

      const savedAdmin = adminStatus || 
        getStoredUserRecord('admin_status', currentAddress) || 
        getStoredUserRecord('admin_account', currentAddress) ||
        JSON.parse(localStorage.getItem('admin_account') || 'null');

      if (savedAdmin && (savedAdmin.exists || Number(savedAdmin.role) === 1 || savedAdmin.isAdmin)) {
        navigate('/admin-configuration', { state: null });
      } else {
        if (setSignupInitialRole) setSignupInitialRole('admin');
        if (setIsSignupModalOpen) setIsSignupModalOpen(true);
      }
      return;
    }

    // --- 👤 RECIPIENT PROFILE LINK HANDLER ---
    if (link.name === 'profile' || link.link === '/profile') {
      if (!currentAddress) {
        alert("Please connect your wallet first!");
        return;
      }

      const savedRecipient = recipientStatus || userStatus || 
        getStoredUserRecord('recipient_status', currentAddress) || 
        getStoredUserRecord('recipient_account', currentAddress) ||
        getStoredUserRecord('user_account', currentAddress);

      if (savedRecipient && (savedRecipient.exists || Number(savedRecipient.role) === 0)) {
        navigate('/profile', { state: null });
      } else {
        if (setSignupInitialRole) setSignupInitialRole('recipient');
        if (setIsSignupModalOpen) setIsSignupModalOpen(true);
      }
      return;
    }

    // Standard fallback navigation
    navigate(link.link, { state: null });
  };

  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh] z-50">
      
      {/* 🚀 Logo Branding Container */}
      <Link to="/" state={null}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-[52px] h-[52px] bg-white border border-slate-200 rounded-xl flex justify-center items-center shadow-sm backdrop-blur-md"
        >
          <img src={logo} alt="logo" className="w-1/2 h-1/2 object-contain" />
        </motion.div>
      </Link>

      {/* 🧊 Navigation Menu Container */}
      <div className="flex-1 flex flex-col justify-between items-center bg-white border border-slate-200 rounded-2xl w-[72px] py-5 mt-8 shadow-sm relative">
        
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none rounded-t-2xl" />

        <div className="flex flex-col justify-center items-center gap-3 relative z-10">
          {filteredNavlinks.map((link) => (
            <div key={link.name} className="relative">
              <Icon
                {...link}
                isActive={isActive}
                handleClick={() => handleNavClick(link)}
              />
            </div>
          ))}
        </div>
        <div className="w-2 h-2" />

      </div>
    </div>
  );
};

export default Sidebar;