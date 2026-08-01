// 📍 Components/ApprovalModal.jsx
import React, { useEffect, useState } from 'react';
import { useStateContext } from '../context';

const ApprovalModal = () => {
  const { address, createCampaign } = useStateContext();
  const [approvedSubmission, setApprovedSubmission] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (!address) return;

    // Check periodically for approved campaigns owned by this user
    const checkApproval = () => {
      const allSubmissions = JSON.parse(localStorage.getItem('pending_campaign_submissions') || '[]');
      const match = allSubmissions.find(
        (sub) => sub.recipientAddress === address.toLowerCase() && sub.status === 'approved'
      );
      setApprovedSubmission(match || null);
    };

    checkApproval();
    const interval = setInterval(checkApproval, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [address]);

  const handlePublishToBlockchain = async () => {
    if (!approvedSubmission) return;

    try {
      setIsDeploying(true);
      const { formValues } = approvedSubmission;

      // 🦊 Open MetaMask & Call Web3 Contract Execution
      await createCampaign({
        ...formValues,
        target: formValues.target, // Ensure format matches contract expectations
      });

      // Update queue status so popup closes and doesn't re-trigger
      const allSubmissions = JSON.parse(localStorage.getItem('pending_campaign_submissions') || '[]');
      const updatedQueue = allSubmissions.map((sub) => 
        sub.id === approvedSubmission.id ? { ...sub, status: 'deployed' } : sub
      );
      localStorage.setItem('pending_campaign_submissions', JSON.stringify(updatedQueue));

      alert("🎉 Campaign successfully deployed on-chain!");
      setApprovedSubmission(null);
    } catch (error) {
      console.error("MetaMask deployment error:", error);
      alert("Transaction cancelled or failed.");
    } finally {
      setIsDeploying(false);
    }
  };

  if (!approvedSubmission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-epilogue">
      <div className="bg-[#1c1c24] border border-[#3a3a43] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-[#1dc071]/10 text-[#1dc071] border border-[#1dc071]/20 text-3xl flex items-center justify-center rounded-2xl mx-auto mb-4 animate-bounce">
          🎉
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Campaign Approved!</h3>
        <p className="text-sm text-gray-400 mb-6">
          The Admin has verified and approved <span className="text-white font-semibold">"{approvedSubmission.formValues.title}"</span>. You can now launch it on the blockchain.
        </p>

        <button
          onClick={handlePublishToBlockchain}
          disabled={isDeploying}
          className="w-full py-3.5 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          {isDeploying ? (
            <>⏳ Opening MetaMask...</>
          ) : (
            <>🚀 Continue & Publish to Blockchain</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ApprovalModal;