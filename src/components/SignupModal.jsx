import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence for transitions
import { useStateContext } from '../context';

const SignupModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("selection");
  const [profession, setProfession] = useState("");
  const [formData, setFormData] = useState({});
  const [recipientData, setRecipientData] = useState({ name: "", email: "" });
  const { registerUser, checkUserStatus } = useStateContext();
  const [isRegistering, setIsRegistering] = useState(false);

  const resetAndClose = () => {
    setStep("selection");
    setProfession("");
    setFormData({});
    setRecipientData({ name: "", email: "" });
    onClose();
  };

  const handleBack = () => {
    if (step === "admin-form") setStep("admin-domain");
    else if (step === "admin-domain" || step === "recipient-form") setStep("selection");
  };

  const handleRegistrationSubmit = async (role) => {
    setIsRegistering(true);
    try {
      const registrationData = {
        role: role,
        domain: role === "admin" ? profession : "recipient-domain"
      };
      await registerUser(registrationData);
      await checkUserStatus();
      resetAndClose();
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    if (!isOpen) resetAndClose();
  }, [isOpen]);

  if (!isOpen) return null;

  const domainQuestions = {
    education: { title: "Academic Verification", fields: ["University Name", "Department", "Staff ID"], icon: "🎓" },
    medical: { title: "Medical Credentials", fields: ["Hospital", "License Number", "Specialization"], icon: "🏥" },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 🌑 Dark Blur Overlay */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-md" 
        onClick={!isRegistering ? resetAndClose : undefined}
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-[#1c1c24] border border-[#3a3a43] p-8 rounded-[28px] w-full max-w-[420px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* ✨ Decorative Top Glow */}
        <div className={`absolute top-0 left-0 w-full h-[4px] ${step === 'recipient-form' ? 'bg-[#1dc071]' : 'bg-[#8c6dfd]'}`} />

        <AnimatePresence mode="wait">
          {/* STEP 1: SELECTION */}
          {step === "selection" && (
            <motion.div 
              key="selection"
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
              className="text-center"
            >
              <h2 className="text-white text-3xl font-bold mb-2 text-left">Get Started</h2>
              <p className="text-[#808191] text-left mb-8">Choose your identity on the protocol.</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setStep("admin-domain")}
                  className="group flex items-center justify-between bg-[#2c2f32]/50 hover:bg-[#8c6dfd] border border-[#3a3a43] p-5 rounded-2xl transition-all duration-300"
                >
                  <div className="text-left">
                    <span className="block text-white font-bold text-lg">Admin</span>
                    <span className="text-xs text-[#808191] group-hover:text-white/80 transition-colors">Vets academic projects</span>
                  </div>
                  <span className="text-2xl">🛡️</span>
                </button>

                <button 
                  onClick={() => setStep("recipient-form")}
                  className="group flex items-center justify-between bg-[#2c2f32]/50 hover:bg-[#1dc071] border border-[#3a3a43] p-5 rounded-2xl transition-all duration-300"
                >
                  <div className="text-left">
                    <span className="block text-white font-bold text-lg">Recipient</span>
                    <span className="text-xs text-[#808191] group-hover:text-white/80 transition-colors">Creates funding campaigns</span>
                  </div>
                  <span className="text-2xl">🤝</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DOMAIN PICKER */}
          {step === "admin-domain" && (
            <motion.div 
              key="admin-domain"
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
            >
              <button onClick={handleBack} className="text-[#808191] hover:text-white mb-6 text-sm flex items-center gap-2">← Back</button>
              <h2 className="text-white text-2xl font-bold mb-6">Verification Domain</h2>
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(domainQuestions).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setProfession(key); setStep("admin-form"); }}
                    className="flex items-center gap-4 bg-[#13131a] border border-[#3a3a43] hover:border-[#8c6dfd] text-white p-4 rounded-xl capitalize transition-all"
                  >
                    <span className="text-xl">{domainQuestions[key].icon}</span>
                    <span className="font-semibold">{key}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3 & 4: FORMS */}
          {(step === "admin-form" || step === "recipient-form") && (
            <motion.div 
              key="form"
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            >
              <button onClick={handleBack} className="text-[#808191] hover:text-white mb-6 text-sm flex items-center gap-2">← Back</button>
              <h2 className="text-white text-2xl font-bold mb-2">
                {step === "admin-form" ? domainQuestions[profession].title : "Personal Details"}
              </h2>
              <p className="text-[#808191] text-sm mb-6">This information is used for on-chain verification.</p>
              
              <div className="flex flex-col gap-4">
                {(step === "admin-form" ? domainQuestions[profession].fields : ["Full Name", "Email Address"]).map((field) => (
                  <div key={field} className="relative">
                    <input 
                      placeholder={field}
                      className="w-full bg-[#13131a] text-white p-4 rounded-xl border border-[#3a3a43] outline-none focus:border-[#8c6dfd] transition-all placeholder:text-[#4b5264]"
                      onChange={(e) => step === "admin-form" 
                        ? setFormData({...formData, [field]: e.target.value})
                        : setRecipientData({...recipientData, [field.includes("Name") ? "name" : "email"]: e.target.value})
                      }
                    />
                  </div>
                ))}
                
                <button 
                  disabled={isRegistering}
                  onClick={() => handleRegistrationSubmit(step === "admin-form" ? "admin" : "recipient")}
                  className={`w-full py-4 rounded-xl font-bold mt-4 transition-all flex justify-center items-center gap-3 ${
                    step === "admin-form" ? "bg-[#8c6dfd] shadow-[0_10px_20px_rgba(140,109,253,0.2)]" : "bg-[#1dc071] shadow-[0_10px_20px_rgba(29,192,113,0.2)]"
                  } text-white disabled:opacity-50`}
                >
                  {isRegistering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : "Register Account"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel link */}
        {!isRegistering && (
          <button onClick={resetAndClose} className="mt-8 w-full text-[#4b5264] hover:text-white text-xs tracking-widest uppercase transition">
            Dismiss
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default SignupModal;