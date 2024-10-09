import React from 'react'
import { useEffect, useState } from 'react';
import localforage from 'localforage';

import { createAppKit, useAppKitAccount } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { SignLoginMessage } from './SignLoginMessage'
// 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// 1. Get projectId from https://cloud.reown.com
const projectId = '8498b689c6ff9d62f9e83130bb0554af'

// 2. Create a metadata object - optional
const metadata = {
  name: 'sandwatch-admin',
  description: 'Sandwatch.ai',
  url: 'http://localhost', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Create modal
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  },
  themeVariables: {
    '--w3m-accent': '#3bf93b',
    '--w3m-border-radius-master': "1px",
    '--w3m-font-family': "Abcdiatype, sans-serif"
  }    
})


const App: React.FC = () => {
  const { address } = useAppKitAccount()
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const checkRefreshToken = async () => {
      const token = await localforage.getItem<string>('refreshToken');
      if (!token || isTokenExpired(token) ) return;
      setRefreshToken(token);
    };
  
    checkRefreshToken();
  }, []);

  const isTokenExpired = (token: string) => {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) {
      throw new Error('Invalid token');
    }
    const payload = JSON.parse(atob(tokenParts[1] || ''));
    return payload.exp * 1000 < Date.now();
  };

  return (
    <>
      {address && !refreshToken? (
        <div className="flex flex-col items-center">
        <SignLoginMessage />
        <span className="mt-2 text-gray-600">To login you will need to sign a message with your wallet. It's free</span>
      </div>
      ) : (
        <div className="flex flex-col items-center">
          <w3m-button />
          <span className="mt-2 text-gray-600">Connect a wallet to create your sandwatch account</span>
        </div>
      )}
    </>
  )
};

export default App;

