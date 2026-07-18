import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useStateContext } from '../context';
import { CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

// 🚀 IMPORT LIVE METRIC HANDLERS
import { fetchLiveRates, convertFromEth, convertToEth, CURRENCY_SYMBOLS } from '../utils/cryptoUtils';

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, address, claimRefund, withdrawFunds } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(''); // Stores what the user type in local fiat currency
  const [donors, setDonors] = useState([]);
  const [ratesLoaded, setRatesLoaded] = useState(false);

  // Fallback to USD layout configuration if state object doesn't supply an explicit metric choice
  const campaignCurrency = state.currency || 'USD';
  const symbol = CURRENCY_SYMBOLS[campaignCurrency];

  const remainingDays = daysLeft(state.deadline);

  // Synchronize dynamic exchange data on loading entry point
  useEffect(() => {
    const loadRealTimeData = async () => {
      await fetchLiveRates();
      setRatesLoaded(true);
    };
    loadRealTimeData();
  }, []);

  // Converts native blockchain Wei integers cleanly back into human-readable ETH decimals
  // Converts native blockchain Wei integers cleanly back into human-readable ETH decimals
const getRawEth = (value) => {
  if (!value) return "0.0000";
  
  try {
    const strVal = value.toString();
    
    // If it's a massive BigNumber or a raw Wei string representation (long string without a dot)
    if (!strVal.includes('.')) {
      return ethers.utils.formatEther(strVal);
    }
    
    return strVal;
  } catch (error) {
    console.error("Error formatting value:", error);
    return "0.0000";
  }
}

  // Get foundational plain text standard token balances
  const rawEthCollected = getRawEth(state.amountCollected);
  const rawEthTarget = getRawEth(state.target);

  // Convert background block strings cleanly down into local interface representations
  const localCollected = convertFromEth(rawEthCollected, campaignCurrency);
  const localTarget = convertFromEth(rawEthTarget, campaignCurrency);

  // Calculate local remaining targets cleanly
  const remainingEth = parseFloat(rawEthTarget) - parseFloat(rawEthCollected);
  const localRemaining = convertFromEth(remainingEth > 0 ? remainingEth : 0, campaignCurrency);

  const fetchDonors = async () => {
    const data = await getDonations(state.pId);
    setDonors(data);
  }

  useEffect(() => {
    if(contract) fetchDonors();
  }, [contract, address]);

  const handleDonate = async () => {
    if(!displayAmount || parseFloat(displayAmount) <= 0) return alert("Enter a valid amount");
    
    // Automatically convert current fiat input value down into real-time rounded ETH representation string
    const ethEquivalentToSend = convertToEth(displayAmount, campaignCurrency);

    setIsLoading(true);
    try {
      // Pass the converted ETH value straight down to your context layer setup
      await donate(state.pId, ethEquivalentToSend); 
      navigate('/');
    } catch (error) {
      console.error("Donation failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f12] transition-colors duration-300">
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        {/* LEFT SIDE: Image and Content */}
        <div className="flex-1 flex-col">
          <img src={state.image} alt="campaign" className="w-full h-[410px] object-cover rounded-3xl shadow-2xl"/>
          
          <div className="relative w-full h-[5px] bg-slate-200 dark:bg-[#3a3a43] mt-2 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-[#4acd8d]" 
              style={{ width: `${calculateBarPercentage(rawEthTarget, rawEthCollected)}%`, maxWidth: '100%' }}
            ></div>
          </div>

          <div className="mt-[60px] flex flex-col gap-10">
            <div className="flex flex-row items-center p-4 bg-white dark:bg-[#1c1c24] rounded-2xl border border-slate-200 dark:border-[#3a3a43]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain"/>
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-[18px] text-slate-900 dark:text-white break-all">{state.owner}</h4>
                <p className="text-slate-500 dark:text-[#808191]">Verified Academic Researcher</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[18px] text-slate-900 dark:text-white uppercase">Campaign Story</h4>
              <div className="mt-[20px]">
                <p className="text-slate-600 dark:text-[#808191] leading-[26px] text-justify">{state.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Donation Terminal */}
        <div className="flex-1">
          <h4 className="font-bold text-[18px] text-slate-900 dark:text-white uppercase">Funding Status</h4>
          
          <div className="mt-[20px] flex flex-col p-8 bg-white dark:bg-[#1c1c24] rounded-3xl border border-slate-200 dark:border-[#3a3a43] shadow-xl">
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 dark:text-[#808191]">Collected</p>
                  <p className="font-bold text-slate-900 dark:text-white text-xl">
                    {symbol}{localCollected} <span className="text-xs font-normal text-slate-400">({campaignCurrency})</span>
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 dark:text-[#808191]">Target Goal</p>
                  <p className="font-bold text-slate-900 dark:text-white text-xl">
                    {symbol}{localTarget}
                  </p>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-[#3a3a43] pt-4">
                  <p className="text-slate-500 dark:text-[#808191]">Remaining</p>
                  <p className={`font-bold text-lg ${remainingEth <= 0 ? 'text-[#4acd8d]' : 'text-orange-400'}`}>
                    {remainingEth <= 0 ? 'Goal Met! 🎉' : `${symbol}${localRemaining}`}
                  </p>
                </div>
            </div>

            {/* Captures local pricing natively */}
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-slate-400 text-[18px]">{symbol}</span>
              <input 
                type="number"
                placeholder={`0.00 (${campaignCurrency})`}
                step="any"
                className="w-full py-[10px] pl-10 pr-[15px] outline-none border-[1px] border-slate-200 dark:border-[#3a3a43] bg-transparent text-slate-900 dark:text-white text-[18px] leading-[30px] placeholder:text-slate-400 dark:placeholder:text-[#4b5264] rounded-[10px] focus:border-[#8c6dfd] transition-all"
                value={displayAmount}
                onChange={(e) => setDisplayAmount(e.target.value)}
              />
            </div>

            {displayAmount && (
              <p className="text-right text-xs text-slate-400 italic mt-2">
                ⚡ Payload output: ~ {convertToEth(displayAmount, campaignCurrency)} ETH (Rounded to 4 decimals)
              </p>
            )}

            <button
              type="button"
              className="w-full bg-[#8c6dfd] py-4 mt-6 rounded-xl font-bold text-white hover:bg-[#7a59e6] transition-all"
              onClick={handleDonate}
            >
              Fund Campaign ({symbol}{displayAmount || '0'})
            </button>

            {/* Refund Logic */}
            {remainingDays < 0 && parseFloat(rawEthCollected) < parseFloat(rawEthTarget) && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl mt-6">
                <p className="text-red-600 dark:text-red-400 font-medium mb-4">
                  This campaign failed to reach its goal.
                </p>
                <CustomButton 
                  btnType="button"
                  title="Claim My Refund"
                  styles="bg-[#ff4444] w-full text-white"
                  handleClick={async () => {
                    setIsLoading(true);
                    await claimRefund(state.pId);
                    setIsLoading(false);
                    navigate('/');
                  }}
                />
              </div>
            )}

            {/* Withdrawal Logic */}
            {address === state.owner && parseFloat(rawEthCollected) >= parseFloat(rawEthTarget) && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl mt-6">
                <p className="text-green-600 dark:text-green-400 font-medium mb-4 text-sm">
                  Success! Target reached.
                </p>
                <CustomButton 
                  btnType="button"
                  title="Withdraw Funds"
                  styles="bg-[#4acd8d] w-full text-white"
                  handleClick={async () => {
                    setIsLoading(true);
                    await withdrawFunds(state.pId);
                    setIsLoading(false);
                    navigate('/');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetails;