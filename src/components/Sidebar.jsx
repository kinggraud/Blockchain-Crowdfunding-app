import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import { logo, sun, moon } from '../assets'; 
import { navlinks } from '../constants';

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <motion.div
    whileHover={!disabled ? { scale: 1.1, backgroundColor: "#2c2f32" } : {}}
    whileTap={!disabled ? { scale: 0.9 } : {}}
    // 🔄 UPDATED: Added light-mode compatible layout highlighting styles below
    className={`w-[52px] h-[52px] rounded-[14px] flex justify-center items-center transition-all duration-300 relative ${
      isActive && isActive === name ? 'bg-slate-200/80 dark:bg-[#3a3a43] shadow-lg shadow-[#8c6dfd]/10' : 'bg-transparent'
    } ${!disabled && 'cursor-pointer'} ${styles}`}
    onClick={handleClick}
  >
    {/* 🔄 UPDATED: Balanced opacity configurations for both themes */}
    <img 
      src={imgUrl} 
      alt={name} 
      className={`w-6 h-6 object-contain transition-all duration-300 ${
        isActive !== name ? 'opacity-40 grayscale' : 'opacity-100 dark:brightness-125 invert-0 dark:invert-0'
      }`} 
    />
    
    {isActive === name && (
      <motion.div 
        layoutId="activeDot"
        className="absolute -right-1 w-1.5 h-6 bg-[#8c6dfd] rounded-full shadow-[0_0_10px_#8c6dfd]"
      />
    )}
  </motion.div>
)

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const getActiveLink = () => {
    const path = location.pathname;
    
    if (path === '/') return 'dashboard';
    if (path === '/create-campaign') return 'campaign';
    if (path === '/profile') return 'profile';
    if (path === '/withdraw') return 'withdraw'; 
    if (path === '/logout') return 'logout';
    
    return 'dashboard'; 
  };

  const isActive = getActiveLink();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh] z-50">
      
      {/* 🚀 Logo Branding Container */}
      <Link to="/">
        {/* 🔄 UPDATED: Added adaptive background and light border layout configurations */}
        <motion.div 
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.7 }}
          className="w-[56px] h-[56px] bg-white border border-slate-200 dark:bg-[#1c1c24] dark:border-[#3a3a43] rounded-[16px] flex justify-center items-center shadow-xl backdrop-blur-md transition-colors"
        >
          <img src={logo} alt="logo" className="w-1/2 h-1/2 object-contain" />
        </motion.div>
      </Link>

      {/* 🧊 Navigation Menu Container */}
      {/* 🔄 UPDATED: Removed hardcoded dark styles, added bg-white/80, border-slate-200, and standard transitions */}
      <div className="flex-1 flex flex-col justify-between items-center bg-white/80 border border-slate-200 dark:bg-[#1c1c24]/60 backdrop-blur-xl dark:border-white/5 rounded-[24px] w-[80px] py-6 mt-12 shadow-2xl relative overflow-hidden transition-colors duration-300">
        
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#8c6dfd]/5 to-transparent pointer-events-none" />

        <div className="flex flex-col justify-center items-center gap-4 relative z-10">
          {navlinks.map((link) => (
            <div key={link.name} className="relative">
              <Icon
                {...link}
                isActive={isActive}
                handleClick={() => {
                  if (!link.disabled) {
                    navigate(link.link);
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* ☀️/🌙 THEME TOGGLE ICON SECTION */}
        <div className="relative group mb-2">
           <div className="absolute inset-0 bg-[#8c6dfd] opacity-0 group-hover:opacity-10 blur-xl transition-opacity rounded-full" />
           {/* 🔄 UPDATED: Shifted inner theme container layout color tokens to use adaptive parameters */}
           <Icon 
             styles="bg-slate-100 border border-slate-200 dark:bg-[#1c1c24] dark:border-[#3a3a43] hover:border-[#8c6dfd]/40 transition-all shadow-inner" 
             imgUrl={theme === 'dark' ? sun : moon} 
             name="theme-toggle"
             handleClick={toggleTheme}
           />
        </div>

      </div>
    </div>
  );
};

export default Sidebar;