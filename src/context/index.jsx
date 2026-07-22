import React, { useContext, createContext, useState, useEffect, useCallback } from 'react';
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
  const [signupInitialRole, setSignupInitialRole] = useState(null); // 'admin' | 'recipient' | null

  // 👤 Role-based Account Profiles
  const [adminStatus, setAdminStatus] = useState(null);
  const [recipientStatus, setRecipientStatus] = useState(null);
  const [activeRole, setActiveRole] = useState('recipient'); // 'admin' | 'recipient'

  // Backward-compatible fallback status pointer
  const [userStatus, setUserStatus] = useState(() => {
    const currentAddress = address || (typeof window !== 'undefined' && window.ethereum?.selectedAddress);
    if (!currentAddress) return { exists: false, role: 0, domain: "", isVerified: false };
    
    const savedRecipient = localStorage.getItem(`recipient_account_${currentAddress}`) || localStorage.getItem(`recipient_status_${currentAddress}`);
    const savedAdmin = localStorage.getItem(`admin_account_${currentAddress}`) || localStorage.getItem(`admin_status_${currentAddress}`);
    const savedGeneral = localStorage.getItem(`user_status_${currentAddress}`);
    
    const saved = savedRecipient || savedAdmin || savedGeneral;
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

  // --- 2. CHECK USER STATUS (LocalStorage, Session, & Contract Sync) ---
  const checkUserStatus = useCallback(async () => {
    const currentAddress = address || (typeof window !== 'undefined' && window.ethereum?.selectedAddress);
    if (!currentAddress) {
      setAdminStatus(null);
      setRecipientStatus(null);
      setUserStatus({ exists: false, role: 0, domain: "", isVerified: false });
      return;
    }

    // Check Local Storage for both profile keys
    const savedAdmin = localStorage.getItem(`admin_account_${currentAddress}`) || localStorage.getItem(`admin_status_${currentAddress}`);
    const savedRecipient = localStorage.getItem(`recipient_account_${currentAddress}`) || localStorage.getItem(`recipient_status_${currentAddress}`);
    const savedGeneral = localStorage.getItem(`user_status_${currentAddress}`);

    const parsedAdmin = savedAdmin ? JSON.parse(savedAdmin) : null;
    const parsedRecipient = savedRecipient ? JSON.parse(savedRecipient) : (savedGeneral ? JSON.parse(savedGeneral) : null);

    if (parsedAdmin) setAdminStatus(parsedAdmin);
    if (parsedRecipient) setRecipientStatus(parsedRecipient);

    if (parsedRecipient) {
      setUserStatus(parsedRecipient);
    } else if (parsedAdmin) {
      setUserStatus(parsedAdmin);
    }

    // Fallback to Smart Contract if neither local profile is found
    if (contract && !parsedAdmin && !parsedRecipient) {
      try {
        const data = await contract.call('users', [currentAddress]);
        if (data && (data.exists || data.isRegistered)) {
          const status = {
            address: currentAddress,
            role: Number(data.role),
            domain: data.domain || "general",
            isVerified: data.isVerified ?? true,
            exists: true
          };

          if (Number(data.role) === 1) {
            setAdminStatus(status);
            localStorage.setItem(`admin_status_${currentAddress}`, JSON.stringify(status));
          } else {
            setRecipientStatus(status);
            localStorage.setItem(`recipient_status_${currentAddress}`, JSON.stringify(status));
          }
          setUserStatus(status);
        }
      } catch (error) {
        console.error("Failed to fetch user status from contract:", error);
      }
    }
  }, [address, contract]);

  // Sync profile state ONLY when address changes
  useEffect(() => {
    if (address) {
      checkUserStatus();
    } else {
      setAdminStatus(null);
      setRecipientStatus(null);
      setUserStatus({ exists: false, role: 0, domain: "", isVerified: false });
    }
  }, [address]);

  // Fetch live ETH conversion rates on mount safely
  useEffect(() => {
    let isMounted = true;

    const fetchLiveRates = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,ngn');
        const data = await response.json();
        
        if (isMounted && data?.ethereum) {
          setEthPrice({
            usd: data.ethereum.usd || 3000,
            ngn: data.ethereum.ngn || 4500000
          });
        }
      } catch (error) {
        console.error("Failed to sync live exchange rates:", error);
      }
    };

    fetchLiveRates();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- 3. REGISTER USER ---
  const registerUser = async (form) => {
    try {
      setIsLoading(true);
      const isFormAdmin = form.role === 'admin' || form.role === 1;
      const roleNumber = isFormAdmin ? 1 : 0;
      const domain = form.domain || "general";

      if (contract && address) {
        let isAlreadyRegistered = false;

        try {
          const existingUser = await contract.call('users', [address]);
          if (existingUser && (existingUser.exists || existingUser.isRegistered)) {
            isAlreadyRegistered = true;
          }
        } catch (readErr) {
          console.warn("Could not read on-chain user status, proceeding:", readErr);
        }

        if (!isAlreadyRegistered) {
          const tx = await contract.call('registerUser', [roleNumber, domain]);
          console.log("On-chain registration successful", tx);
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

      if (isFormAdmin) {
        localStorage.setItem(`admin_status_${address}`, JSON.stringify(newUserData));
        localStorage.setItem(`admin_account_${address}`, JSON.stringify(newUserData));
        sessionStorage.setItem(`admin_session_${address}`, 'true');
        setAdminStatus(newUserData);
        setActiveRole('admin');
      } else {
        localStorage.setItem(`recipient_status_${address}`, JSON.stringify(newUserData));
        localStorage.setItem(`recipient_account_${address}`, JSON.stringify(newUserData));
        sessionStorage.setItem(`recipient_session_${address}`, 'true');
        setRecipientStatus(newUserData);
        setActiveRole('recipient');
      }

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
      const args = [
        address,                  // owner
        form.title,                // title
        form.description,          // description
        form.target,               // target in Wei
        form.deadline,             // deadline in Unix timestamp
        form.image                 // image URL
      ];

      let tx;
      if (createCampaignFn) {
        tx = await createCampaignFn({ args });
      } else if (contract) {
        tx = await contract.call('createCampaign', args);
      }

      console.log("Campaign created successfully:", tx);
      return tx;
    } catch (error) {
      console.error("Failed to create campaign:", error);
      throw error; // Re-throw to allow component level alert handling
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. FETCH ALL CAMPAIGNS ---
  const getCampaigns = async () => {
    try {
      if (!contract) return [];
      const campaigns = await contract.call('getCampaigns');

      const parsedCampaigns = campaigns.map((c, i) => {
        const ethTarget = ethers.utils ? ethers.utils.formatEther(c.target.toString()) : (Number(c.target) / 1e18).toString();
        const ethAmountCollected = ethers.utils ? ethers.utils.formatEther(c.amountCollected.toString()) : (Number(c.amountCollected) / 1e18).toString();
        const selectedCurrency = c.currency ? c.currency.toString().toUpperCase().trim() : 'USD';
        const deadlineVal = c.deadline?.toNumber ? c.deadline.toNumber() : Number(c.deadline);

        return {
          owner: c.owner,
          title: c.title,
          description: c.description,
          target: parseFloat(ethTarget),
          amountCollected: parseFloat(ethAmountCollected),
          currency: selectedCurrency,
          deadline: deadlineVal,
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
    return allCampaigns.filter((campaign) => campaign.owner?.toLowerCase() === address?.toLowerCase());
  };

  // --- 7. DONATE TO CAMPAIGN ---
  const donate = async (pId, amount) => {
    try {
      setIsLoading(true);
      const weiValue = ethers.utils ? ethers.utils.parseEther(amount.toString()) : ethers.parseEther(amount.toString());
      const data = await contract.call('donateToCampaign', [pId], { 
        value: weiValue 
      });

      return data;
    } catch (error) {
      console.error("Donation failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- 8. GET DONATIONS HISTORY ---
  const getDonations = async (pId) => {
    try {
      if (!contract) return [];
      const donations = await contract.call('getDonators', [pId]);
      const numberOfDonations = donations[0]?.length || 0;

      const parsedDonations = [];

      for(let i = 0; i < numberOfDonations; i++) {
        const ethAmount = ethers.utils ? ethers.utils.formatEther(donations[1][i].toString()) : (Number(donations[1][i]) / 1e18).toString();
        parsedDonations.push({
          donator: donations[0][i],
          donation: ethAmount
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
      return data;
    } catch (error) {
      console.error("Refund failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- 10. WITHDRAW FUNDS ---
  const withdrawFunds = async (pId) => {
    try {
      setIsLoading(true);
      const data = await contract.call('withdrawFunds', [pId]);
      return data;
    } catch (error) {
      console.error("Withdrawal failed", error);
      throw error;
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
        adminStatus,
        setAdminStatus,
        recipientStatus,
        setRecipientStatus,
        activeRole,
        setActiveRole,
        isSignupModalOpen,
        setIsSignupModalOpen,
        signupInitialRole,
        setSignupInitialRole,
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