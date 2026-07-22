import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThirdwebProvider, metamaskWallet } from '@thirdweb-dev/react';
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
  supportedWallets={[metamaskWallet()]}
  // 🚨 ADD THESE THREE LINES TO KILL AUTO-CONNECTION
  autoConnect={false}
  dAppMeta={{
    name: "My Crowdfunding App",
    description: "Final Year Project",
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