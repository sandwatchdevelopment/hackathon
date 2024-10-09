
import { useRef, useState, useEffect } from 'react';
import base58 from 'bs58';

import { 
useAppKitAccount,
useAppKitProvider,
useAppKit,
useAppKitState,
useAppKitTheme,
useAppKitEvents,
useAppKitNetwork,
useWalletInfo } from '@reown/appkit/react'


import {
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
  Connection,
  TransactionInstruction
} from '@solana/web3.js'

export const TestChain = () => {
  // 4. Use modal hook
  const { address, currentChain } = useAppKitAccount()
  const {open,close} = useAppKit()
  const state = useAppKitState()
  const { themeMode, themeVariables, setThemeMode } = useAppKitTheme()
  const events = useAppKitEvents()
  const network = useAppKitNetwork()
  const provider = useAppKitProvider('solana')
  const { walletInfo } = useWalletInfo()

  // view: 'Account' | 'Connect' | 'Networks' | 'ApproveTransaction' | 'OnRampProviders';
  const handleConnectClick = () => {
    console.log('Connect button clicked');
    open({ view: 'Connect' })
  };

  const handleAccountClick = () => {
    console.log('Account button clicked');
    open({ view: 'Account' })
  };

  const handleNetworksClick = () => {
    console.log('Networks button clicked');
    open({ view: 'Networks' })
  };

  const handleOnRampProvidersClick = () => {
    console.log('OnRampProviders button clicked');
    open({ view: 'OnRampProviders' })
  };

  const handleApproveTransactionClick = () => {
    console.log('ApproveTransaction button clicked');
    open({ view: 'ApproveTransaction' })
  };

  return (
    <>
     <h2 className="text-2xl font-bold mb-4">Appkit buttons</h2>
     <div className="button-group mb-4 space-x-2">
      <button className="btn btn-info" onClick={handleConnectClick}>Connect</button>
      <button className="btn btn-info" onClick={handleAccountClick}>Account</button>
      <button className="btn btn-info" onClick={handleNetworksClick}>Networks</button>
      <button className="btn btn-info" onClick={handleOnRampProvidersClick}>OnRampProviders</button>
      <button className="btn btn-info" onClick={handleApproveTransactionClick}>ApproveTransaction</button>
    </div>
      <div className="divider"></div> {/* Divider between forms */}

      <h2 className="text-2xl font-bold mb-4">State</h2>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <div className="divider"></div> {/* Divider between forms */}

      <h2 className="text-2xl font-bold mb-4">Theme</h2>
      <pre>{JSON.stringify({ themeMode, themeVariables }, null, 2)}</pre>

      <h2 className="text-2xl font-bold mb-4">Events</h2>
      <div className="divider"></div> {/* Divider between forms */}
      <pre>{JSON.stringify(events, null, 2)}</pre>
      
      <h2 className="text-2xl font-bold mb-4">Address</h2>
      <pre>{JSON.stringify(address, null, 2)}</pre>
      <div className="divider"></div> {/* Divider between forms */}

      <h2 className="text-2xl font-bold mb-4">Network</h2>
      <pre>{JSON.stringify(network, null, 2)}</pre>
      <div className="divider"></div> {/* Divider between forms */}

      <h2 className="text-2xl font-bold mb-4">Provider</h2>
      <pre>{JSON.stringify(provider, null, 2)}</pre>

      <h2 className="text-2xl font-bold mb-4">Wallet Info</h2>
      <pre data-prefix="name" >{walletInfo ? JSON.stringify(walletInfo.name, null, 2) : 'No wallet info name available'}</pre>
      <pre data-prefix="icon" >{walletInfo ? JSON.stringify(walletInfo.icon, null, 2) : 'No wallet info icon available'}</pre>
    </>
  )
}
