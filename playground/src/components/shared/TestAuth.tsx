import React, { useState } from 'react';

export const TestAuth = () => {
  const [message, setMessage] = useState('');

  const handleSignMessage = () => {
    setMessage('Message signed!');
    console.log('Message signed!');
  };

  return (
    <div className="p-4">
      Test auth
      <button onClick={handleSignMessage}>Sign Message to Log In</button>
      {message && <p>{message}</p>}
    </div>
  );
};