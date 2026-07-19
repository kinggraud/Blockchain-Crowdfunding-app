import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import { logo } from '../assets'; 
import { navlinks } from '../constants';

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
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
)

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  // Hard enforce light mode globally on component mount
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

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

  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh] z-50">
      
      {/* 🚀 Logo Branding Container */}
      <Link to="/">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-[52px] h-[52px] bg-white border border-slate-200 rounded-xl flex justify-center items-center shadow-sm backdrop-blur-md"
        >
          <img src={logo} alt="logo" className="w-1/2 h-1/2 object-contain" />
        </motion.div>
      </Link>

      {/* 🧊 Navigation Menu Container */}
      <div className="flex-1 flex flex-col justify-between items-center bg-white border border-slate-200 rounded-2xl w-[72px] py-5 mt-8 shadow-sm relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />

        <div className="flex flex-col justify-center items-center gap-3 relative z-10">
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
        
        {/* Theme toggle button has been removed completely from here */}
        <div className="w-2 h-2" />

      </div>
    </div>
  );
};

export default Sidebar;