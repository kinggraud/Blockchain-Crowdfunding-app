import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';
import SignupModal from './SignupModal'; // Adjust import path if needed

const AdminGuard = ({ children }) => {
  const navigate = useNavigate();
  const context = useStateContext();

  const address = context?.address;
  const userStatus = context?.userStatus;
  const adminStatus = context?.adminStatus;
  const isLoadingUserStatus = context?.isLoadingUserStatus ?? false;

  const [isModalOpen, setIsModalOpen] = useState(true);

  // 1. Loading state spinner while fetching wallet or on-chain status
  if (isLoadingUserStatus) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8c6dfd] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#808191] font-epilogue">Verifying Admin Permissions...</p>
        </div>
      </div>
    );
  }

  // 2. No wallet connected -> Return to home
  if (!address) {
    navigate('/home');
    return null;
  }

  // 3. Retrieve local storage admin record (Fallback for client-side registration)
  const storedAdmin = localStorage.getItem(`admin_account_${address}`);
  const localAdminRecord = storedAdmin ? JSON.parse(storedAdmin) : null;

  // 4. Multi-level admin validation check
  const isAdmin = 
    userStatus === 'admin' || 
    adminStatus?.isAdmin === true || 
    adminStatus?.role === 1 || 
    adminStatus?.role === '1' ||
    localAdminRecord?.role === 1 || 
    localAdminRecord?.isAdmin === true;

  // Render protected content if any admin criteria is met
  if (isAdmin) {
    return children;
  }

  // 5. Connected but NOT Admin -> Force open SignupModal immediately
  return (
    <div className="min-h-screen bg-[#13131a] flex flex-col items-center justify-center p-4 font-epilogue">
      <div className="text-center space-y-4 max-w-[400px]">
        <div className="w-16 h-16 bg-[#8c6dfd]/10 text-[#8c6dfd] rounded-full flex items-center justify-center text-3xl mx-auto border border-[#8c6dfd]/20">
          🛡️
        </div>
        <h2 className="text-white text-2xl font-bold">Admin Verification Required</h2>
        <p className="text-[#808191] text-sm">
          You need an active administrator registration to access this panel.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3.5 bg-[#8c6dfd] hover:bg-[#7a5be0] text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer w-full"
        >
          Complete Admin Setup
        </button>
      </div>

      <SignupModal
        isOpen={isModalOpen}
        defaultStep="admin-domain"
        onClose={() => {
          setIsModalOpen(false);
          // Re-check local storage or context before redirecting to prevent unexpected kick-outs
          const updatedLocal = localStorage.getItem(`admin_account_${address}`);
          if (userStatus !== 'admin' && !updatedLocal) {
            navigate('/home');
          }
        }}
      />
    </div>
  );
};

export default AdminGuard;