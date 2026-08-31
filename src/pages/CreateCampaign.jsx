import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStateContext } from '../context';
import { CustomButton, FormField } from '../components';
import { useStorageUpload } from '@thirdweb-dev/react';
import { money } from '../assets';
import { ethers } from 'ethers';

// 🚀 IMPORT LIVE METRIC HANDLERS
import { fetchLiveRates, convertToEth, CURRENCY_SYMBOLS } from '../utils/cryptoUtils';

// 📸 Client-side image compression helper to avoid IPFS upload timeouts
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const scaleFactor = MAX_WIDTH / img.width;

        if (scaleFactor < 1) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleFactor;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Canvas compression failed'));
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          0.75 // 75% quality for fast IPFS uploads
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const CreateCampaign = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    createCampaign, 
    connectWallet, 
    address 
  } = useStateContext() || {};

  const { mutateAsync: upload } = useStorageUpload();
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Local state to handle loading status
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Active Environment Context & Dynamic Custom Questions State
  const [activeEnvironment, setActiveEnvironment] = useState(null);
  const [customResponses, setCustomResponses] = useState({});

  // Live currency tracking states
  const [currency, setCurrency] = useState('USD');
  const [displayTarget, setDisplayTarget] = useState('');

  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    target: '', // Stores calculated live ETH representation string
    deadline: '',
    image: ''
  });

  const handleImageUpload = async (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    // Read environment variables and clean whitespace/quotes
    const pinataJwt = import.meta.env.VITE_PINATA_JWT?.replace(/['"]/g, '').trim();
    const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY?.replace(/['"]/g, '').trim();
    const pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY?.replace(/['"]/g, '').trim();

    // Validate presence of at least one valid authentication method
    const hasJwt = Boolean(pinataJwt);
    const hasApiKeys = Boolean(pinataApiKey && pinataSecretKey);

    if (!hasJwt && !hasApiKeys) {
      alert('Missing Pinata credentials in .env! Please set VITE_PINATA_JWT or both VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY.');
      e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      setImagePreview(URL.createObjectURL(file));

      // Compress file if larger than 500KB
      const fileToUpload = file.size > 500 * 1024 ? await compressImage(file) : file;

      const formData = new FormData();
      formData.append('file', fileToUpload);

      // Build headers dynamically based on configured auth method
      const headers = {};
      if (hasJwt) {
        headers['Authorization'] = `Bearer ${pinataJwt}`;
      } else {
        headers['pinata_api_key'] = pinataApiKey;
        headers['pinata_secret_api_key'] = pinataSecretKey;
      }

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errorResponse = await res.json().catch(() => ({}));
        console.error('Pinata HTTP Error Details:', res.status, errorResponse);

        const errorMessage =
          errorResponse.error?.details ||
          errorResponse.error ||
          errorResponse.message ||
          `HTTP Error ${res.status} (Unauthorized/Invalid Key)`;

        throw new Error(errorMessage);
      }

      const resData = await res.json();
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${resData.IpfsHash}`;

      // Update campaign form state with short IPFS URL string
      setForm((prev) => ({ ...prev, image: ipfsUrl }));
    } catch (error) {
      console.error('Image upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setImagePreview('');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset file input element
    }
  };

  // Sync Live Rates & Check Router State Environment
  useEffect(() => {
    const initLiveRates = async () => {
      if (fetchLiveRates) await fetchLiveRates();
    };
    initLiveRates();

    if (location.state?.environment) {
      setActiveEnvironment(location.state.environment);
    } else {
      setActiveEnvironment(null);
    }
  }, [location.state]);

  const handleChange = (field, e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // Dynamic Questions Handler
  const handleCustomResponseChange = (questionLabel, value) => {
    setCustomResponses((prev) => ({
      ...prev,
      [questionLabel]: value
    }));
  };

  const handleCurrencyChange = (e) => {
    const selectedCurrency = e.target.value;
    setCurrency(selectedCurrency);
    
    if (convertToEth && displayTarget) {
      const ethEquivalent = convertToEth(displayTarget, selectedCurrency);
      setForm((prev) => ({ ...prev, target: ethEquivalent }));
    }
  };

  const handleTargetChange = (e) => {
    const value = e.target.value;
    setDisplayTarget(value);
    
    if (convertToEth) {
      const ethEquivalent = convertToEth(value, currency);
      setForm((prev) => ({ ...prev, target: ethEquivalent }));
    } else {
      setForm((prev) => ({ ...prev, target: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check wallet connection
    const currentAddress = address || (typeof window !== 'undefined' && window.ethereum?.selectedAddress);
    if (!currentAddress) {
      alert("Please connect your wallet first!");
      if (connectWallet) await connectWallet();
      return;
    }

    // 2. Validate Target
    if (!form.target || parseFloat(form.target) <= 0) {
      return alert("Target goal amount must be greater than 0");
    }

    // 3. Deadline Validation & Unix Timestamp conversion
    if (!form.deadline) return alert("Please select a valid deadline date.");
    
    const [year, month, day] = form.deadline.split('-').map(Number);
    const deadlineDate = new Date(year, month - 1, day, 23, 59, 59);
    const deadlineInSeconds = Math.floor(deadlineDate.getTime() / 1000);
    const currentUnixTime = Math.floor(Date.now() / 1000);

    if (isNaN(deadlineInSeconds) || deadlineInSeconds <= currentUnixTime) {
      return alert("Please select a future deadline date.");
    }

    // 4. Validate IPFS Image Presence
    if (!form.image) {
      return alert("Please upload a campaign featured image before submitting.");
    }

    setIsFormLoading(true);

    try {
      // Safe Wei Target Conversion
      const cleanTargetStr = String(form.target);
      
      const parseEthToWei = (ethStr) => {
        const num = parseFloat(ethStr);
        if (isNaN(num) || num <= 0) return '0';
        
        const fixedEthStr = num.toFixed(18).replace(/\.?0+$/, '');
        
        if (ethers.utils && ethers.utils.parseUnits) {
          return ethers.utils.parseUnits(fixedEthStr, 18).toString();
        } else if (ethers.parseUnits) {
          return ethers.parseUnits(fixedEthStr, 18).toString();
        } else {
          return Math.floor(num * 1e18).toString();
        }
      };

      const weiTargetStr = parseEthToWei(cleanTargetStr);

      const campaignPayload = {
        ...form,
        target: weiTargetStr,
        displayTarget,
        currency,
        deadline: deadlineInSeconds,
        owner: currentAddress,
        verificationData: customResponses,
        environmentId: activeEnvironment?.id || null,
        environmentTitle: activeEnvironment?.title || null,
        id: `campaign_${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      // 🔴 SCENARIO A: Environment Active -> Route to LocalStorage for Admin Verification
      if (activeEnvironment) {
        const existingPending = JSON.parse(localStorage.getItem('pending_campaigns') || '[]');
        existingPending.push({
          ...campaignPayload,
          status: 'PENDING'
        });
        localStorage.setItem('pending_campaigns', JSON.stringify(existingPending));

        alert("📋 Campaign submitted for Admin review! It will be deployed once verified.");
        navigate('/dashboard');
      } 
      // 🟢 SCENARIO B: Direct Public Launch -> Deploy Directly On-Chain
      else {
        if (createCampaign) {
          await createCampaign(campaignPayload);
          alert("🎉 Campaign created successfully on-chain!");
          navigate('/home');
        }
      }
    } catch (error) {
      console.error("Campaign Creation Error:", error);
      alert(`Transaction failed: ${error.reason || error.message || "Execution reverted"}`);
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f12] flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 font-epilogue">
      
      {/* 🌌 Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8c6dfd] rounded-full blur-[150px] opacity-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1dc071] rounded-full blur-[150px] opacity-5" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[900px] bg-white/90 dark:bg-[#1c1c24]/80 backdrop-blur-xl border border-slate-200 dark:border-[#3a3a43] flex flex-col items-center rounded-3xl p-6 sm:p-12 shadow-2xl z-10 transition-colors"
      >
        <div className="text-center mb-10">
          <div className="inline-block p-3 rounded-2xl bg-slate-100 dark:bg-[#3a3a43] mb-4">🚀</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Launch Your <span className="text-[#8c6dfd]">Campaign</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-2">
            Fill in the details below to deploy your campaign.
          </p>
        </div>

        {/* 🏢 ACTIVE ENVIRONMENT BANNER */}
        {activeEnvironment && (
          <div className="w-full p-5 bg-[#8c6dfd]/10 border border-[#8c6dfd]/30 rounded-2xl mb-8 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#8c6dfd] bg-[#8c6dfd]/20 px-2.5 py-0.5 rounded-full">
                Verification Environment Active
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{activeEnvironment.title}</h3>
            {activeEnvironment.description && (
              <p className="text-xs text-slate-500 dark:text-gray-400">{activeEnvironment.description}</p>
            )}
          </div>
        )}

        <div className="w-full flex items-center p-6 bg-gradient-to-r from-[#8c6dfd] to-[#7a59e6] rounded-2xl mb-10 shadow-lg border border-white/10">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <img src={money} alt="money" className="w-8 h-8 object-contain brightness-0 invert" />
          </div>
          <h4 className="font-bold text-lg sm:text-2xl text-white ml-6">
            100% of raised funds go directly to your wallet.
          </h4>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              labelName="Organizer Name *"
              placeholder="e.g. John Doe"
              inputType="text"
              value={form.name}
              handleChange={(e) => handleChange('name', e)}
            />
            <FormField
              labelName="Campaign Title *"
              placeholder="Give your campaign a catchy name"
              inputType="text"
              value={form.title}
              handleChange={(e) => handleChange('title', e)}
            />
          </div>

          <FormField
            labelName="Project Story *"
            placeholder="Describe your goals..."
            isTextArea
            value={form.description}
            handleChange={(e) => handleChange('description', e)}
          />

          {/* CURRENCY ROW CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-epilogue font-medium text-[14px] leading-[22px] text-slate-500 dark:text-[#808191]">Target Currency *</label>
                <select
                  value={currency}
                  onChange={handleCurrencyChange}
                  className="py-[15px] sm:px-[25px] px-[15px] outline-none border border-slate-200 dark:border-[#3a3a43] bg-slate-50 dark:bg-[#1c1c24] text-slate-900 dark:text-white font-epilogue text-[14px] rounded-[10px] focus:border-[#8c6dfd] transition-all"
                >
                  <option value="USD">USD ($)</option>
                  <option value="NGN">NGN (₦)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="ETH">ETH (Ξ)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-epilogue font-medium text-[14px] leading-[22px] text-slate-500 dark:text-[#808191]">
                  Funding Goal ({currency}) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-slate-400 text-[14px] font-epilogue">
                    {CURRENCY_SYMBOLS ? CURRENCY_SYMBOLS[currency] : '$'}
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder={`0.00 (${currency})`}
                    value={displayTarget}
                    onChange={handleTargetChange}
                    className="w-full py-[15px] pl-10 pr-[25px] outline-none border border-slate-200 dark:border-[#3a3a43] bg-transparent text-slate-900 dark:text-white font-epilogue text-[14px] rounded-[10px] focus:border-[#8c6dfd] transition-all"
                  />
                </div>
                {displayTarget && (
                  <p className="text-xs text-[#4acd8d] font-semibold mt-1">
                    ⚡ On-Chain Target Equivalent: {form.target} ETH
                  </p>
                )}
              </div>
            </div>

            <FormField
              labelName="Campaign Deadline *"
              inputType="date"
              value={form.deadline}
              handleChange={(e) => handleChange('deadline', e)}
            />
          </div>

          {/* FEATURED IMAGE IPFS UPLOADER */}
          <div className="flex flex-col gap-[10px]">
            <label className="font-epilogue font-medium text-[14px] leading-[22px] text-slate-500 dark:text-[#808191]">
              Featured Image *
            </label>

            <div className="flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed border-[#3a3a43] hover:border-[#1dc071] rounded-[10px] bg-slate-50 dark:bg-[#1c1c24] p-4 transition-all relative overflow-hidden">
              {imagePreview || form.image ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <img
                    src={imagePreview || form.image}
                    alt="Campaign cover preview"
                    className="w-full h-[180px] object-cover rounded-[8px]"
                  />
                  <label className="mt-2 text-[12px] text-[#1dc071] font-bold underline cursor-pointer">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-[#808191]">
                      <span className="font-semibold text-[#1dc071]">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-[#808191]">PNG, JPG, WEBP, or GIF (Uploaded to IPFS)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-[#1c1c24]/80 flex items-center justify-center backdrop-blur-sm z-10">
                  <p className="text-[#1dc071] font-semibold text-[14px] animate-pulse">
                    Compressing & Uploading file to IPFS...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 📋 DYNAMIC CUSTOM QUESTIONS SECTION */}
          {activeEnvironment?.customQuestions && activeEnvironment.customQuestions.length > 0 && (
            <div className="w-full p-6 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-2xl flex flex-col gap-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#8c6dfd]">
                Required Verification Details
              </h3>
              
              {activeEnvironment.customQuestions.map((q) => (
                <div key={q.id} className="flex flex-col gap-2">
                  <label className="font-epilogue font-medium text-[14px] leading-[22px] text-slate-500 dark:text-[#808191]">
                    {q.label} {q.required && '*'}
                  </label>

                  {q.type === 'textarea' ? (
                    <textarea
                      required={q.required}
                      rows={4}
                      placeholder="Enter details..."
                      className="py-[15px] sm:px-[25px] px-[15px] outline-none border border-slate-200 dark:border-[#3a3a43] bg-white dark:bg-[#1c1c24] text-slate-900 dark:text-white font-epilogue text-[14px] rounded-[10px] focus:border-[#8c6dfd] transition-all"
                      value={customResponses[q.label] || ''}
                      onChange={(e) => handleCustomResponseChange(q.label, e.target.value)}
                    />
                  ) : q.type === 'file' ? (
                    <input
                      type="file"
                      required={q.required}
                      className="py-[12px] px-[15px] border border-slate-200 dark:border-[#3a3a43] bg-white dark:bg-[#1c1c24] text-slate-900 dark:text-white font-epilogue text-[14px] rounded-[10px] focus:border-[#8c6dfd] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#8c6dfd]/10 file:text-[#8c6dfd] file:font-bold cursor-pointer"
                      onChange={(e) => handleCustomResponseChange(q.label, e.target.files[0]?.name || '')}
                    />
                  ) : (
                    <input
                      type="text"
                      required={q.required}
                      placeholder="Enter response..."
                      className="py-[15px] sm:px-[25px] px-[15px] outline-none border border-slate-200 dark:border-[#3a3a43] bg-white dark:bg-[#1c1c24] text-slate-900 dark:text-white font-epilogue text-[14px] rounded-[10px] focus:border-[#8c6dfd] transition-all"
                      value={customResponses[q.label] || ''}
                      onChange={(e) => handleCustomResponseChange(q.label, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center mt-6">
            <CustomButton
              btnType="submit"
              title={
                isFormLoading
                  ? "Processing..."
                  : activeEnvironment
                  ? "📋 Submit for Admin Approval"
                  : "🚀 Deploy Campaign On-Chain"
              }
              styles={`w-full sm:w-auto px-12 py-4 text-lg font-bold rounded-2xl transition-all cursor-pointer ${
                isFormLoading ? 'bg-gray-600' : 'bg-[#1dc071] hover:bg-[#17a360]'
              }`}
            />
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCampaign;