import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import { Sidebar, Navbar, SignupModal, AuthModal } from './components';
import Footer from "./components/Footer";
import { Logout } from './pages';
import { CampaignDetails, CreateCampaign, Home, Profile, HelpCenter, AdminProfile } from './pages';
import AdminGuard from './components/AdminGuard';
import { useStateContext } from './context';

const App = () => {
  const location = useLocation();

  const context = useStateContext() || {};
  const { 
    user, 
    authLoading = false,
    isSignupModalOpen = false, 
    setIsSignupModalOpen, 
    isAuthModalOpen = false,
    setIsAuthModalOpen,
    signupInitialRole = null, 
    address = '' 
  } = context;

  // 1️⃣ Loading screen while Firebase checks persistent session on refresh
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#1c1c24] flex justify-center items-center font-epilogue">
        <p className="animate-pulse text-[#8c6dfd] font-bold text-lg">Initializing Session...</p>
      </div>
    );
  }

  // 2️⃣ STANDALONE LANDING PAGE ROUTE (Applies to both '/' and '/landing')
  // Renders pure LandingPage without Sidebar, Navbar, or Dashboard wrappers
  if (location.pathname === '/' || location.pathname === '/landing') {
    return (
      <>
        <LandingPage />

        {/* Global Auth Modal in case user clicks Sign In on Landing Page */}
        {setIsAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        )}
      </>
    );
  }

  // 3️⃣ MAIN APP DASHBOARD LAYOUT
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#1c1c24] transition-colors duration-300 font-epilogue">
      
      <div className="relative sm:px-8 p-4 bg-slate-50 dark:bg-[#13131a] flex flex-row flex-1 transition-colors duration-300">

        {/* Sidebar navigation */}
        <div className="sm:flex hidden mr-10 relative">
          <Sidebar />
        </div>

        <div id="main-scroll-container" className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
          <Navbar />
          
          <Routes> 
            {/* Main App Dashboard */}
            <Route path="/home" element={<Home />} />
            
            {/* Recipient Profile & Campaign Actions */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign-details/:id" element={<CampaignDetails />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/logout" element={<Logout />} />

            {/* Admin Configuration Route */}
            <Route path="/admin-configuration" element={<AdminProfile />} />
            
            {/* Alias Directs */}
            <Route path="/admin" element={<Navigate to="/admin-configuration" replace />} />
            <Route path="/admin-profile" element={<Navigate to="/admin-configuration" replace />} />

            {/* Catch-all Fallback -> Redirects back to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
      </div>
      
      {/* 🔐 Global Registration Modal */}
      <SignupModal 
        isOpen={isSignupModalOpen}
        initialRole={signupInitialRole}
        onClose={() => setIsSignupModalOpen && setIsSignupModalOpen(false)}
        userAddress={address}
      />

      {/* 🔑 Global Auth (Sign In / Sign Up) Modal */}
      {setIsAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default App;