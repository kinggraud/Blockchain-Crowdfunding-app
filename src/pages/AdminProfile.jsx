import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { address, adminStatus, userStatus, setAdminStatus, createCampaign } = useStateContext();
  
  // Dynamic lookup for active admin info
  const currentAdmin = adminStatus || userStatus;

  // Interceptor State
  const [isRegisteredAdmin, setIsRegisteredAdmin] = useState(false);
  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);

  // Form states for Admin Registration
  const [regName, setRegName] = useState('');
  const [regDomain, setRegDomain] = useState('');

  // Toggle show/hide for the environment builder form modal area
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  
  // Storage States
  const [environments, setEnvironments] = useState([]);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);

  // Environment Configuration Variables
  const [envName, setEnvName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { id: Date.now(), label: '', type: 'text', required: true }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [deployingId, setDeployingId] = useState(null);

  // Load environments & submissions on mount
  useEffect(() => {
    if (!address) {
      setIsRegisteredAdmin(false);
      setIsAuthenticatedAdmin(false);
      return;
    }

    const storedAdmin = localStorage.getItem(`admin_account_${address}`);
    const isSessionAuth = sessionStorage.getItem(`admin_session_${address}`);

    if (storedAdmin || (currentAdmin && (currentAdmin.role === 1 || currentAdmin.role === '1' || currentAdmin.isAdmin))) {
      setIsRegisteredAdmin(true);
      if (isSessionAuth === 'true') {
        setIsAuthenticatedAdmin(true);
      }
    } else {
      setIsRegisteredAdmin(false);
      setIsAuthenticatedAdmin(false);
    }

    loadEnvironmentsAndSubmissions();
  }, [address, currentAdmin]);

  const loadEnvironmentsAndSubmissions = () => {
    const existingEnvs = JSON.parse(localStorage.getItem("admin_environments") || "[]");
    const filteredEnvs = address 
      ? existingEnvs.filter(env => env.adminAddress?.toLowerCase() === address?.toLowerCase())
      : existingEnvs;
    setEnvironments(filteredEnvs);

    // Load Pending Submissions for this admin's environments
    const allSubmissions = JSON.parse(localStorage.getItem("pending_campaign_submissions") || "[]");
    const adminEnvIds = filteredEnvs.map(e => e.id);
    const relevantSubmissions = allSubmissions.filter(sub => adminEnvIds.includes(sub.environmentId));
    setPendingCampaigns(relevantSubmissions);
  };

  // Handler: Register New Admin
  const handleAdminRegistration = (e) => {
    e.preventDefault();
    if (!regName.trim() || !regDomain.trim()) {
      alert("Please enter both Organization Name and Domain.");
      return;
    }

    const adminRecord = {
      role: 1,
      organization: regName,
      domain: regDomain,
      address: address,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem(`admin_account_${address}`, JSON.stringify(adminRecord));
    sessionStorage.setItem(`admin_session_${address}`, 'true');

    if (setAdminStatus) setAdminStatus(adminRecord);

    setIsRegisteredAdmin(true);
    setIsAuthenticatedAdmin(true);
  };

  // Handler: Login Existing Admin
  const handleAdminSignIn = (e) => {
    e.preventDefault();
    sessionStorage.setItem(`admin_session_${address}`, 'true');
    setIsAuthenticatedAdmin(true);
  };

  // Question Field Management Handlers
  const addQuestionField = () => {
    setQuestions([...questions, { id: Date.now(), label: '', type: 'text', required: true }]);
  };

  const removeQuestionField = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, key, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [key]: value } : q)));
  };

  // Save Custom Environment Template
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
      domain: currentAdmin?.domain || "General Academic",
      organization: currentAdmin?.organization || "Academic Institution",
      description,
      customQuestions: questions,
      createdAt: new Date().toISOString()
    };

    try {
      const existingEnvs = JSON.parse(localStorage.getItem("admin_environments") || "[]");
      const updatedEnvs = [...existingEnvs, newEnvironment];
      localStorage.setItem("admin_environments", JSON.stringify(updatedEnvs));

      loadEnvironmentsAndSubmissions();

      alert("Environment template created! Users can now submit campaigns to this environment for your review.");
      
      setEnvName('');
      setDescription('');
      setQuestions([{ id: Date.now(), label: '', type: 'text', required: true }]);
      setShowFormBuilder(false);
    } catch (error) {
      console.error("Failed to save environment template:", error);
      alert("Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🚀 ADMIN APPROVAL HANDLER: Deploy Campaign directly to Smart Contract
  const handleApproveAndDeploy = async (submission) => {
    if (!createCampaign) {
      alert("Contract context error. Ensure wallet is connected.");
      return;
    }

    setDeployingId(submission.submissionId);

    try {
      // Execute Blockchain Transaction
      await createCampaign({
        ...submission.formData,
        target: submission.formData.targetWei, // Uses exact Wei target string
        deadline: submission.formData.deadlineUnix
      });

      // Remove from pending list on success
      const allSubmissions = JSON.parse(localStorage.getItem("pending_campaign_submissions") || "[]");
      const updatedSubmissions = allSubmissions.filter(s => s.submissionId !== submission.submissionId);
      localStorage.setItem("pending_campaign_submissions", JSON.stringify(updatedSubmissions));

      alert("🎉 Campaign Approved & Successfully Deployed to Blockchain!");
      loadEnvironmentsAndSubmissions();
    } catch (error) {
      console.error("Failed to deploy campaign on-chain:", error);
      alert(`Approval Failed: ${error.reason || error.message || "Execution reverted"}`);
    } finally {
      setDeployingId(null);
    }
  };

  const handleRejectSubmission = (submissionId) => {
    if (!window.confirm("Are you sure you want to reject and remove this submission?")) return;
    const allSubmissions = JSON.parse(localStorage.getItem("pending_campaign_submissions") || "[]");
    const updated = allSubmissions.filter(s => s.submissionId !== submissionId);
    localStorage.setItem("pending_campaign_submissions", JSON.stringify(updated));
    loadEnvironmentsAndSubmissions();
  };

  // GUARDS
  if (!address) {
    return (
      <div className="flex-1 max-w-[600px] mx-auto my-12 p-8 font-epilogue text-center bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-3xl shadow-xl">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/20">🛡️</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Portal Restricted</h2>
        <p className="text-sm text-slate-500 dark:text-[#808191]">Please connect your administrator wallet address to proceed.</p>
      </div>
    );
  }

  if (!isRegisteredAdmin) {
    return (
      <div className="flex-1 max-w-[500px] mx-auto my-12 p-8 font-epilogue bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-3xl shadow-2xl">
        <div className="w-12 h-12 bg-[#8c6dfd]/10 text-[#8c6dfd] rounded-2xl flex items-center justify-center text-2xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Register as Administrator</h2>
        <p className="text-xs text-slate-500 dark:text-[#808191] mb-6">
          Your wallet (<span className="font-mono text-slate-700 dark:text-slate-300">{address.slice(0, 6)}...{address.slice(-4)}</span>) is not registered.
        </p>

        <form onSubmit={handleAdminRegistration} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase">Institution / Organization Name *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Department of Computer Engineering"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-[#8c6dfd]"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase">Academic Domain *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Engineering & Technology"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-[#8c6dfd]"
              value={regDomain}
              onChange={(e) => setRegDomain(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-[#8c6dfd]/20 cursor-pointer mt-2"
          >
            Create Admin Account
          </button>
        </form>
      </div>
    );
  }

  if (!isAuthenticatedAdmin) {
    return (
      <div className="flex-1 max-w-[450px] mx-auto my-12 p-8 font-epilogue text-center bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-3xl shadow-2xl">
        <div className="w-14 h-14 bg-[#1dc071]/10 text-[#1dc071] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-[#1dc071]/20">🔑</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Session Expired</h2>
        <p className="text-xs text-slate-500 dark:text-[#808191] mb-6">Authenticate to enter your administrator workspace.</p>
        <form onSubmit={handleAdminSignIn} className="space-y-4 text-left">
          <div className="p-3 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
            Wallet: {address}
          </div>
          <button type="submit" className="w-full py-3.5 bg-[#1dc071] hover:bg-[#17a360] text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer">
            Sign In to Admin Hub
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-[950px] mx-auto p-4 sm:p-8 font-epilogue transition-colors">
      
      {/* HEADER CARD */}
      <div className="w-full bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#8c6dfd] to-[#7a59e6] flex items-center justify-center text-4xl text-white font-bold">
          {currentAdmin?.organization ? currentAdmin.organization.substring(0, 2).toUpperCase() : "AD"}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentAdmin?.organization || "Administrator Hub"}</h1>
            <span className="w-max px-3 py-0.5 bg-red-500/10 text-red-500 text-[10px] uppercase font-bold tracking-wider rounded-full border border-red-500/20 self-center sm:self-auto">
              Verified Authority Protocol
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Domain: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentAdmin?.domain || "General Academic"}</span></p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#13131a] border border-slate-100 dark:border-[#282830] rounded-xl text-xs text-slate-400">
            <span className="font-bold text-slate-500 dark:text-[#808191]">Wallet Address:</span>
            <span className="font-mono text-slate-600 dark:text-slate-300 truncate">{address}</span>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-[#808191] uppercase tracking-wider">Pending Approvals</p>
          <h3 className="text-2xl font-bold text-amber-500 mt-1">{pendingCampaigns.length} Awaiting Review</h3>
        </div>
        <div className="p-5 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-[#808191] uppercase tracking-wider">Active Environments</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{environments.length} Configured</h3>
        </div>
        <button 
          onClick={() => setShowFormBuilder(!showFormBuilder)}
          className="p-5 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white rounded-2xl shadow-lg transition-all flex flex-col justify-center items-start cursor-pointer"
        >
          <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Ecosystem Manager</span>
          <h3 className="text-base font-bold mt-1">{showFormBuilder ? "Close Builder ✖" : "Configure Custom Environment ⚙️"}</h3>
        </button>
      </div>

      {/* DRAWER BUILDER */}
      <AnimatePresence>
        {showFormBuilder && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="w-full p-6 sm:p-8 bg-white dark:bg-[#1c1c24] rounded-2xl border border-slate-200 dark:border-[#3a3a43] shadow-xl mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configure Campaign Environment</h2>
              <p className="text-xs text-slate-400 mt-1 mb-6">Design custom verification questions required from applicants.</p>

              <form onSubmit={handleSaveEnvironment} className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase">Environment Hub Name</label>
                  <input type="text" placeholder="e.g., Computer Science Final Projects Pool" className="w-full px-4 py-3 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-[#8c6dfd]" value={envName} onChange={(e) => setEnvName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase">Instructions / Description</label>
                  <textarea placeholder="Briefly explain what verification materials applicants must provide..." rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-[#8c6dfd]" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-[#808191] uppercase">Verification Questions</h3>
                    <button type="button" onClick={addQuestionField} className="text-xs font-bold text-[#8c6dfd] px-3 py-1 bg-[#8c6dfd]/10 rounded-lg">+ Add Question</button>
                  </div>

                  {questions.map((q, idx) => (
                    <div key={q.id} className="flex flex-col md:flex-row items-end gap-3 p-4 bg-slate-50 dark:bg-[#13131a] border border-slate-100 dark:border-[#282830] rounded-xl">
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <span className="text-[10px] font-bold text-slate-400">Question #{idx + 1} Label</span>
                        <input type="text" placeholder="e.g., Student ID / Reg Number" className="w-full px-3 py-2 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-lg text-slate-900 dark:text-white text-xs outline-none focus:border-[#8c6dfd]" value={q.label} onChange={(e) => updateQuestion(q.id, 'label', e.target.value)} required />
                      </div>
                      <div className="w-full md:w-40 flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">Response Type</span>
                        <select className="w-full px-3 py-2 bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-lg text-slate-900 dark:text-white text-xs outline-none focus:border-[#8c6dfd]" value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}>
                          <option value="text">Short Text Box</option>
                          <option value="textarea">Long Text Paragraph</option>
                          <option value="file">File Upload / Document</option>
                        </select>
                      </div>
                      <button type="button" disabled={questions.length === 1} onClick={() => removeQuestionField(q.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg disabled:opacity-30">🗑️</button>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={isSaving} className="w-full py-3 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl text-sm transition-colors">
                  {isSaving ? "Saving..." : "Publish Environment Settings"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📥 PENDING APPROVAL SECTION */}
      <div className="w-full bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">📥 Submitted Campaigns Awaiting Admin Review</h2>
        <p className="text-xs text-slate-400 mb-6">Review applicant submissions before approving and broadcasting them onto the blockchain.</p>

        {pendingCampaigns.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-[#13131a] rounded-2xl border border-dashed border-slate-200 dark:border-[#3a3a43]">
            <p className="text-sm text-slate-500 dark:text-[#808191]">No submissions currently pending review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCampaigns.map((sub) => (
              <div key={sub.submissionId} className="p-6 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg uppercase tracking-wider">
                      Pending Admin Approval
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{sub.formData.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">By: {sub.formData.name} ({sub.applicantAddress})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#1dc071]">{sub.formData.displayTarget} {sub.formData.currency}</span>
                    <p className="text-[10px] text-slate-400">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-[#1c1c24] rounded-xl border border-slate-200 dark:border-[#282830]">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">{sub.formData.description}</p>
                  
                  {/* DISPLAY DYNAMIC ANSWERS */}
                  {sub.verificationAnswers && Object.keys(sub.verificationAnswers).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase text-[#8c6dfd]">Verification Question Responses:</p>
                      {Object.entries(sub.verificationAnswers).map(([label, val]) => (
                        <p key={label} className="text-xs text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-200">{label}:</strong> {String(val)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => handleRejectSubmission(sub.submissionId)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl text-xs transition-all"
                  >
                    Reject Submission
                  </button>
                  <button 
                    onClick={() => handleApproveAndDeploy(sub)}
                    disabled={deployingId === sub.submissionId}
                    className="px-5 py-2 bg-[#1dc071] hover:bg-[#17a360] text-white font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
                  >
                    {deployingId === sub.submissionId ? "Deploying On-Chain..." : "✅ Approve & Deploy On-Chain"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🚀 ACTIVE ENVIRONMENT LIST */}
      <div className="w-full bg-white dark:bg-[#1c1c24] border border-slate-200 dark:border-[#3a3a43] rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configured Verification Environments</h2>
        <p className="text-xs text-slate-400 mb-6">Share environment links so users can register and submit projects for review.</p>

        {environments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-[#13131a] rounded-2xl border border-dashed border-slate-200 dark:border-[#3a3a43]">
            <p className="text-sm text-slate-500 dark:text-[#808191]">No environments created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {environments.map((env) => (
              <div key={env.id} className="p-5 bg-slate-50 dark:bg-[#13131a] border border-slate-200 dark:border-[#3a3a43] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{env.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-[#808191] mt-1">{env.description || "No description provided."}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-[#8c6dfd]/10 text-[#8c6dfd] rounded-lg">
                      {env.customQuestions?.length || 0} Dynamic Field(s)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/create-campaign?envId=${env.id}`, { state: { environment: env } })}
                  className="px-5 py-3 bg-[#8c6dfd] hover:bg-[#7a59e6] text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  🔗 Open User Form Link
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminProfile;