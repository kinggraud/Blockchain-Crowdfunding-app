import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '../context';

const AdminProfile = () => {
  const { address, userStatus } = useStateContext();
  
  // Toggle show/hide for the environment builder form modal area
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  
  // Environment State Configuration Variables
  const [envName, setEnvName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { id: Date.now(), label: '', type: 'text', required: true }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestionField = () => {
    setQuestions([...questions, { id: Date.now(), label: '', type: 'text', required: true }]);
  };

  const removeQuestionField = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, key, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [key]: value } : q)));
  };

const handleSaveEnvironment = async (e) => {
    e.preventDefault();
    if (!envName || questions.some(q => !q.label.trim())) {
      alert("Please fill out the environment name and all question labels.");
      return;
    }

    setIsSaving(true);
    const currentAddress = address || window.ethereum?.selectedAddress || "0x_anonymous";

    const newEnvironment = {
      id: `env_${Date.now()}`,
      adminAddress: currentAddress,
      title: envName,
      domain: userStatus?.domain || "General Academic",
      organization: userStatus?.organization || "Academic Institution",
      description,
      customQuestions: questions,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Fetch existing environments & append new one
      const existingEnvs = JSON.parse(localStorage.getItem("admin_environments") || "[]");
      const updatedEnvs = [...existingEnvs, newEnvironment];
      localStorage.setItem("admin_environments", JSON.stringify(updatedEnvs));

      // 2. Sync with Backend API
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/environments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEnvironment)
        });
      } catch (apiErr) {
        console.warn("Backend API unreachable, saved to local storage:", apiErr);
      }

      alert("Your custom dynamic verification environment has been saved successfully!");
      
      // Reset form & hide drawer
      setEnvName('');
      setDescription('');
      setQuestions([{ id: Date.now(), label: '', type: 'text', required: true }]);
      setShowFormBuilder(false);
    } catch (error) {
      console.error("Failed to save environment template configuration:", error);
      alert("Failed to save your custom form configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 max-w-[900px] mx-auto p-4 sm:p-8 font-epilogue transition-colors">
      
      {/* 👤 HEADER CARD SECTION: Admin Profile Information Summary */}
      <div className="w-full bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-3xl p-6 sm:p-8 shadow-xl transition-colors mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#8c6dfd] to-[#7a59e6] flex items-center justify-center text-4xl text-white shadow-md shadow-[#8c6dfd]/20 font-bold select-none">
          {userStatus?.organization ? userStatus.organization.substring(0, 2).toUpperCase() : "AD"}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {userStatus?.organization || "Administrator Hub"}
            </h1>
            <span className="w-max px-3 py-0.5 bg-red-500/10 text-red-500 text-[10px] uppercase font-bold tracking-wider rounded-full border border-red-500/20 self-center sm:self-auto">
              Verified Authority Protocol
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Domain: <span className="font-semibold text-slate-700 dark:text-slate-200">{userStatus?.domain || "General Academic"}</span>
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#13131a] border border-slate-100 dark:border-[#282830] rounded-xl text-xs text-slate-400 w-full sm:w-auto overflow-hidden">
            <span className="font-bold text-slate-500 dark:text-[#808191]">Wallet Address:</span>
            <span className="font-mono text-slate-600 dark:text-slate-300 truncate max-w-[200px] sm:max-w-none">{address}</span>
          </div>
        </div>
      </div>

      {/* 📊 METRICS ROW CONTAINER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-400 dark:text-[#808191] uppercase tracking-wider">Operational Status</p>
          <h3 className="text-xl font-bold text-[#1dc071] mt-1">Active</h3>
        </div>
        <div className="p-5 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-2xl shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-400 dark:text-[#808191] uppercase tracking-wider">Ecosystem Framework</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Multi-Tenant Hub</h3>
        </div>
        {/* ACTION PANEL BUTTON INTERFACE */}
        <button 
          onClick={() => setShowFormBuilder(!showFormBuilder)}
          className="p-5 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white rounded-2xl shadow-lg transition-all flex flex-col justify-center items-start group cursor-pointer"
        >
          <span className="text-xs font-bold opacity-80 uppercase tracking-wider text-left">Ecosystem Access Manager</span>
          <h3 className="text-base font-bold mt-1 text-left flex items-center gap-1.5">
            {showFormBuilder ? "Close Setup Grid ✖" : "Configure Custom Environment ⚙️"}
          </h3>
        </button>
      </div>

      {/* 🧊 CONDITIONAL ANIMATED DRAWER BUILDER HOOK CONTAINER */}
      <AnimatePresence>
        {showFormBuilder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="w-full p-6 sm:p-8 bg-white dark:bg-[#1c1c24] rounded-2xl border border-slate-200 dark:border-[#3a3a43] shadow-xl transition-colors mb-12">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configure Your Campaign Environment</h2>
                <p className="text-xs text-slate-400 mt-1">Design the custom questions and file fields recipients must fill out to launch under your admin control window.</p>
              </div>

              <form onSubmit={handleSaveEnvironment} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase tracking-wider">Environment Hub Name</label>
                    <input 
                      type="text"
                      placeholder="e.g., Computer Science Final Projects Pool"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-[#8c6dfd] transition-all"
                      value={envName}
                      onChange={(e) => setEnvName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase tracking-wider">Instructions / Description</label>
                    <textarea 
                      placeholder="Briefly explain what verification materials applicants must provide..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-[#8c6dfd] transition-all"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-white/5" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase tracking-wider">Verification Questions Builder</h3>
                    <button 
                      type="button"
                      onClick={addQuestionField}
                      className="text-xs font-bold text-[#8c6dfd] hover:underline px-3 py-1 bg-[#8c6dfd]/10 rounded-lg cursor-pointer"
                    >
                      + Add Question Field
                    </button>
                  </div>

                  {questions.map((q, idx) => (
                    <motion.div 
                      key={q.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col md:flex-row items-end gap-3 p-4 bg-slate-50 dark:bg-[#13131a] border border-slate-100 dark:border-[#282830] rounded-xl"
                    >
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] font-bold text-slate-400">Question #{idx + 1} Label</span>
                        <input 
                          type="text"
                          placeholder="e.g., Provide Academic Registration Number"
                          className="w-full px-3 py-2 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-lg text-slate-900 dark:text-white text-xs outline-none focus:border-[#8c6dfd] transition-all"
                          value={q.label}
                          onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 w-full md:w-40">
                        <span className="text-[10px] font-bold text-slate-400">Response Type</span>
                        <select
                          className="w-full px-3 py-2 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-lg text-slate-900 dark:text-white text-xs outline-none focus:border-[#8c6dfd] transition-all cursor-pointer"
                          value={q.type}
                          onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                        >
                          <option value="text">Short Text Box</option>
                          <option value="textarea">Long Text Paragraph</option>
                          <option value="file">File Upload / Document</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={questions.length === 1}
                        onClick={() => removeQuestionField(q.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg disabled:opacity-30 disabled:pointer-events-none mb-0.5 h-9 w-9 flex items-center justify-center text-xs cursor-pointer"
                      >
                        🗑️
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 shadow-md shadow-[#8c6dfd]/20 cursor-pointer"
                  >
                    {isSaving ? "Saving Configuration..." : "Publish Environment Form Settings"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProfile;