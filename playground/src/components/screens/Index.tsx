import { Dialog } from '@headlessui/react';
import { useRef, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { SignInButton } from '~/components/domain/auth/SignInButton';
import { SignOutButton } from '~/components/domain/auth/SignOutButton';
import { Head } from '~/components/shared/Head';
import { TestUserCreation } from '~/components/shared/TestUserCreation';
import { TestAuth } from '~/components/shared/TestAuth';
import { TestLeaderboard } from '~/components/shared/TestLeaderboard';
import { TestProfile } from '~/components/shared/TestProfile';
import { TestChain } from '~/components/shared/TestChain';
import { FaFlask } from 'react-icons/fa'; // Importing a testing icon from react-icons

function Index() {
  const { state } = useAuthState();
  const [isOpen, setIsOpen] = useState(true);
  const completeButtonRef = useRef(null);
  const [activeTab, setActiveTab] = useState('userCreation');

  return (
    <>
      <Head title="SW ADMIN" />
      <h1 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
        <FaFlask className="mr-2" /> Test Bench
      </h1> {/* Centered Top-Level Header with Icon */}
      
      <div className="tabs tabs-boxed">
        <a
          className={`tab tab-bordered ${activeTab === 'userCreation' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('userCreation')}
        >
          User Creation
        </a>
        <a
          className={`tab tab-bordered ${activeTab === 'auth' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('auth')}
        >
          Auth
        </a>
        <a
          className={`tab tab-bordered ${activeTab === 'leaderboard' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </a>
        <a
          className={`tab tab-bordered ${activeTab === 'profile' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </a>
        <a
          className={`tab tab-bordered ${activeTab === 'chain' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('chain')}
        >
          Chain
        </a>        
      </div>
      
      {activeTab === 'userCreation' && <TestUserCreation />}
      {activeTab === 'auth' && <TestAuth />}
      {activeTab === 'leaderboard' && <TestLeaderboard />}
      {activeTab === 'profile' && <TestProfile />}
      {activeTab === 'chain' && <TestChain />}
    </>
  );
}

export default Index;