import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThirdwebProvider, embeddedWallet, metamaskWallet } from '@thirdweb-dev/react';
import { StateContextProvider } from './context';
import { Sepolia } from '@thirdweb-dev/chains';
import ScrollToTop from './utils/ScrollToTop';

import App from './App';
import './index.css';




const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ThirdwebProvider 
    activeChain={Sepolia}
    supportedChains={[Sepolia]}
    clientId="2446c2c49acf821609d20f92435a8c7f"
    supportedWallets={[
      embeddedWallet({
        auth: {
          options: ["email", "google", "apple"], 
        },
      }),
      metamaskWallet({
        recommended: true,
      }),
    ]}
    autoConnect={true}
    dAppMeta={{
      name: "My Crowdfunding App",
      description: "Final Year Project",
      url: typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
      isDarkMode: true,
    }}
  >
    <Router>
      <ScrollToTop /> 
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </Router>
  </ThirdwebProvider>
);