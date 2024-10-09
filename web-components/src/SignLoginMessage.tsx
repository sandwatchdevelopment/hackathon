import { useState } from 'react';
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana';
import api from './axiosConfig';
import Base58 from 'bs58'

export function SignLoginMessage() {
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { address } = useAppKitAccount()
  const [loading, setLoading] = useState(false);

  async function onSignMessage() {
    var signature = null
    try {
      if (!walletProvider) {
        throw Error('user is disconnected')
      }      

      setLoading(true);

      const encodedMessage = new TextEncoder().encode('Log in to Sandwatch')
      signature = await walletProvider.signMessage(encodedMessage)
      const base58signature = Base58.encode(signature)
      const response = await api.post('/auth/access_token', {
        signedMessage: base58signature,
        publicKey: address
      });
      console.log(response.data);

    } catch (err) {
      console.log((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        className={`font-sans-serif text-white font-bold mt-2 py-2 px-4 rounded-lg flex items-center justify-center ${
          loading ? 'bg-[#262626] border border-[#3C3C3C]' : 'bg-sandwatch-400'
        }`}
        style={{ fontFamily: 'Abcdiatype, sans-serif' }}
        onClick={onSignMessage}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-[#3CF83B] mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <span className="text-[#3CF83B]">Logging in...</span>
          </>
        ) : (
          'Sign Message to Log In'
        )}
      </button>
    </div>
  )
}