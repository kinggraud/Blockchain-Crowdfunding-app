import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useStateContext } from '../context';
import { CustomButton } from './';
import { logo, menu, search, thirdweb } from '../assets';
import { navlinks } from '../constants';
import SignupModal from './SignupModal';

const Navbar = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState('dashboard');
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [hasProfile, setHasProfile] = useState(false);
  const [profilePic, setProfilePic] = useState('');

  const { address, connectWallet, userStatus } = useStateContext(); 

  useEffect(() => {
    if (address) {
      const savedProfile = localStorage.getItem(`profile_${address}`);
      if (savedProfile) {
        const { image } = JSON.parse(savedProfile);
        setHasProfile(true);
        setProfilePic(image || '');
      } else {
        setHasProfile(false);
        setProfilePic('');
      }
    } else {
      setHasProfile(false);
      setProfilePic('');
    }
  }, [address]);

  const handleButtonClick = () => {
    if (!address) {
      connectWallet();
    } else if (!userStatus?.exists) {
      setIsModalOpen(true);
    } else {
      navigate('create-campaign');
    }
  }

  return (
    <div className="flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6 relative z-50 font-epilogue">
      
      {/* 🔍 CRISP SEARCH BAR WRAPPER */}
      <div className="lg:flex-1 flex flex-row max-w-[458px] py-2 pl-4 pr-2 h-[52px] bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-xl hover:border-[#8c6dfd]/50 transition-all duration-300 focus-within:ring-2 ring-[#8c6dfd]/20 items-center shadow-sm">
        <input 
          type="text" 
          placeholder="Search for Campaigns..." 
          className="flex w-full font-normal text-[14px] placeholder:text-slate-400 dark:placeholder:text-[#4b5264] text-slate-800 dark:text-white bg-transparent outline-none"
        />
        <div className="w-[40px] h-[40px] rounded-lg bg-[#1dc071] hover:bg-[#17a360] flex justify-center items-center cursor-pointer transition-colors duration-300 shadow-md shadow-[#1dc071]/10">
          <img 
            src={search} 
            alt="search" 
            className="w-[14px] h-[14px] object-contain brightness-0 invert" 
          />
        </div>
      </div>

      {/* 💻 DESKTOP ACTIONS CONTROL PANEL */}
      <div className="sm:flex hidden flex-row justify-end gap-4 items-center">
        
        {address && (
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className={`px-5 h-[52px] font-bold text-[13px] rounded-xl tracking-wide transition-all duration-300 transform hover:scale-[1.02] text-white shadow-sm ${
              hasProfile 
                ? 'bg-slate-600 hover:bg-slate-700 dark:bg-[#3a3a43] dark:hover:bg-[#4b5264]' 
                : 'bg-gradient-to-r from-[#8c6dfd] to-[#7a59e6]'
            }`}
          >
            {hasProfile ? '⚙️ Profile Settings' : '➕ Set Up Profile'}
          </button>
        )}

        <CustomButton 
          btnType="button"
          title={!address ? 'Connect Wallet' : (!userStatus?.exists ? 'Register Profile' : 'Create Campaign')}
          styles={`px-6 h-[52px] font-bold text-[13px] rounded-xl tracking-wide text-white transition-all duration-300 transform hover:scale-[1.02] ${
            address ? 'bg-[#1dc071] shadow-lg shadow-[#1dc071]/10' : 'bg-[#8c6dfd] shadow-lg shadow-[#8c6dfd]/10'
          }`}
          handleClick={handleButtonClick}
        />

        {/* PREMIUM ACCOUNT AVATAR MATTE WRAPPER */}
        <Link to="/profile">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-[52px] h-[52px] rounded-xl bg-slate-100/80 dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] hover:border-[#8c6dfd]/60 flex justify-center items-center cursor-pointer overflow-hidden shadow-sm transition-all"
          >
            {hasProfile && profilePic ? (
              <img src={profilePic} alt="user avatar" className="w-full h-full object-cover" />
            ) : (
              <img src={thirdweb} alt="user default" className="w-[50%] h-[50%] object-contain opacity-40 dark:opacity-100 dark:invert" />
            )}
          </motion.div>
        </Link>
      </div>
      
      {/* 📱 PORTABLE MOBILE PANEL CONTAINER */}
      <div className="sm:hidden flex justify-between items-center relative h-[56px] bg-white dark:bg-[#1c1c24] px-4 rounded-xl border border-slate-200 dark:border-[#3a3a43] shadow-sm transition-colors duration-300">
        <div className="w-[36px] h-[36px] rounded-lg bg-slate-100 dark:bg-[#2c2f32] flex justify-center items-center cursor-pointer overflow-hidden transition-all">
          {hasProfile && profilePic ? (
            <img src={profilePic} alt="user avatar mobile" className="w-full h-full object-cover" onClick={() => navigate('/profile')} />
          ) : (
            <img src={logo} alt="logo default" className="w-[55%] h-[55%] object-contain opacity-60 dark:opacity-100 dark:brightness-200" onClick={() => navigate('/')} />
          )}
        </div>
        
        <img 
          src={menu} 
          alt="menu" 
          className="w-[28px] h-[28px] object-contain cursor-pointer transition-all dark:invert"
          onClick={() => setToggleDrawer((prev) => !prev)}
        />

        {/* MOBILE DROPDOWN DRAWER PANEL FRAME */}
        <div className={`absolute top-[68px] right-0 left-0 bg-white/95 dark:bg-[#1c1c24]/95 backdrop-blur-md z-50 shadow-2xl rounded-2xl border border-slate-200 dark:border-[#3a3a43] py-4 transition-all duration-300 origin-top ${!toggleDrawer ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <ul className="mb-4 space-y-1">
            {navlinks.map((link) => {
              const isEmoji = link.imgUrl && link.imgUrl.length <= 2;
              const isLinkActive = isActive === link.name;
              
              return (
                <li 
                  key={link.name}
                  className={`flex p-3.5 items-center cursor-pointer mx-4 rounded-xl transition-all ${
                    isLinkActive 
                      ? 'bg-slate-100 dark:bg-[#3a3a43]' 
                      : 'hover:bg-slate-50 dark:hover:bg-[#2c2f32]'
                  }`}
                  onClick={() => {
                    setIsActive(link.name);
                    setToggleDrawer(false);
                    navigate(link.link);
                  }}
                >
                  {isEmoji ? (
                    <span className="text-lg w-[22px] h-[22px] flex items-center justify-center select-none">{link.imgUrl}</span>
                  ) : (
                    <img 
                      src={link.imgUrl} 
                      alt={link.name} 
                      className={`w-[22px] h-[22px] object-contain transition-all ${
                        isLinkActive ? 'grayscale-0 dark:brightness-110' : 'grayscale opacity-40 dark:opacity-60'
                      }`} 
                    />
                  )}
                  <p className={`ml-[18px] font-bold text-[13px] capitalize transition-colors duration-300 ${
                    isLinkActive ? 'text-[#1dc071]' : 'text-slate-600 dark:text-[#808191]'
                  }`}>
                    {link.name}
                  </p>
                </li>
              );
            })}
          </ul>

          {address && (
            <div className="flex mx-4 mb-3 pb-3 border-b border-slate-100 dark:border-[#3a3a43]">
              <button
                type="button"
                onClick={() => {
                  setToggleDrawer(false);
                  navigate('/profile');
                }}
                className={`w-full py-3.5 font-bold text-[13px] rounded-xl text-white transition-all shadow-sm ${
                  hasProfile ? 'bg-slate-600 dark:bg-[#3a3a43]' : 'bg-gradient-to-r from-[#8c6dfd] to-[#7a59e6]'
                }`}
              >
                {hasProfile ? '⚙️ Profile Settings' : '➕ Set Up Profile'}
              </button>
            </div>
          )}

          <div className="flex mx-4 mt-2">
            <CustomButton 
              btnType="button"
              title={!address ? 'Connect Wallet' : (!userStatus?.exists ? 'Register Profile' : 'Create Campaign')}
              styles={`w-full py-3.5 text-[13px] rounded-xl text-white font-bold ${address ? 'bg-[#1dc071]' : 'bg-[#8c6dfd]'}`}
              handleClick={handleButtonClick}
            />
          </div>
        </div> 
      </div>

      <SignupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}

export default Navbar;