import React, { useContext, createContext, useState, useEffect, useCallback } from 'react';
import { useAddress, useContract, useContractWrite, useConnect, useDisconnect, metamaskWallet } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  // 📜 SMART CONTRACT INSTANTIATIONS
  // Main Crowdfunding Contract
  const { contract } = useContract('0x785EAf8521aFE33171Fa1bFB7B71A28B3FafB08f');
  const { mutateAsync: createCampaignFn } = useContractWrite(contract, 'createCampaign');

  // 💰 LIVE CURRENCY PRICING STATE
  const [ethPrice, setEthPrice] = useState({ usd: 3000, ngn: 4500000 });

  // 👛 WALLET & CONNECTIONS
  const address = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect();

  // 🔍 GLOBAL UI & MODAL STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [signupInitialRole, setSignupInitialRole] = useState(null); // 'admin' | 'recipient' | null

  // 👤 ROLE-BASED ACCOUNT PROFILES
  const [adminStatus, setAdminStatus] = useState(null);
  const [recipientStatus, setRecipientStatus] = useState(null);
  const [activeRole, setActiveRole] = useState('recipient'); // 'admin' | 'recipient'

  // BACKWARD-COMPATIBLE FALLBACK STATUS POINTER
  const [userStatus, setUserStatus] = useState(() => {
    const currentAddress = address || (typeof window !== 'undefined' && window.ethereum?.selectedAddress);
    if (!currentAddress) return { exists: false, role: 0, domain: "", isVerified: false };
    
    const normalizedAddr = currentAddress.toLowerCase();
    const savedRecipient = localStorage.getItem(`recipient_account_${normalizedAddr}`) || localStorage.getItem(`recipient_status_${normalizedAddr}`);
    const savedAdmin = localStorage.getItem(`admin_account_${normalizedAddr}`) || localStorage.getItem(`admin_status_${normalizedAddr}`) || localStorage.getItem(`admin_user_${normalizedAddr}`);
    const savedGeneral = localStorage.getItem(`user_status_${normalizedAddr}`);
    
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

  // --- 2. CHECK USER STATUS (LOCALSTORAGE -> ON-CHAIN CONTRACT) ---
  const checkUserStatus = useCallback(async () => {
    const currentAddress = address || (typeof window !== 'undefined' && window.ethereum?.selectedAddress);
    if (!currentAddress) {
      setAdminStatus(null);
      setRecipientStatus(null);
      setUserStatus({ exists: false, role: 0, domain: "", isVerified: false });
      return;
    }

    const normalizedAddr = currentAddress.toLowerCase();

    // STEP A: Fetch from LocalStorage (supporting multiple historical key conventions)
    const savedAdmin = localStorage.getItem(`admin_account_${normalizedAddr}`) || 
                       localStorage.getItem(`admin_status_${normalizedAddr}`) || 
                       localStorage.getItem(`admin_user_${normalizedAddr}`);
                       
    const savedRecipient = localStorage.getItem(`recipient_account_${normalizedAddr}`) || 
                           localStorage.getItem(`recipient_status_${normalizedAddr}`);
                           
    const savedGeneral = localStorage.getItem(`user_status_${normalizedAddr}`);

    const parsedAdmin = savedAdmin ? JSON.parse(savedAdmin) : null;
    const parsedRecipient = savedRecipient ? JSON.parse(savedRecipient) : (savedGeneral ? JSON.parse(savedGeneral) : null);

    if (parsedAdmin) setAdminStatus(parsedAdmin);
    if (parsedRecipient) setRecipientStatus(parsedRecipient);

    if (parsedRecipient) {
      setUserStatus(parsedRecipient);
    } else if (parsedAdmin) {
      setUserStatus(parsedAdmin);
    }

    // STEP B: Fallback to Smart Contract read if missing locally
    if (contract && !parsedAdmin && !parsedRecipient) {
      try {
        const data = await contract.call('users', [currentAddress]);
        if (data && (data.exists || data.isRegistered)) {
          const status = {
            address: normalizedAddr,
            role: Number(data.role),
            domain: data.domain || "general",
            isVerified: data.isVerified ?? true,
            exists: true
          };

          if (Number(data.role) === 1) {
            setAdminStatus(status);
            localStorage.setItem(`admin_status_${normalizedAddr}`, JSON.stringify(status));
            localStorage.setItem(`admin_user_${normalizedAddr}`, JSON.stringify(status));
          } else {
            setRecipientStatus(status);
            localStorage.setItem(`recipient_status_${normalizedAddr}`, JSON.stringify(status));
          }
          setUserStatus(status);
        }
      } catch (error) {
        console.error("Failed to fetch user status from contract:", error);
      }
    }
  }, [address, contract]);

  useEffect(() => {
    if (address) {
      checkUserStatus();
    } else {
      setAdminStatus(null);
      setRecipientStatus(null);
      setUserStatus({ exists: false, role: 0, domain: "", isVerified: false });
    }
  }, [address, checkUserStatus]);

  // --- FETCH LIVE ETH EXCHANGE RATES ---
useEffect(() => {
  let isMounted = true;

  const fetchLiveRates = async () => {
    try {
      // 1. Primary Attempt: CoinGecko Free API
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,ngn',
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (isMounted && data?.ethereum) {
          setEthPrice({
            usd: data.ethereum.usd || 3000,
            ngn: data.ethereum.ngn || 4500000,
          });
          return;
        }
      }

      // 2. Fallback Attempt: CryptoCompare API (if CoinGecko rates fail or rate-limits)
      const ccResponse = await fetch(
        'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,NGN'
      );

      if (ccResponse.ok) {
        const ccData = await ccResponse.json();
        if (isMounted && ccData?.USD) {
          setEthPrice({
            usd: ccData.USD || 3000,
            ngn: ccData.NGN || 4500000,
          });
        }
      }
    } catch (error) {
      // Gracefully log warning without throwing unhandled promise rejections
      console.warn("Live currency rates unreachable (CORS/Network/AdBlocker). Retaining default state values.");
    }
  };

  fetchLiveRates();

  return () => {
    isMounted = false;
  };
}, []);

  // --- 3. REGISTER USER (PURE WEB3 & LOCAL STORAGE) ---
  const registerUser = async (form) => {
    try {
      setIsLoading(true);
      const isFormAdmin = form.role === 'admin' || form.role === 1;
      const roleNumber = isFormAdmin ? 1 : 0;
      const domain = form.domain ? form.domain.trim() : "general";
      const normalizedAddr = address ? address.toLowerCase() : "";

      if (!normalizedAddr) {
        throw new Error("No connected wallet address found.");
      }

      // 1. Smart Contract Registration Attempt
      if (contract) {
        let isAlreadyRegistered = false;
        try {
          const existingUser = await contract.call('users', [address]);
          if (existingUser && (existingUser.exists || existingUser.isRegistered)) {
            isAlreadyRegistered = true;
          }
        } catch (readErr) {
          console.warn("Could not read on-chain status, attempting registration write:", readErr);
        }

        if (!isAlreadyRegistered) {
          try {
            const tx = await contract.call('registerUser', [roleNumber, domain]);
            console.log("On-chain registration successful:", tx);
          } catch (writeErr) {
            console.warn("On-chain write bypassed or failed:", writeErr);
          }
        }
      }

      // 2. Local State Object
      const newUserData = {
        address: normalizedAddr,
        walletAddress: normalizedAddr,
        role: roleNumber,
        isAdmin: isFormAdmin,
        domain,
        organization: form.organization || form.name || "Academic Institution",
        isVerified: true,
        exists: true,
        registeredAt: new Date().toISOString()
      };

      // 3. Save to Local Storage by normalized address
      if (isFormAdmin) {
        localStorage.setItem(`admin_status_${normalizedAddr}`, JSON.stringify(newUserData));
        localStorage.setItem(`admin_account_${normalizedAddr}`, JSON.stringify(newUserData));
        localStorage.setItem(`admin_user_${normalizedAddr}`, JSON.stringify(newUserData));
        sessionStorage.setItem(`admin_session_${normalizedAddr}`, 'true');
        setAdminStatus(newUserData);
        setActiveRole('admin');
      } else {
        localStorage.setItem(`recipient_status_${normalizedAddr}`, JSON.stringify(newUserData));
        localStorage.setItem(`recipient_account_${normalizedAddr}`, JSON.stringify(newUserData));
        sessionStorage.setItem(`recipient_session_${normalizedAddr}`, 'true');
        setRecipientStatus(newUserData);
        setActiveRole('recipient');
      }

      localStorage.setItem(`user_status_${normalizedAddr}`, JSON.stringify(newUserData));
      setUserStatus(newUserData);

      return newUserData;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. CREATE CAMPAIGN ---
  const createCampaign = async (form) => {
    if (!address) return alert("Please connect your wallet first!");

    try {
      setIsLoading(true);

      // Convert Date string/timestamp to EVM seconds format
      let parsedDeadline = typeof form.deadline === 'number' ? form.deadline : new Date(form.deadline).getTime();
      if (parsedDeadline > 1e11) {
        parsedDeadline = Math.floor(parsedDeadline / 1000);
      }

      // Convert target to Wei if it is passed in standard ETH string/number
      const targetInWei = (typeof form.target === 'string' && form.target.length > 10) 
        ? form.target 
        : (ethers.utils ? ethers.utils.parseEther(form.target.toString()) : ethers.parseEther(form.target.toString()));

      const args = [
        address,
        form.title,
        form.description,
        targetInWei,
        parsedDeadline,
        form.image
      ];

      let tx;
      if (createCampaignFn) {
        tx = await createCampaignFn({ args });
      } else if (contract) {
        tx = await contract.call('createCampaign', args);
      } else {
        throw new Error("Smart contract connection unavailable.");
      }

      console.log("Campaign creation tx success:", tx);
      return tx;
    } catch (error) {
      console.error("Failed to create campaign:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. FETCH ALL CAMPAIGNS ---
  const getCampaigns = async () => {
    try {
      if (!contract) return [];

      const campaigns = await contract.call("getCampaigns");
      if (!campaigns || campaigns.length === 0) return [];

      return campaigns.map((c, i) => {
        const ethTarget = ethers.utils 
          ? ethers.utils.formatEther(c.target.toString()) 
          : (Number(c.target) / 1e18).toString();

        const ethAmountCollected = ethers.utils 
          ? ethers.utils.formatEther(c.amountCollected.toString()) 
          : (Number(c.amountCollected) / 1e18).toString();

        const selectedCurrency = c.currency ? c.currency.toString().toUpperCase().trim() : 'USD';
        
        let deadlineVal = c.deadline?.toString ? Number(c.deadline.toString()) : Number(c.deadline);
        if (deadlineVal < 1e11) {
          deadlineVal = deadlineVal * 1000;
        }

        return {
          owner: c.owner,
          title: c.title,
          description: c.description,
          target: parseFloat(ethTarget),
          amountCollected: parseFloat(ethAmountCollected),
          currency: selectedCurrency,
          deadline: deadlineVal,
          image: c.image,
          claimed: c.claimed,
          pId: i,
          rawEthTarget: ethTarget,
          rawEthCollected: ethAmountCollected
        };
      });
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      return [];
    }
  };

  // --- 6. FETCH USER SPECIFIC CAMPAIGNS ---
  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();
    if (!address) return [];
    return allCampaigns.filter((campaign) => campaign.owner?.toLowerCase() === address.toLowerCase());
  };

  // --- 7. DONATE TO CAMPAIGN ---
  const donate = async (pId, amount) => {
    try {
      setIsLoading(true);
      const weiValue = ethers.utils 
        ? ethers.utils.parseEther(amount.toString()) 
        : ethers.parseEther(amount.toString());

      const data = await contract.call('donateToCampaign', [pId], { 
        value: weiValue 
      });

      return data;
    } catch (error) {
      console.error("Donation failed:", error);

      const errorMsg = error?.message || error?.toString() || '';
      if (
        errorMsg.includes("Missing recovery share") || 
        errorMsg.includes("recovery share") ||
        errorMsg.includes("Key share")
      ) {
        alert("Session sync lost. Clearing local session cache.");
        
        Object.keys(localStorage).forEach((key) => {
          if (
            key.includes("thirdweb") || 
            key.includes("paper") || 
            key.includes("embedded_wallet") ||
            key.includes("tw_")
          ) {
            localStorage.removeItem(key);
          }
        });

        window.location.reload();
      }

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

      for (let i = 0; i < numberOfDonations; i++) {
        const ethAmount = ethers.utils 
          ? ethers.utils.formatEther(donations[1][i].toString()) 
          : (Number(donations[1][i]) / 1e18).toString();

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
      return await contract.call('claimRefund', [pId]);
    } catch (error) {
      console.error("Refund failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- 10. WITHDRAW FUNDS ---
  const withdrawFunds = async (pId) => {
    try {
      setIsLoading(true);
      return await contract.call('withdrawFunds', [pId]);
    } catch (error) {
      console.error("Withdrawal failed:", error);
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
        ethPrice, 
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);