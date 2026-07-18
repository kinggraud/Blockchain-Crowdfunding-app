import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThirdwebProvider, MetaMaskWallet } from '@thirdweb-dev/react';
import { StateContextProvider } from './context';
import { Sepolia } from '@thirdweb-dev/chains';

import App from './App';
import './index.css';



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <ThirdwebProvider 
         activeChain={Sepolia}
         supportedChains={[Sepolia]}
         clientId="2446c2c49acf821609d20f92435a8c7f"
         wallets={[new MetaMaskWallet()]}
        >
        <Router>
            <StateContextProvider>
            <App />

            </StateContextProvider>
        </Router>
    </ThirdwebProvider>
)