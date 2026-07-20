import React, { useContext, createContext, useState, useEffect } from 'react';
import { useAddress, useContract, useContractWrite, useConnect, useDisconnect, metamaskWallet } from '@thirdweb-dev/react'; // 🚀 Added useDisconnect
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract('0x785EAf8521aFE33171Fa1bFB7B71A28B3FafB08f');
  const { mutateAsync: createCampaignFn } = useContractWrite(contract, 'createCampaign');
  const [ethPrice, setEthPrice] = useState({ usd: 3000, ngn: 4500000 }); i

  const address = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect(); // 🚀 Initialize the thirdweb disconnect engine
  
  // 🔍 MOVED INSIDE COMPONENT: Global State for Tracking Campaign Search Query 
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userStatus, setUserStatus] = useState({ exists: false, role: 0, domain: "", isVerified: false });

  // --- 1. CONNECT WALLET ---
  const connectWallet = async () => {
    try {
      await connect(metamaskWallet());
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // --- 2. CHECK USER STATUS ---
  const checkUserStatus = async () => {
    if (!address || !contract) return;
    try {
      const data = await contract.call('users', [address]);
      setUserStatus({
        role: data.role,
        domain: data.domain,
        isVerified: data.isVerified,
        exists: data.exists
      });
    } catch (error) {
      console.error("Failed to fetch user status:", error);
    }
  };

  // 🔍 1. Fetch live market conversion rates as soon as the application mounts
  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,ngn');
        const data = await response.json();
        
        if (data?.ethereum) {
          setEthPrice({
            usd: data.ethereum.usd,
            ngn: data.ethereum.ngn
          });
        }
      } catch (error) {
        console.error("Failed to sync live exchange matrices:", error);
      }
    };

    fetchLiveRates();
  }, []); // Empty dependency array means this runs exactly once on load

  // 👤 2. Your original hook to verify profiles when the wallet state connects
  useEffect(() => {
    if (address && contract) checkUserStatus();
  }, [address, contract]);

  // --- 3. REGISTER USER ---
  const registerUser = async (form) => {
    try {
      setIsLoading(true);
      const roleNumber = form.role === 'admin' ? 1 : 2;
      const domain = form.domain || "general";

      const tx = await contract.call('registerUser', [roleNumber, domain]);
      
      console.log("Registration successful", tx);
      await checkUserStatus();
      return tx;
    } catch (error) {
      console.error("Contract call failure", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. CREATE CAMPAIGN ---
  const createCampaign = async (form) => {
    if (!address) return alert("Please connect your wallet");

    try {
      setIsLoading(true);
      const tx = await createCampaignFn({
        args: [
          address,
          form.title,
          form.description,
          form.target,
          new Date(form.deadline).getTime(),
          form.image
        ]
      });

      console.log("Campaign created successfully", tx);
    } catch (error) {
      console.error("Failed to create campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. FETCH ALL CAMPAIGNS ---
 const getCampaigns = async () => {
    try {
      // 1. Fetch raw campaigns directly from your smart contract array
      const campaigns = await contract.call('getCampaigns');

      // 2. Loop through every single campaign to parse the data for the UI
      const parsedCampaigns = campaigns.map((c, i) => {
        // Convert raw BigNumber blockchain layout (Wei) into a standard decimal Ether string layout
        const ethTarget = ethers.utils.formatEther(c.target.toString());
        const ethAmountCollected = ethers.utils.formatEther(c.amountCollected.toString());
        
        // Read the currency preference parameter saved to the contract struct (defaulting to NGN)
        const selectedCurrency = c.currency ? c.currency.toString().toUpperCase().trim() : 'NGN';

        // Set baseline values to dynamic live market values state variables
        const currentUsdRate = ethPrice?.usd || 3000;
        const currentNgnRate = ethPrice?.ngn || 4500000;

        let finalTarget = ethTarget;
        let finalAmountCollected = ethAmountCollected;

        // Multiply the standard ether string value by your dynamic live exchange rates
        if (selectedCurrency === 'USD' || selectedCurrency === '1') {
          finalTarget = Math.round(Number(ethTarget) * currentUsdRate);
          finalAmountCollected = Math.round(Number(ethAmountCollected) * currentUsdRate);
        } else if (selectedCurrency === 'NGN' || selectedCurrency === '0') {
          finalTarget = Math.round(Number(ethTarget) * currentNgnRate);
          finalAmountCollected = Math.round(Number(ethAmountCollected) * currentNgnRate);
        }

        return {
          owner: c.owner,
          title: c.title,
          description: c.description,
          // 🔍 THESE ARE SENT TO FUNDCARD
          target: finalTarget,
          amountCollected: finalAmountCollected,
          currency: selectedCurrency, // Tells FundCard to display ₦ or $
          deadline: c.deadline.toNumber(),
          image: c.image,
          pId: i,
          
          // Kept safe for underlying transactional logic
          rawEthTarget: ethTarget,
          rawEthCollected: ethAmountCollected
        };
      });

      return parsedCampaigns;
    } catch (error) {
      console.error("Failed to fetch or parse campaigns:", error);
      return [];
    }
  };

  // --- 6. FETCH USER SPECIFIC CAMPAIGNS ---
  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();
    return allCampaigns.filter((campaign) => campaign.owner === address);
  };

  // --- 7. DONATE TO CAMPAIGN ---
  const donate = async (pId, amount) => {
    try {
      setIsLoading(true);
      const data = await contract.call('donateToCampaign', [pId], { 
        value: ethers.utils.parseEther(amount) 
      });

      return data;
    } catch (error) {
      console.error("Donation failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // --- 8. GET DONATIONS HISTORY ---
  const getDonations = async (pId) => {
    try {
      const donations = await contract.call('getDonators', [pId]);
      const numberOfDonations = donations[0].length;

      const parsedDonations = [];

      for(let i = 0; i < numberOfDonations; i++) {
        parsedDonations.push({
          donator: donations[0][i],
          donation: ethers.utils.formatEther(donations[1][i].toString())
        })
      }

      return parsedDonations;
    } catch (error) {
      console.error("Failed to fetch donations:", error);
      return [];
    }
  }

  // --- 9. CLAIM REFUND ---
  const claimRefund = async (pId) => {
    try {
      setIsLoading(true);
      const data = await contract.call('claimRefund', [pId]);
      console.log("Refund successful", data);
      return data;
    } catch (error) {
      console.error("REASON FOR FAILURE:", error.reason || error.message);
      console.error("Refund failed", error);
    } finally {
      setIsLoading(false);
    }
  }

  const withdrawFunds = async (pId) => {
    try {
      setIsLoading(true);
      const data = await contract.call('withdrawFunds', [pId]);
      console.log("Withdrawal successful", data);
      return data;
    } catch (error) {
      console.error("Withdrawal failed", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        isLoading,
        userStatus,
        setUserStatus,
        disconnect,    
        connectWallet,
        createCampaign,
        getCampaigns,
        getUserCampaigns,
        registerUser,
        checkUserStatus,
        donate,
        getDonations,
        claimRefund,
        withdrawFunds,
        searchTerm,     // 🔍 Added to expose state property globally
        setSearchTerm,  // 🔍 Added to expose state method globally
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);