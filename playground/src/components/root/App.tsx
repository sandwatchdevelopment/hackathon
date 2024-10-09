import {HelmetProvider} from "react-helmet-async";
import {AuthProvider} from "~/components/contexts/UserContext";
import Main from "~/components/root/Main";

import { useEffect, useState, useRef } from "react";
import base58 from 'bs58';

import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import {
  PhantomWalletAdapter,
  HuobiWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter
} from '@solana/wallet-adapter-wallets'

// 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [
    new HuobiWalletAdapter(),
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter(),
  ]
})

// 1. Get projectId from https://cloud.reown.com
const projectId = '8498b689c6ff9d62f9e83130bb0554af'

// 2. Create a metadata object - optional
const metadata = {
  name: 'sandwatch-admin',
  description: 'AppKit Solana Sandwatch Admin',
  url: 'https://d3fnlklw4a68ue.cloudfront.net', // origin must match your domain & subdomain
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
  termsConditionsUrl: 'https://www.mytermsandconditions.com',
  privacyPolicyUrl: 'https://www.myprivacypolicy.com'
})


export const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </HelmetProvider>
  )
};
