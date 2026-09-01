import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import ActiveCampaigns from './pages/ActiveCampaigns';
import { Sidebar, Navbar } from './components';
import Footer from "./components/Footer";
import { Logout } from './pages';
import { CampaignDetails, CreateCampaign, Home, Profile, HelpCenter, AdminProfile } from './pages';
import AdminGuard from './components/AdminGuard';
import { useStateContext } from './context';

// Ensure you import SignupModal here if it isn't already imported globally
// import SignupModal from './components/SignupModal'; 

const App = () => {
  const location = useLocation();

  // Destructure only the necessary Web3 and UI state from your context
  const { 
    address, 
    isSignupModalOpen, 
    setIsSignupModalOpen, 
    signupInitialRole 
  } = useStateContext() || {};

  // 1️⃣ Determine if the requested campaign details page should be public/standalone
  // It renders public ONLY IF coming from public pages or without an active logged-in session
  const isCampaignDetailsPath = location.pathname.startsWith('/campaign-details/');
  const isExplicitFromDashboard = location.state?.fromDashboard === true;
  
  // Login status is now determined purely by the presence of a Web3 wallet address
  const isLoggedIn = Boolean(address);

  const isPublicCampaignDetails = isCampaignDetailsPath && !isExplicitFromDashboard && !isLoggedIn;

  const isPublicRoute = 
    location.pathname === '/' || 
    location.pathname === '/landing' || 
    location.pathname === '/active-campaigns' ||
    isPublicCampaignDetails;

  // 2️⃣ STANDALONE PUBLIC ROUTES (No Sidebar, No Navbar, No Dashboard Shell)
  if (isPublicRoute) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/active-campaigns" element={<ActiveCampaigns />} />
          <Route path="/campaign-details/:id" element={<CampaignDetails />} />
        </Routes>
      </>
    );
  }

  // 3️⃣ MAIN APP DASHBOARD LAYOUT (Includes Sidebar, Navbar, and Footer for Logged-In Users)
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

            {/* Admin Configuration Route (Protected via AdminGuard) */}
            <Route 
              path="/admin-configuration" 
              element={
                <AdminGuard>
                  <AdminProfile />
                </AdminGuard>
              } 
            />
            
            {/* Protected Alias Directs */}
            <Route 
              path="/admin" 
              element={
                <AdminGuard>
                  <Navigate to="/admin-configuration" replace />
                </AdminGuard>
              } 
            />
            <Route 
              path="/admin-profile" 
              element={
                <AdminGuard>
                  <Navigate to="/admin-configuration" replace />
                </AdminGuard>
              } 
            />

            {/* Catch-all Fallback -> Redirects back to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
      </div>
      
      {/* 🔐 Global Registration Modal (Web3 / Smart Contract based) */}
      

      <Footer />
    </div>
  );
};

export default App;