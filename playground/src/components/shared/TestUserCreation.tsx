import React, { useState } from 'react';

export const TestUserCreation = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [username, setUsername] = useState('');
  const [seatType, setSeatType] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [inviteCodeResponse, setInviteCodeResponse] = useState('');
  const [usernameResponse, setUsernameResponse] = useState('');
  const [formResponse, setFormResponse] = useState('');
  const [generateInviteResponse, setGenerateInviteResponse] = useState('');

  const handleInviteCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle invite code submission logic here
    setInviteCodeResponse(`Invite Code submitted: ${inviteCode}`);
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle username check logic here
    setUsernameResponse(`Username checked: ${username}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    setFormResponse(`Form submitted with Username: ${username}, Invite Code: ${inviteCode}, Seat Type: ${seatType}`);
  };

  const handleGenerateInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle generate invite code logic here
    setGenerateInviteResponse(`Invite code generated for User: ${selectedUser}, Seat Type: ${seatType}`);
  };

  return (
    <div className="p-4">     
      <form onSubmit={handleInviteCodeSubmit} className="mb-4">
        <h2 className="text-xl font-bold mb-2">Submit Invite Code</h2>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Invite Code</span>
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="input input-bordered"
            placeholder="Enter invite code"
          />
        </div>
        <button type="submit" className="btn btn-secondary mt-2">Submit</button>
      </form>
      {inviteCodeResponse && (
        <div className="alert alert-info mt-2">
          <span>{inviteCodeResponse}</span>
        </div>
      )}

      <div className="divider"></div> {/* Divider between forms */}

      <form onSubmit={handleUsernameSubmit}>
        <h2 className="text-xl font-bold mb-2">Check Username</h2>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Username</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input input-bordered"
            placeholder="Enter username"
          />
        </div>
        <button type="submit" className="btn btn-secondary mt-2">Submit</button>
      </form>
      {usernameResponse && (
        <div className="alert alert-info mt-2">
          <span>{usernameResponse}</span>
        </div>
      )}

      <div className="divider"></div> {/* Divider between forms */}

      <form onSubmit={handleFormSubmit}>
        <h2 className="text-xl font-bold mb-2">Submit Form</h2>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Username</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input input-bordered"
            placeholder="Enter username"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Invite Code</span>
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="input input-bordered"
            placeholder="Enter invite code"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Seat Type</span>
          </label>
          <select
            value={seatType}
            onChange={(e) => setSeatType(e.target.value)}
            className="select select-bordered"
          >
            <option value="" disabled>Select seat type</option>
            <option value="premium">Premium</option>
            <option value="golden">Golden</option>
            <option value="vip">VIP</option>
            <option value="basic">Basic</option>
            <option value="creator">Creator</option>
          </select>
        </div>
        <button type="submit" className="btn btn-secondary mt-2">Submit</button>
      </form>
      {formResponse && (
        <div className="alert alert-info mt-2">
          <span>{formResponse}</span>
        </div>
      )}

      <div className="divider"></div> {/* Divider between forms */}

      <form onSubmit={handleGenerateInviteSubmit}>
        <h2 className="text-xl font-bold mb-2">Generate Invite Code</h2>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Select User</span>
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="select select-bordered"
          >
            <option value="" disabled>Select user</option>
            <option value="user1">User 1</option>
            <option value="user2">User 2</option>
            <option value="user3">User 3</option>
            {/* Add more users as needed */}
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Seat Type</span>
          </label>
          <select
            value={seatType}
            onChange={(e) => setSeatType(e.target.value)}
            className="select select-bordered"
          >
            <option value="" disabled>Select seat type</option>
            <option value="premium">Premium</option>
            <option value="golden">Golden</option>
            <option value="vip">VIP</option>
            <option value="basic">Basic</option>
            <option value="creator">Creator</option>
          </select>
        </div>
        <button type="submit" className="btn btn-secondary mt-2">Generate Invite Code</button>
      </form>
      {generateInviteResponse && (
        <div className="alert alert-info mt-2">
          <span>{generateInviteResponse}</span>
        </div>
      )}
    </div>
  );
};