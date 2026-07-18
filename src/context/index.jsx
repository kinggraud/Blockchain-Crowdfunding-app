import React, { useContext, createContext, useState, useEffect } from 'react';
import { useAddress, useContract, useContractWrite, useConnect, useDisconnect, metamaskWallet } from '@thirdweb-dev/react'; // 🚀 Added useDisconnect
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract('0x785EAf8521aFE33171Fa1bFB7B71A28B3FafB08f');
  const { mutateAsync: createCampaignFn } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect(); // 🚀 Initialize the thirdweb disconnect engine
  
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
    if (!contract) return [];
    try {
      const campaigns = await contract.call('getCampaigns');

      const parsedCampaigns = campaigns.map((c, i) => ({
        owner: c.owner,
        title: c.title,
        description: c.description,
        target: ethers.utils.formatEther(c.target.toString()),
        deadline: c.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(c.amountCollected.toString()),
        image: c.image,
        pId: i
      }));

      return parsedCampaigns;
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
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
        setUserStatus, // 🚀 Share setter to clear registration states inside frontend layouts immediately
        disconnect,    // 🚀 Export thirdweb's disconnection hook handler to the app
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
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);