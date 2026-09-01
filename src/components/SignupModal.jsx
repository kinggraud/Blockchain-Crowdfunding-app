import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';

const SignupModal = ({ isOpen, onClose, initialRole = 'recipient' }) => {
  const navigate = useNavigate();
  const context = useStateContext() || {};
  const { address, connect } = context;

  // Selected Role Tab: 'recipient' or 'admin'
  const [activeRole, setActiveRole] = useState(initialRole);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync role tab when initialRole prop changes
  useEffect(() => {
    if (initialRole) {
      setActiveRole(initialRole);
    }
  }, [initialRole]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address) return;

    setIsSubmitting(true);

    try {
      const normalizedAddr = address.toLowerCase();
      const isAdminRole = activeRole === 'admin';

      // 1. Prepare profile payload based on selected role
      const profileData = {
        address: normalizedAddr,
        fullName,
        email,
        organization: organization || 'Academic Institution',
        studentId: studentId || null,
        role: isAdminRole ? 1 : 0, // 1 = Admin, 0 = Recipient Profile
        isAdmin: isAdminRole,
        registeredAt: new Date().toISOString(),
      };

      // 2. Persist record locally using wallet address key
      if (isAdminRole) {
        localStorage.setItem(`admin_account_${normalizedAddr}`, JSON.stringify(profileData));
        localStorage.setItem(`admin_status_${normalizedAddr}`, JSON.stringify(profileData));
      } else {
        localStorage.setItem(`user_account_${normalizedAddr}`, JSON.stringify(profileData));
        localStorage.setItem(`recipient_status_${normalizedAddr}`, JSON.stringify(profileData));
      }

      setIsSubmitting(false);
      onClose();

      // 3. Route user to their designated workspace/profile component
      if (isAdminRole) {
        navigate('/admin-configuration');
      } else {
        navigate('/profile');
      }

      window.location.reload();
    } catch (err) {
      console.error("Failed to store user profile:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-epilogue">
      <div className="bg-[#1c1c24] border border-[#3a3a43] text-white rounded-2xl w-full max-w-[480px] p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#808191] hover:text-white text-xl transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-[#8c6dfd]/10 text-[#8c6dfd] rounded-full flex items-center justify-center text-2xl mx-auto mb-3 border border-[#8c6dfd]/20">
            {activeRole === 'admin' ? '🛡️' : '🎓'}
          </div>
          <h3 className="text-xl font-bold text-white">
            {activeRole === 'admin' ? 'Register Admin Account' : 'Register Recipient Account'}
          </h3>
          <p className="text-xs text-[#808191] mt-1">
            Link your connected Web3 wallet to your platform profile.
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex bg-[#13131a] p-1 rounded-xl mb-6 border border-[#3a3a43]">
          <button
            type="button"
            onClick={() => setActiveRole('recipient')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeRole === 'recipient'
                ? 'bg-[#8c6dfd] text-white shadow'
                : 'text-[#808191] hover:text-white'
            }`}
          >
            Recipient (Profile)
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('admin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-[#8c6dfd] text-white shadow'
                : 'text-[#808191] hover:text-white'
            }`}
          >
            Administrator
          </button>
        </div>

        {/* Step 1: Connect Wallet (If disconnected) */}
        {!address ? (
          <div className="space-y-4 text-center py-4">
            <p className="text-sm text-[#808191]">
              Please connect your Web3 wallet first to complete setup.
            </p>
            <button
              onClick={connect}
              className="w-full py-3.5 bg-[#8c6dfd] hover:bg-[#7a5be0] text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          /* Step 2: Account Registration Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#808191] uppercase font-semibold mb-1">
                Connected Wallet
              </label>
              <input
                type="text"
                disabled
                value={address}
                className="w-full bg-[#13131a] border border-[#3a3a43] rounded-xl px-4 py-2 text-xs text-[#808191] font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs text-[#808191] uppercase font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Johnson"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#13131a] border border-[#3a3a43] focus:border-[#8c6dfd] text-white rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-[#808191] uppercase font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="user@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#13131a] border border-[#3a3a43] focus:border-[#8c6dfd] text-white rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            {activeRole === 'recipient' ? (
              <div>
                <label className="block text-xs text-[#808191] uppercase font-semibold mb-1">
                  Matric / Student ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. EEE/2021/1042"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-[#13131a] border border-[#3a3a43] focus:border-[#8c6dfd] text-white rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-[#808191] uppercase font-semibold mb-1">
                  Department / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Platform Operations"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-[#13131a] border border-[#3a3a43] focus:border-[#8c6dfd] text-white rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 bg-[#8c6dfd] hover:bg-[#7a5be0] text-white font-bold rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                `Complete Setup & Go to ${activeRole === 'admin' ? 'Admin Portal' : 'Profile'}`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupModal;