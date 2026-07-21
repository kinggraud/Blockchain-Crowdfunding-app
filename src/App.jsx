import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import { Sidebar, Navbar, SignupModal } from './components';
import Footer from "./components/Footer";
import { Logout } from './pages';
import { CampaignDetails, CreateCampaign, Home, Profile, HelpCenter, AdminProfile } from './pages';
import AdminGuard from './components/AdminGuard';

const App = () => {
  // 🚀 Added state to control whether to show the Landing Page or the main Dashboard
  const [hasStarted, setHasStarted] = useState(false);

  // If the user hasn't clicked "Get Started" yet, show the full-screen landing page layout
  if (!hasStarted) {
    return <LandingPage onGetStarted={() => setHasStarted(true)} />;
  }

  // Once started, reveal the core App layout with navigation tools and router switches
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#1c1c24] transition-colors duration-300">
      
      <div className="relative sm:px-8 p-4 bg-slate-50 dark:bg-[#13131a] flex flex-row flex-1 transition-colors duration-300">

        <div className="sm:flex hidden mr-10 relative">
          <Sidebar />
        </div>

        <div id="main-scroll-container" className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
          <Navbar />
          
          <Routes> 
            <Route path="/landing" element={<LandingPage onGetStarted={() => setHasStarted(true)} />} />
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign-details/:id" element={<CampaignDetails />} />
            <Route path="/signup" element={<SignupModal />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/logout" element={<Logout />} />

            <Route 
            path="/admin-configuration" 
            element={
              <AdminGuard>
                <AdminProfile />
              </AdminGuard>
            } 
          />
          </Routes>
        </div>
        
      </div>
      <Footer />
    </div>
  )
}

export default App;