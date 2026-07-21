import React, { useContext, createContext, useState, useEffect } from 'react';
import { useAddress, useContract, useContractWrite, useConnect, useDisconnect, metamaskWallet } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract('0x785EAf8521aFE33171Fa1bFB7B71A28B3FafB08f');
  const { mutateAsync: createCampaignFn } = useContractWrite(contract, 'createCampaign');
  const [ethPrice, setEthPrice] = useState({ usd: 3000, ngn: 4500000 });

  const address = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect();

  // 🔍 Global UI & Modal Control States
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // 👤 Initialize userStatus immediately from LocalStorage if available
  const [userStatus, setUserStatus] = useState(() => {
    const currentAddress = address || window.ethereum?.selectedAddress;
    if (!currentAddress) return { exists: false, role: 0, domain: "", isVerified: false };
    
    const saved = localStorage.getItem(`user_status_${currentAddress}`);
    return saved ? JSON.parse(saved) : { exists: false, role: 0, domain: "", isVerified: false };
  });

  // --- 1. CONNECT WALLET ---
  const connectWallet = async () => {
    try {
      await connect(metamaskWallet());
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // --- 2. CHECK USER STATUS (LocalStorage First, Contract Second) ---
  const checkUserStatus = async () => {
    const currentAddress = address || window.ethereum?.selectedAddress;
    if (!currentAddress) return;

    // Check Local Storage first
    const savedLocal = localStorage.getItem(`user_status_${currentAddress}`);
    if (savedLocal) {
      setUserStatus(JSON.parse(savedLocal));
      return;
    }

    // Fallback to Smart Contract
    if (contract) {
      try {
        const data = await contract.call('users', [currentAddress]);
        if (data && data.exists) {
          const status = {
            role: data.role,
            domain: data.domain,
            isVerified: data.isVerified,
            exists: data.exists
          };
          setUserStatus(status);
          localStorage.setItem(`user_status_${currentAddress}`, JSON.stringify(status));
        }
      } catch (error) {
        console.error("Failed to fetch user status from contract:", error);
      }
    }
  };

  // Sync profile state whenever address changes
  useEffect(() => {
    if (address) {
      checkUserStatus();
    } else {
      setUserStatus({ exists: false, role: 0, domain: "", isVerified: false });
    }
  }, [address, contract]);

  // Fetch live ETH conversion rates on mount
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
  }, []);

  // --- 3. REGISTER USER ---
  const registerUser = async (form) => {
  try {
    setIsLoading(true);
    const roleNumber = form.role === 'admin' ? 1 : 0;
    const domain = form.domain || "general";

    if (contract && address) {
      // 1. Read existing on-chain user mapping/status first
      let isAlreadyRegistered = false;

      try {
        const existingUser = await contract.call('users', [address]);
        // Handle boolean flag or non-zero address/exists parameter from contract struct
        if (existingUser && (existingUser.exists || existingUser.isRegistered)) {
          isAlreadyRegistered = true;
        }
      } catch (readErr) {
        console.warn("Could not read on-chain user status, proceeding with write check:", readErr);
      }

      // 2. Only issue transaction if the address is NOT registered on-chain
      if (!isAlreadyRegistered) {
        const tx = await contract.call('registerUser', [roleNumber, domain]);
        console.log("On-chain registration successful", tx);
      } else {
        console.log("User already exists on-chain. Bypassing contract call and syncing local state...");
      }
    }

    const newUserData = {
      address,
      role: roleNumber,
      domain,
      organization: form.organization || "Academic Institution",
      isVerified: true,
      exists: true,
    };

    localStorage.setItem(`user_status_${address}`, JSON.stringify(newUserData));
    setUserStatus(newUserData);

    return newUserData;
  } catch (error) {
    console.error("Registration failure", error);
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
      const campaigns = await contract.call('getCampaigns');

      const parsedCampaigns = campaigns.map((c, i) => {
        const ethTarget = ethers.utils.formatEther(c.target.toString());
        const ethAmountCollected = ethers.utils.formatEther(c.amountCollected.toString());
        const selectedCurrency = c.currency ? c.currency.toString().toUpperCase().trim() : 'NGN';

        const finalTarget = Math.round(Number(ethTarget));
        const finalAmountCollected = Math.round(Number(ethAmountCollected));

        return {
          owner: c.owner,
          title: c.title,
          description: c.description,
          target: finalTarget,
          amountCollected: finalAmountCollected,
          currency: selectedCurrency,
          deadline: c.deadline.toNumber(),
          image: c.image,
          pId: i,
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
  };

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
        });
      }

      return parsedDonations;
    } catch (error) {
      console.error("Failed to fetch donations:", error);
      return [];
    }
  };

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
  };

  // --- 10. WITHDRAW FUNDS ---
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
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        isLoading,
        userStatus,
        setUserStatus,
        isSignupModalOpen,
        setIsSignupModalOpen,
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
        searchTerm,
        setSearchTerm,
        ethPrice
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);