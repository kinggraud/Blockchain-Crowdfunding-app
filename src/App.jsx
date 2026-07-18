import React from 'react'
import { Route, Routes } from 'react-router-dom';

import { Sidebar, Navbar, SignupModal } from './components';
import Footer from "./components/Footer";
import { Logout } from './pages';

import { CampaignDetails, CreateCampaign, Home, Profile, HelpCenter, AdminProfile } from './pages';

const App = () => {
  return (
    // 🚀 Added dynamic bg here to ensure the full screen matches the theme standard
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#1c1c24] transition-colors duration-300">

      {/* 🔄 CHANGED: Removed the hardcoded dark background and added responsive classes */}
      <div className="relative sm:px-8 p-4 bg-slate-50 dark:bg-[#13131a] flex flex-row flex-1 transition-colors duration-300">

        <div className="sm:flex hidden mr-10 relative">
          <Sidebar />
        </div>

        <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
          <Navbar />
          
          <Routes> 
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign-details/:id" element={<CampaignDetails />} />
            <Route path="/signup" element={<SignupModal />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/admin-configuration" element={<AdminProfile />} />
          </Routes>
        </div>
        
      </div>
      <Footer />
    </div>
  )
}

export default App;