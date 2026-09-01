import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';


const AdminGuard = ({ children }) => {
  const navigate = useNavigate();
  const context = useStateContext();

  const address = context?.address;
  const userStatus = context?.userStatus;
  const adminStatus = context?.adminStatus;
  const isLoadingUserStatus = context?.isLoadingUserStatus ?? false;

  const [isModalOpen, setIsModalOpen] = useState(true);

  // Safely handle navigation side-effects
  useEffect(() => {
    if (!isLoadingUserStatus && !address) {
      navigate('/home');
    }
  }, [address, isLoadingUserStatus, navigate]);

  // 1. Loading spinner while checking wallet & on-chain state
  if (isLoadingUserStatus) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3 font-epilogue">
          <div className="w-10 h-10 border-4 border-[#8c6dfd] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#808191]">Verifying Admin Permissions...</p>
        </div>
      </div>
    );
  }

  // 2. Return null if no address while useEffect completes redirect
  if (!address) return null;

  // 3. Lowercase normalization for local storage lookups
  const normalizedAddr = address.toLowerCase();
  const storedAdmin = 
    localStorage.getItem(`admin_account_${normalizedAddr}`) || 
    localStorage.getItem(`admin_status_${normalizedAddr}`);
  const localAdminRecord = storedAdmin ? JSON.parse(storedAdmin) : null;

  // 4. Robust Admin Evaluation Check
  const isAdmin = 
    // Check object fields from index.jsx state context
    userStatus?.role === 1 ||
    userStatus?.role === '1' ||
    userStatus?.isAdmin === true ||
    userStatus?.role === 'admin' ||
    userStatus === 'admin' ||
    
    // Check adminStatus state
    adminStatus?.isAdmin === true || 
    adminStatus?.role === 1 || 
    adminStatus?.role === '1' ||

    // Check LocalStorage fallbacks
    localAdminRecord?.role === 1 || 
    localAdminRecord?.role === '1' ||
    localAdminRecord?.isAdmin === true;

  // If validation passes, render protected child route
  if (isAdmin) {
    return children;
  }

  // 5. Fallback UI when connected wallet is NOT an admin
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
          const updatedLocal = localStorage.getItem(`admin_account_${normalizedAddr}`);
          if (!updatedLocal && userStatus?.role !== 1) {
            navigate('/home');
          }
        }}
      />
    </div>
  );
};

export default AdminGuard;