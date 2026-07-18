import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';
import { thirdweb } from '../assets';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  
  // Modal toggle handlers
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Input bindings
  const [fullName, setFullName] = useState('');
  const [profilePic, setProfilePic] = useState('');

  // Synchronized persistent state strings
  const [displayedName, setDisplayedName] = useState('');
  const [displayedPic, setDisplayedPic] = useState('');

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // File size safeguard check (e.g., maximum 4MB constraint)
  if (file.size > 4 * 1024 * 1024) {
    alert("This file is too large! Please choose an image smaller than 4MB.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    // Converts local storage binary to a local browser URL data string
    setProfilePic(reader.result); 
  };
  reader.readAsDataURL(file);
};
  
  const { address, contract, getUserCampaigns, userStatus } = useStateContext();

  // Keep state hydrated cleanly when components mount or address contexts switch
  useEffect(() => {
    if (address) {
      const savedProfile = localStorage.getItem(`profile_${address}`);
      if (savedProfile) {
        const { name, image } = JSON.parse(savedProfile);
        setDisplayedName(name || '');
        setDisplayedPic(image || '');
        setFullName(name || '');
        setProfilePic(image || '');
      } else {
        setDisplayedName('');
        setDisplayedPic('');
        setFullName('');
        setProfilePic('');
      }
    }
  }, [address]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await getUserCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      console.error("Error fetching user campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [address, contract]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if(!fullName.trim()) return alert("Full name cannot be left blank");

    const profileData = {
      name: fullName,
      image: profilePic
    };

    localStorage.setItem(`profile_${address}`, JSON.stringify(profileData));
    setDisplayedName(fullName);
    setDisplayedPic(profilePic);
    setIsProfileModalOpen(false);
    
    // Forces navbar state context listener hook strings to update seamlessly
    window.location.reload();
  };

  // Convert raw blockchain Wei values safely into standard user metrics
  const formatToEth = (value) => {
    if (!value) return 0;
    const strVal = value.toString().split('.')[0];
    if (strVal.length > 11) {
      try {
        return parseFloat(ethers.utils.formatEther(strVal));
      } catch (e) {
        return 0;
      }
    }
    return parseFloat(value);
  }

  const totalETH = campaigns.reduce((acc, item) => acc + formatToEth(item.amountCollected), 0).toFixed(2);

  return (
    <div className="flex flex-col gap-10 relative">
      
      {/* --- DASHBOARD TOP ROW: CONDITIONAL IDENTITY MODIFIER ACTION --- */}
      <div className="w-full flex justify-between items-center bg-white dark:bg-[#1c1c24] px-8 py-4 rounded-2xl border border-slate-200 dark:border-[#3a3a43]">
        <p className="text-sm font-medium text-slate-500 dark:text-[#808191]">
          {displayedName ? "Need to tweak your details?" : "Your cryptographic identity profile has not been built yet."}
        </p>
        <button 
          onClick={() => setIsProfileModalOpen(true)}
          className="bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md text-sm cursor-pointer"
        >
          {displayedName ? '⚙️ Edit Profile Metadata' : '➕ Set Up Identity'}
        </button>
      </div>

      {/* --- SECTION 1: USER IDENTITY CARD --- */}
      <div className="w-full flex flex-col md:flex-row gap-8 items-center p-8 bg-white dark:bg-[#1c1c24] rounded-3xl border border-slate-200 dark:border-[#3a3a43] shadow-sm">
        
        {/* Dynamic Image Slot */}
        <div className="w-[100px] h-[100px] rounded-2xl bg-[#2c2f32] flex items-center justify-center border-2 border-[#8c6dfd] overflow-hidden shadow-inner shrink-0">
          {displayedPic ? (
            <img src={displayedPic} alt="profile avatar" className="w-full h-full object-cover" />
          ) : (
            <img src={thirdweb} alt="fallback default" className="w-3/5 h-3/5 object-contain grayscale" />
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          {/* Displays full name cleanly or prompts the user configuration view */}
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {displayedName || (
              <span className="text-slate-400 dark:text-[#4b5264] italic text-lg font-normal">
                Anonymous Identity (Click 'Set Up Identity' above to configure name)
              </span>
            )}
          </h2>

          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-3">
            {/* Pop-up view launcher for secure public address view */}
            <button 
              onClick={() => setIsAddressModalOpen(true)}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#2c2f32] dark:hover:bg-[#3a3a43] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#4b5264] transition-all cursor-pointer"
            >
              💳 View Secure Wallet Address
            </button>

            <span className="px-4 py-1.5 bg-[#8c6dfd]/10 text-[#8c6dfd] rounded-full text-xs font-bold border border-[#8c6dfd]/20">
              {userStatus?.role === 1 ? 'Academic Admin' : 'Research Recipient'}
            </span>
            <span className="px-4 py-1.5 bg-slate-100 dark:bg-[#13131a] text-slate-500 dark:text-[#808191] rounded-full text-xs font-medium border border-slate-200 dark:border-[#3a3a43]">
              {userStatus?.domain || 'General Domain'}
            </span>
            {userStatus?.isVerified && (
              <span className="px-4 py-1.5 bg-[#4acd8d]/10 text-[#4acd8d] rounded-full text-xs font-bold border border-[#4acd8d]/20">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- SECTION 2: METRICS METERS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-[#1c1c24] rounded-2xl border border-slate-200 dark:border-[#3a3a43] flex flex-col items-center shadow-sm">
            <p className="text-slate-500 dark:text-[#808191] text-xs uppercase font-bold tracking-widest mb-2">My Active Proposals</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{campaigns.length}</h3>
        </div>
        <div className="p-6 bg-white dark:bg-[#1c1c24] rounded-2xl border border-slate-200 dark:border-[#3a3a43] flex flex-col items-center shadow-sm">
            <p className="text-slate-500 dark:text-[#808191] text-xs uppercase font-bold tracking-widest mb-2">Total Funding Secured</p>
            <h3 className="text-3xl font-black text-[#4acd8d]">{totalETH} ETH</h3>
        </div>
        <div className="p-6 bg-[#8c6dfd] rounded-2xl flex flex-col items-center shadow-lg shadow-[#8c6dfd]/20">
            <p className="text-white/70 text-xs uppercase font-bold tracking-widest mb-2">Network Ledger Connectivity</p>
            <h3 className="text-3xl font-black text-white">Active</h3>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-[#3a3a43]" />

      {/* --- SECTION 3: PROTOCOL DATA DISPLAY FEED --- */}
      <DisplayCampaigns 
        title="Your Project Portfolio"
        isLoading={isLoading}
        campaigns={campaigns}
      />

      {/* --- BOTTOM SECTION: FOOLPROOF FOOTER ENTRY POINT --- */}
      <div className="w-full flex flex-col items-center gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-[#3a3a43]">
        <p className="text-xs text-slate-400 dark:text-[#808191]">Want to alter your global interface preferences?</p>
        <button 
          onClick={() => setIsProfileModalOpen(true)}
          className="bg-transparent border border-[#8c6dfd] hover:bg-[#8c6dfd]/10 text-[#8c6dfd] font-bold px-8 py-3 rounded-xl transition-all text-sm cursor-pointer"
        >
          {displayedName ? '⚙️ Update User Profile Data' : '🚀 Register App Profile Metadata'}
        </button>
      </div>

      {/* --- CONTAINER DIALOG: PROFILE SETTINGS EDITOR --- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] w-full max-w-[500px] p-8 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configure Profile Identity</h3>
            <p className="text-slate-400 text-xs mb-6">Link your structural identification names with your current local public keys.</p>
            
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase tracking-wider">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Professor Emmanuel"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd] text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

    <div className="flex flex-col gap-4">
      <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase tracking-wider">
        Profile Image *
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 📁 METHOD 1: TRADITIONAL FILE UPLOADER */}
        <div className="flex flex-col items-center justify-center min-h-[140px] p-4 bg-slate-50 dark:bg-[#13131a] border-2 border-dashed border-slate-200 dark:border-[#3a3a43] rounded-xl hover:border-[#8c6dfd] transition-all relative group">
          
          {/* Hidden input field covering the box area */}
          <input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileChange}
          />

          <div className="text-center flex flex-col items-center pointer-events-none z-0">
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📁</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Drag & Drop File Here
            </p>
            <p className="text-[11px] text-slate-400 mb-3">Supports PNG, JPG, WebP</p>
            
            {/* 🔘 Explicit Browse Button Layout Element */}
            <div className="px-3 py-1.5 bg-[#3a3a43] group-hover:bg-[#8c6dfd] text-white font-medium text-xs rounded-lg transition-colors shadow-sm">
              Browse Files
            </div>
          </div>
        </div>

        {/* 🔗 METHOD 2: TRADITIONAL URL INPUT BACKUP */}
        <div className="flex flex-col justify-center p-4 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🌐</span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Or Paste Image Web Link
            </p>
          </div>
          
          <input 
            type="url" 
            placeholder="e.g. https://images.com/avatar.png"
            className="w-full px-3 py-2.5 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd] text-xs transition-all"
            value={profilePic}
            onChange={(e) => setProfilePic(e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-2 italic">
            Useful if your image asset is already hosted online.
          </p>
        </div>

      </div>

      {/* 🖼️ LIVE DYNAMIC IMAGE PREVIEW CARD */}
      {profilePic && (
        <div className="flex items-center gap-4 p-3 bg-[#1c1c24]/40 border border-emerald-500/20 rounded-xl mt-1 animate-fadeIn">
          <img 
            src={profilePic} 
            alt="Profile Preview" 
            className="w-12 h-12 object-cover rounded-xl border-2 border-[#4acd8d] shadow-md"
            onError={(e) => {
              // Fallback flag if a manually typed URL breaks
              e.target.style.display = 'none';
            }}
          />
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <span>✅</span> Image Linked Successfully
            </p>
            <p className="text-[11px] text-slate-400 max-w-[400px] truncate">
              Source: {profilePic}
            </p>
          </div>
        </div>
      )}
    </div>

              <div className="flex gap-4 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#2c2f32] dark:hover:bg-[#3a3a43] text-slate-700 dark:text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#1dc071] hover:bg-[#17a360] text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONTAINER DIALOG: WALLET ADDRESS DISCOVERY POPUP --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] w-full max-w-[450px] p-6 rounded-2xl shadow-2xl text-center">
            <div className="w-12 h-12 bg-[#8c6dfd]/10 text-[#8c6dfd] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              💳
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Cryptographic Public Key</h3>
            <p className="text-slate-400 text-xs mb-4">This authenticated wallet hash acts as your identity signer on the blockchain.</p>
            
            <div className="p-4 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-xs font-mono text-slate-800 dark:text-slate-300 break-all select-all mb-6">
              {address}
            </div>

            <button 
              onClick={() => setIsAddressModalOpen(false)}
              className="w-full py-3 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;