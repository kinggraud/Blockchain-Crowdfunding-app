import React, { useState, useEffect } from 'react'
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
  
  // Track custom profile state variables globally
  const [hasProfile, setHasProfile] = useState(false);
  const [profilePic, setProfilePic] = useState('');

  const { address, connectWallet, userStatus } = useStateContext(); 

  // Watch for profile availability every time the account changes
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
      
      {/* 🔍 SEARCH BAR SECTION */}
        <div className="lg:flex-1 flex flex-row max-w-[458px] py-2 pl-4 pr-2 h-[52px] bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-[100px] hover:border-[#8c6dfd]/50 transition-all duration-300 focus-within:ring-2 ring-[#8c6dfd]/20 items-center">
          <input 
            type="text" 
            placeholder="Search for Campaigns..." 
            className="flex w-full font-normal text-[14px] placeholder:text-slate-400 dark:placeholder:text-[#4b5264] text-slate-800 dark:text-white bg-transparent outline-none transition-colors duration-300"
          />
          <div className="w-[72px] h-full rounded-[20px] bg-[#1dc071] hover:bg-[#17a360] flex justify-center items-center cursor-pointer transition-colors duration-300 shadow-lg shadow-[#1dc071]/20">
            {/* 🔄 CHANGED: Removed the blanket 'invert' class and used fine-tuned brightness/contrast filters for crisp light/dark presentation */}
            <img 
              src={search} 
              alt="search" 
              className="w-[15px] h-[15px] object-contain brightness-0 invert dark:brightness-100" 
            />
          </div>
        </div>

      {/* 💻 DESKTOP LAYOUT (sm and up) */}
      <div className="sm:flex hidden flex-row justify-end gap-4 items-center">
        
        {/* CREATE / UPDATE PROFILE ACTION TRIGGERS */}
        {address && (
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className={`px-5 h-[52px] font-bold text-[14px] rounded-[15px] transition-all duration-300 transform hover:scale-105 text-white shadow-md ${
              hasProfile 
                ? 'bg-slate-600 hover:bg-slate-700 dark:bg-[#3a3a43] dark:hover:bg-[#4b5264]' 
                : 'bg-gradient-to-r from-[#8c6dfd] to-[#7a59e6] animate-pulse'
            }`}
          >
            {hasProfile ? '⚙️ Update Profile' : '➕ Create Profile'}
          </button>
        )}

        <CustomButton 
          btnType="button"
          title={!address ? 'Connect Wallet' : (!userStatus?.exists ? 'Register Now' : 'Create Campaign')}
          styles={`px-6 h-[52px] font-bold rounded-[15px] text-white transition-all duration-300 transform hover:scale-105 ${
            address ? 'bg-[#1dc071] shadow-lg shadow-[#1dc071]/10' : 'bg-[#8c6dfd] shadow-lg shadow-[#8c6dfd]/10'
          }`}
          handleClick={handleButtonClick}
        />

        {/* PROFILE AVATAR OUTLINE */}
        <Link to="/profile">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-[52px] h-[52px] rounded-full bg-slate-100 dark:bg-[#1c1c24] border border-slate-200 dark:border-[#8c6dfd] flex justify-center items-center cursor-pointer overflow-hidden shadow-md transition-colors duration-300"
          >
            {hasProfile && profilePic ? (
              <img src={profilePic} alt="user avatar" className="w-full h-full object-cover" />
            ) : (
              <img src={thirdweb} alt="user default" className="w-[60%] h-[60%] object-contain opacity-50 dark:opacity-100 dark:invert transition-all" />
            )}
          </motion.div>
        </Link>
      </div>
      
      {/* 📱 MOBILE NAVIGATION BAR */}
      <div className="sm:hidden flex justify-between items-center relative h-[52px] bg-white dark:bg-[#1c1c24] px-4 rounded-[15px] border border-slate-200 dark:border-[#3a3a43] shadow-sm transition-colors duration-300">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-slate-100 dark:bg-[#2c2f32] flex justify-center items-center cursor-pointer overflow-hidden transition-colors duration-300">
          {hasProfile && profilePic ? (
            <img src={profilePic} alt="user avatar mobile" className="w-full h-full object-cover" onClick={() => navigate('/profile')} />
          ) : (
            <img src={logo} alt="logo default" className="w-[60%] h-[60%] object-contain dark:brightness-200" onClick={() => navigate('/')} />
          )}
        </div>
        
        <img 
          src={menu} 
          alt="menu" 
          className="w-[34px] h-[34px] object-contain cursor-pointer transition-all dark:invert"
          onClick={() => setToggleDrawer((prev) => !prev)}
        />

        {/* MOBILE SLIDE-DOWN NAVIGATION DRAWER */}
        <div className={`absolute top-[65px] right-0 left-0 bg-white dark:bg-[#1c1c24] z-50 shadow-2xl rounded-[20px] border border-slate-200 dark:border-[#3a3a43] py-4 transition-all duration-300 overflow-hidden ${!toggleDrawer ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <ul className="mb-4">
            {navlinks.map((link) => {
              const isEmoji = link.imgUrl && link.imgUrl.length <= 2;
              
              return (
                <li 
                  key={link.name}
                  className={`flex p-4 items-center cursor-pointer mx-4 rounded-[12px] transition-colors duration-200 ${
                    isActive === link.name 
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
                    <span className="text-xl w-[24px] h-[24px] flex items-center justify-center select-none">{link.imgUrl}</span>
                  ) : (
                    <img 
                      src={link.imgUrl} 
                      alt={link.name} 
                      className={`w-[24px] h-[24px] object-contain transition-all ${
                        isActive === link.name ? 'grayscale-0 dark:brightness-110' : 'grayscale opacity-50 dark:opacity-60'
                      }`} 
                    />
                  )}
                  <p className={`ml-[20px] font-bold text-[14px] capitalize transition-colors duration-300 ${
                    isActive === link.name ? 'text-[#1dc071]' : 'text-slate-600 dark:text-[#808191]'
                  }`}>
                    {link.name}
                  </p>
                </li>
              );
            })}
          </ul>

          {/* MOBILE DRAWER PROFILE MANAGEMENT UTILITIES */}
          {address && (
            <div className="flex mx-4 mb-3 pb-3 border-b border-slate-100 dark:border-[#3a3a43] transition-colors duration-300">
              <button
                type="button"
                onClick={() => {
                  setToggleDrawer(false);
                  navigate('/profile');
                }}
                className={`w-full py-3 font-bold text-[14px] rounded-[12px] transition-all duration-300 text-white ${
                  hasProfile ? 'bg-slate-600 dark:bg-[#3a3a43]' : 'bg-gradient-to-r from-[#8c6dfd] to-[#7a59e6]'
                }`}
              >
                {hasProfile ? '⚙️ Update Profile Identity' : '➕ Create Profile Identity'}
              </button>
            </div>
          )}

          <div className="flex mx-4 mt-2">
            <CustomButton 
              btnType="button"
              title={!address ? 'Connect' : (!userStatus?.exists ? 'Register' : 'Create Campaign')}
              styles={`w-full text-white ${address ? 'bg-[#1dc071]' : 'bg-[#8c6dfd]'}`}
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