import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';
import { thirdweb } from '../assets';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  
  // Modal toggle handlers
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Input bindings for Profile Form
  const [fullName, setFullName] = useState('');
  const [profilePic, setProfilePic] = useState('');

  // Synchronized persistent state strings
  const [displayedName, setDisplayedName] = useState('');
  const [displayedPic, setDisplayedPic] = useState('');

  const { 
    address, 
    contract, 
    getUserCampaigns 
  } = useStateContext() || {};

  // Fetch Profile Metadata from Firestore Database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!address) return;
      
      try {
        const userDocRef = doc(db, "users", address.toLowerCase());
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayedName(data.fullName || '');
          setDisplayedPic(data.profilePic || '');
          setFullName(data.fullName || '');
          setProfilePic(data.profilePic || '');
        } else {
          setDisplayedName('');
          setDisplayedPic('');
          setFullName('');
          setProfilePic('');
        }
      } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
      }
    };

    fetchUserProfile();
  }, [address]);

  // Fetch campaigns associated with connected wallet
  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      if (getUserCampaigns) {
        const data = await getUserCampaigns();
        setCampaigns(data || []);
      }
    } catch (err) {
      console.error("Error fetching user campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract && address) fetchCampaigns();
  }, [address, contract]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("This file is too large! Please choose an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result); 
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Details directly to Firestore Database
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return alert("Full name cannot be left blank");

    try {
      const userDocRef = doc(db, "users", address.toLowerCase());
      await setDoc(userDocRef, {
        fullName: fullName.trim(),
        profilePic: profilePic,
        walletAddress: address,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setDisplayedName(fullName.trim());
      setDisplayedPic(profilePic);
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error("Error saving profile to Firestore:", err);
      alert("Failed to save profile. Please check your network connection and try again.");
    }
  };

  const formatToEth = (value) => {
    if (!value) return 0;
    const strVal = value.toString().split('.')[0];
    if (strVal.length > 11) {
      try {
        const formatFn = ethers.utils?.formatEther || ethers.formatEther;
        return parseFloat(formatFn(strVal));
      } catch (e) {
        return 0;
      }
    }
    return parseFloat(value);
  };

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentUnixTime = Math.floor(Date.now() / 1000);

  const activeCount = campaigns.filter((campaign) => {
    let parsedDeadline = Number(campaign.deadline);
    if (parsedDeadline > 9999999999) parsedDeadline = Math.floor(parsedDeadline / 1000);
    return parsedDeadline > currentUnixTime;
  }).length;

  const endedCount = campaigns.length - activeCount;
  const totalETH = campaigns.reduce((acc, item) => acc + formatToEth(item.amountCollected), 0).toFixed(2);

  // -------------------------------------------------------------------
  // GUARD STATE: WALLET NOT CONNECTED
  // -------------------------------------------------------------------
  if (!address) {
    return (
      <div className="flex-1 max-w-[600px] mx-auto my-12 p-8 font-epilogue text-center bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-3xl shadow-xl">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/20">
          👛
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Wallet Not Connected</h2>
        <p className="text-sm text-slate-500 dark:text-[#808191]">
          Please connect your Web3 wallet address to access your profile dashboard.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // MAIN DASHBOARD
  // -------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-10 relative font-epilogue">
      
      {/* --- DASHBOARD TOP ROW --- */}
      <div className="w-full flex justify-between items-center bg-white dark:bg-[#1c1c24] px-8 py-4 rounded-2xl border border-slate-200 dark:border-[#3a3a43]">
        <p className="text-sm font-medium text-slate-500 dark:text-[#808191]">
          {displayedName ? "Need to update your details?" : "Your profile has not been configured yet."}
        </p>
        <button 
          onClick={() => setIsProfileModalOpen(true)}
          className="bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md text-sm cursor-pointer"
        >
          {displayedName ? '⚙️ Edit Profile' : '➕ Create Profile'}
        </button>
      </div>

      {/* --- SECTION 1: USER IDENTITY CARD --- */}
      <div className="w-full flex flex-col md:flex-row gap-8 items-center p-8 bg-white dark:bg-[#1c1c24] rounded-3xl border border-slate-200 dark:border-[#3a3a43] shadow-sm">
        
        <div className="w-[100px] h-[100px] rounded-2xl bg-[#2c2f32] flex items-center justify-center border-2 border-[#8c6dfd] overflow-hidden shadow-inner shrink-0">
          {displayedPic ? (
            <img src={displayedPic} alt="profile avatar" className="w-full h-full object-cover" />
          ) : (
            <img src={thirdweb} alt="fallback default" className="w-3/5 h-3/5 object-contain grayscale" />
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {displayedName || (
              <span className="text-slate-400 dark:text-[#4b5264] italic text-lg font-normal">
                Anonymous User (Click 'Create Profile' to set up your name)
              </span>
            )}
          </h2>

          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-3">
            <button 
              onClick={() => setIsAddressModalOpen(true)}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#2c2f32] dark:hover:bg-[#3a3a43] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#4b5264] transition-all cursor-pointer"
            >
              💳 View Wallet Address
            </button>

            <span className="px-4 py-1.5 bg-[#8c6dfd]/10 text-[#8c6dfd] rounded-full text-xs font-bold border border-[#8c6dfd]/20">
              Campaign Creator
            </span>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: DYNAMIC STATUS BALANCE GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-[#1c1c24] rounded-2xl border border-slate-200 dark:border-[#3a3a43] flex flex-col items-center shadow-sm">
            <p className="text-slate-500 dark:text-[#808191] text-[10px] uppercase font-bold tracking-widest mb-2">Active Campaigns</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{activeCount}</h3>
        </div>
        <div className="p-6 bg-white dark:bg-[#1c1c24] rounded-2xl border border-slate-200 dark:border-[#3a3a43] flex flex-col items-center shadow-sm">
            <p className="text-slate-500 dark:text-[#808191] text-[10px] uppercase font-bold tracking-widest mb-2">Ended Campaigns</p>
            <h3 className="text-3xl font-black text-slate-400 dark:text-slate-500">{endedCount}</h3>
        </div>
        <div className="p-6 bg-white dark:bg-[#1c1c24] rounded-2xl border border-slate-200 dark:border-[#3a3a43] flex flex-col items-center shadow-sm">
            <p className="text-slate-500 dark:text-[#808191] text-[10px] uppercase font-bold tracking-widest mb-2">Total Funds Raised</p>
            <h3 className="text-3xl font-black text-[#4acd8d]">{totalETH} ETH</h3>
        </div>
        <div className="p-6 bg-[#8c6dfd] rounded-2xl flex flex-col items-center shadow-lg shadow-[#8c6dfd]/20">
            <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mb-2">Database Sync</p>
            <h3 className="text-3xl font-black text-white">Active</h3>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-[#3a3a43]" />

      {/* --- SECTION 3: DISPLAY USER CAMPAIGNS --- */}
      <DisplayCampaigns 
        title="Your Created Campaigns"
        isLoading={isLoading}
        campaigns={campaigns}
        isProfileView={true}
      />

      {/* --- DIALOG MODAL: PROFILE SETTINGS EDITOR --- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] w-full max-w-[500px] p-8 rounded-3xl shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configure Profile Identity</h3>
            <p className="text-slate-400 text-xs mb-6">Save your profile details directly to the database.</p>
            
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase tracking-wider">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd] text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase tracking-wider">
                  Profile Image
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center min-h-[140px] p-4 bg-slate-50 dark:bg-[#13131a] border-2 border-dashed border-slate-200 dark:border-[#3a3a43] rounded-xl hover:border-[#8c6dfd] transition-all relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleFileChange}
                    />
                    <div className="text-center flex flex-col items-center pointer-events-none z-0">
                      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📁</span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Upload Image File
                      </p>
                      <p className="text-[11px] text-slate-400 mb-3">PNG, JPG, WebP (&lt;2MB)</p>
                      <div className="px-3 py-1.5 bg-[#3a3a43] group-hover:bg-[#8c6dfd] text-white font-medium text-xs rounded-lg transition-colors shadow-sm">
                        Browse Files
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-4 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🌐</span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Or Paste Image Web Link
                      </p>
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://images.com/avatar.png"
                      className="w-full px-3 py-2.5 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-lg text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd] text-xs transition-all"
                      value={profilePic}
                      onChange={(e) => setProfilePic(e.target.value)}
                    />
                  </div>
                </div>

                {profilePic && (
                  <div className="flex items-center gap-4 p-3 bg-[#1c1c24]/40 border border-emerald-500/20 rounded-xl mt-1">
                    <img 
                      src={profilePic} 
                      alt="Profile Preview" 
                      className="w-12 h-12 object-cover rounded-xl border-2 border-[#4acd8d] shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <span>✅</span> Image Linked
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

      {/* --- DIALOG MODAL: WALLET ADDRESS DISCOVERY POPUP --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] w-full max-w-[450px] p-6 rounded-2xl shadow-2xl text-center">
            <div className="w-12 h-12 bg-[#8c6dfd]/10 text-[#8c6dfd] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              💳
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Public Wallet Address</h3>
            <p className="text-slate-400 text-xs mb-4">Your active cryptographic address linked on the blockchain.</p>
            
            <div className="p-4 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-xs font-mono text-slate-800 dark:text-slate-300 break-all select-all mb-4">
              {address}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={copyAddressToClipboard}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#2c2f32] dark:hover:bg-[#3a3a43] text-slate-700 dark:text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                {copied ? '✓ Copied!' : '📋 Copy Address'}
              </button>
              <button 
                onClick={() => setIsAddressModalOpen(false)}
                className="flex-1 py-3 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;