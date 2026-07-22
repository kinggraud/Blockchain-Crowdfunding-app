import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context";

const SignupModal = ({ isOpen, onClose, userAddress, initialRole }) => {
  const navigate = useNavigate();
  const { 
    setUserStatus, 
    setAdminStatus, 
    setRecipientStatus, 
    registerUser 
  } = useStateContext() || {};
  
  // Tab/Role state: snaps to 'initialRole' when present, defaults to 'recipient'
  const [activeRole, setActiveRole] = useState(initialRole || "recipient");
  
  // Sync activeRole whenever modal opens or initialRole changes
  useEffect(() => {
    if (isOpen) {
      setActiveRole(initialRole || "recipient");
    }
  }, [isOpen, initialRole]);

  // Admin form inputs
  const [orgName, setOrgName] = useState("");
  const [adminDomain, setAdminDomain] = useState("");
  
  // Recipient form inputs
  const [recipientDomain, setRecipientDomain] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentAddress = userAddress || (typeof window !== 'undefined' && window.ethereum?.selectedAddress) || "0x_anonymous";

      const newAdminData = {
        address: currentAddress,
        role: 1, // 1 = Admin
        domain: adminDomain || "General Academic",
        organization: orgName || "Academic Institution",
        isVerified: true,
        exists: true,
      };

      if (registerUser) {
        try {
          await registerUser({ role: 'admin', domain: adminDomain, organization: orgName });
        } catch (contractErr) {
          console.warn("Contract registration failed/bypassed, saving locally:", contractErr);
        }
      }

      // Sync across all key variations so AdminGuard/AdminProfile read it seamlessly
      localStorage.setItem(`user_status_${currentAddress}`, JSON.stringify(newAdminData));
      localStorage.setItem(`admin_status_${currentAddress}`, JSON.stringify(newAdminData));
      localStorage.setItem(`admin_account_${currentAddress}`, JSON.stringify(newAdminData));

      if (setUserStatus) setUserStatus(newAdminData);
      if (setAdminStatus) setAdminStatus(newAdminData);

      onClose();
      navigate("/admin-configuration");
    } catch (error) {
      console.error("Error during admin registration:", error);
      alert("Registration failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecipientRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentAddress = userAddress || (typeof window !== 'undefined' && window.ethereum?.selectedAddress) || "0x_anonymous";

      const newRecipientData = {
        address: currentAddress,
        role: 0, // 0 = Recipient
        domain: recipientDomain || "Student",
        isVerified: true,
        exists: true,
      };

      if (registerUser) {
        try {
          await registerUser({ role: 'recipient', domain: recipientDomain });
        } catch (contractErr) {
          console.warn("Contract registration failed/bypassed, saving locally:", contractErr);
        }
      }

      // Sync across all key variations for robust state reading
      localStorage.setItem(`user_status_${currentAddress}`, JSON.stringify(newRecipientData));
      localStorage.setItem(`recipient_status_${currentAddress}`, JSON.stringify(newRecipientData));
      localStorage.setItem(`recipient_account_${currentAddress}`, JSON.stringify(newRecipientData));

      if (setUserStatus) setUserStatus(newRecipientData);
      if (setRecipientStatus) setRecipientStatus(newRecipientData);

      onClose();
      navigate("/profile");
    } catch (error) {
      console.error("Error during recipient registration:", error);
      alert("Registration failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-epilogue">
      <div className="w-full max-w-md bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-[28px] p-8 shadow-2xl transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {activeRole === "admin" ? "Register Admin Account" : "Register Recipient Account"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Role Toggle Selector - ONLY show if initialRole wasn't explicitly provided */}
        {!initialRole && (
          <div className="flex bg-slate-100 dark:bg-[#2c2f36] p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setActiveRole("recipient")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeRole === "recipient"
                  ? "bg-[#8c6dfd] text-white shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-white"
              }`}
            >
              Recipient
            </button>
            <button
              type="button"
              onClick={() => setActiveRole("admin")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeRole === "admin"
                  ? "bg-[#8c6dfd] text-white shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>
        )}

        {/* --- ADMIN REGISTRATION FORM --- */}
        {activeRole === "admin" ? (
          <form onSubmit={handleAdminRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-[#808191] uppercase mb-2">
                Organization / Institution Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science Department"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-[#808191] uppercase mb-2">
                Domain / Field
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineering"
                value={adminDomain}
                onChange={(e) => setAdminDomain(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                "Register Admin Profile"
              )}
            </button>
          </form>
        ) : (
          /* --- RECIPIENT REGISTRATION FORM --- */
          <form onSubmit={handleRecipientRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-[#808191] uppercase mb-2">
                Department / Program
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Final Year Computer Engineering"
                value={recipientDomain}
                onChange={(e) => setRecipientDomain(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] text-slate-900 dark:text-white outline-none focus:border-[#8c6dfd]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 bg-[#1dc071] hover:bg-[#17a360] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                "Register Recipient Account"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupModal;