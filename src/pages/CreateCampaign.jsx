import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStateContext } from '../context';
import { CustomButton, FormField } from '../components';
import { checkIfImage } from '../utils';
import { money } from '../assets';
import { ethers } from 'ethers';

// 🚀 IMPORT LIVE METRIC HANDLERS
import { fetchLiveRates, convertToEth, CURRENCY_SYMBOLS } from '../utils/cryptoUtils';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { createCampaign, connectWallet, address } = useStateContext();
  
  // Local state to handle the loading spinner correctly
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Live currency handling tracking states
  const [currency, setCurrency] = useState('USD');
  const [displayTarget, setDisplayTarget] = useState('');

  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    target: '', // This will securely store the calculated live ETH representation string
    deadline: '',
    image: ''
  });

  // Fetch real-time fluctuating exchange data when creation menu opens
  useEffect(() => {
    const initLiveRates = async () => {
      await fetchLiveRates();
    };
    initLiveRates();
  }, []);

  const handleChange = (field, e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // Re-calculate the underlying ETH string if the currency selector is toggled
  const handleCurrencyChange = (e) => {
    const selectedCurrency = e.target.value;
    setCurrency(selectedCurrency);
    
    const ethEquivalent = convertToEth(displayTarget, selectedCurrency);
    setForm({ ...form, target: ethEquivalent });
  };

  // Process live text modifications, round to 4 decimals, and bind to standard target form state
  const handleTargetChange = (e) => {
    const value = e.target.value;
    setDisplayTarget(value);
    
    const ethEquivalent = convertToEth(value, currency);
    setForm({ ...form, target: ethEquivalent });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Check if wallet is connected
    if (!address) {
      alert("Please connect your wallet first!");
      await connectWallet();
      return;
    }

    // 2. Validate Target input
    if (!form.target || parseFloat(form.target) <= 0) {
      return alert("Target goal amount must be greater than 0");
    }

    // 3. Validate Image URL before starting blockchain process
    checkIfImage(form.image, async (exists) => {
      if (!exists) {
        alert("Please provide a valid image URL");
        setForm({ ...form, image: '' });
        return;
      }

      // Start loading
      setIsFormLoading(true);

      try {
        // 4. Force Switch to Sepolia Chain
        if (window.ethereum) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xaa36a7" }], 
            });
          } catch (switchError) {
            console.log("Could not switch network automatically.");
          }
        }

        // 5. Convert converted real-time ETH string safely to a clean on-chain Wei representation
        const weiTargetStr = ethers.utils.parseUnits(form.target.toString(), 18).toString();

        // 6. Call Contract with the clean, raw Wei string
        await createCampaign({ 
          ...form, 
          target: weiTargetStr 
        });

        // 7. Reset state arrays and navigate on success
        setForm({ name: '', title: '', description: '', target: '', deadline: '', image: '' });
        setDisplayTarget('');
        navigate('/');
      } catch (error) {
        console.log("Contract call failure", error);
        alert("Transaction failed. Check console for details.");
      } finally {
        // Stop loading whether success or failure
        setIsFormLoading(false);
      }
    });
  };

  return (
    // 🔄 CHANGED: Implemented adaptive page wrapper background configuration tokens below
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f12] flex justify-center items-start py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
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
          {/* 🔄 CHANGED: Dynamic headings color tokens */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Launch Your <span className="text-[#8c6dfd]">Campaign</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-2">Fill in the details below to deploy your campaign to the blockchain.</p>
        </div>

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
              placeholder="Give your project a catchy name"
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

          {/* ⚡ UPDATED: CURRENCY ROW CONTAINER MATRIX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              
              {/* Dropdown element menu */}
              <div className="flex flex-col gap-2">
                <label className="font-epilogue font-medium text-[14px] leading-[22px] text-slate-500 dark:text-[#808191]">Target Currency *</label>
                {/* 🔄 CHANGED: Modified internal selector UI variables */}
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

              {/* Styled target element interface field */}
              <div className="flex flex-col gap-2">
                <label className="font-epilogue font-medium text-[14px] leading-[22px] text-slate-500 dark:text-[#808191]">
                  Funding Goal ({currency}) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-slate-400 text-[14px] font-epilogue">
                    {CURRENCY_SYMBOLS[currency]}
                  </span>
                  {/* 🔄 CHANGED: Integrated adaptive input border-color attributes */}
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
                    ⚡ Real-time Crypto Processing Target: {form.target} ETH (Rounded to 4 decimals)
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

          <FormField
            labelName="Featured Image URL *"
            placeholder="Link to your project cover photo"
            inputType="url"
            value={form.image}
            handleChange={(e) => handleChange('image', e)}
          />

          <div className="flex flex-col items-center mt-6">
            <CustomButton
              btnType="submit"
              title={isFormLoading ? "Deploying to Blockchain..." : "🚀 Deploy Campaign"}
              styles={`w-full sm:w-auto px-12 py-4 text-lg font-bold rounded-2xl transition-all ${
                isFormLoading ? 'bg-gray-600' : 'bg-[#1dc071] hover:bg-[#17a360]'
              }`}
            />
            {isFormLoading && (
              <p className="mt-4 text-[#4acd8d] animate-pulse font-medium italic">
                Wait for MetaMask to confirm the transaction...
              </p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCampaign;