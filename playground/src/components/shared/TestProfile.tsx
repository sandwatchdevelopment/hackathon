import React, { ReactNode, useState } from 'react';
import axios from 'axios';

interface CardProps {
  children: ReactNode;
  avatar: string;
  username: string;
  seatType: string;
  seatNumber: string;
  rowName: string;
  lotteryNumber: string;
  popcorn: number;
  multiplier: string;
}

const Card = ({ children, avatar, username, seatType, seatNumber, rowName, lotteryNumber, popcorn, multiplier }: CardProps) => (
  <div
    className="card p-4 border rounded shadow-sm mx-auto"
    style={{
      maxWidth: '600px'
    }}
  >
    <div className="d-flex align-items-center mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="d-flex align-items-center" style={{ display: 'flex', alignItems: 'center' }}>
        <img src={avatar} alt="Avatar" className="rounded-full" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
        <h5 className="mb-0">{username}</h5>
      </div>
      <span className="badge badge-pill badge-primary">{seatType}</span>
    </div>
    <div className="divider"></div> {/* Divider between forms */}

    <div className="d-flex justify-content-between mb-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="d-flex flex-column align-items-start" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span className="mb-2">Seat Number: {seatNumber}</span>
      </div>
      <div className="d-flex flex-column align-items-start" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span className="mb-2">Row Name: {rowName}</span>
      </div>
      <div className="d-flex flex-column align-items-start" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span>Lottery Number: {lotteryNumber}</span>
      </div>
    </div>
    <div className="divider"></div> {/* Divider between forms */}

    <div className="d-flex align-items-center mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="mr-4">Popcorn: {popcorn}</span>
      <span>Multiplier: {multiplier}</span>
    </div>
    <div className="divider"></div> {/* Divider between forms */}

    {children}
  </div>
);

const tasks = [
  { name: 'Profile Created', multiplier: 'x1' },
  { name: 'Invite Code Boost', multiplier: 'x2' },
  { name: 'Connect your X Account', multiplier: 'x1.5' },
  { name: 'Follow Sandwatch on X', multiplier: 'x1' },
  { name: 'Connect your Discord Account', multiplier: 'x2' },
  { name: 'Join Sandwatch Discord Channel', multiplier: 'x1.5' },
  { name: 'Connect your Telegram Account', multiplier: 'x1' },
  { name: 'Join Announcement Channel', multiplier: 'x1.5' },
  { name: 'Connect your Instagram Account', multiplier: 'x1' },
  { name: 'Follow Sandwatch on Instagram', multiplier: 'x1.5' },  
  { name: 'Logged in today', multiplier: 'x1' }
];

const users = [
  { username: 'Crypto Steve', avatar: 'https://minotar.net/armor/bust/mhf_steve/500.png', seatType: 'Basic', seatNumber: '12A', rowName: 'Row 5', lotteryNumber: '12345', popcorn: 5, multiplier: 'x2' },
  { username: 'Blockchain Bob', avatar: 'https://minotar.net/armor/bust/mhf_alex/500.png', seatType: 'VIP', seatNumber: '15B', rowName: 'Row 3', lotteryNumber: '67890', popcorn: 10, multiplier: 'x3' }
];

const handleTaskClick = async (taskName: string) => {
  let url = '';

  switch (taskName) {
    case 'Connect your X Account':
      url = 'https://3v4i2pavob.execute-api.us-west-2.amazonaws.com/v1/connections/twitter';
      break;
    case 'Connect your Discord Account':
      url = 'https://3v4i2pavob.execute-api.us-west-2.amazonaws.com/v1/connections/discord';
      break;
    case 'Connect your Telegram Account':
      url = 'https://3v4i2pavob.execute-api.us-west-2.amazonaws.com/v1/connections/telegram';
      break;
    case 'Connect your Instagram Account':
      url = 'https://3v4i2pavob.execute-api.us-west-2.amazonaws.com/v1/connections/instagram';
      break;
    default:
      alert(`Task clicked: ${taskName}`);
      return;
  }

  try {
    const response = await axios.get(url, { params: { task: taskName } });
    alert(`Task clicked: ${taskName}. Response: ${JSON.stringify(response.data)}`);
  } catch (error) {
    if (error instanceof Error) {
      alert(`Task clicked: ${taskName}. Error: ${error.message}`);
    } else {
      alert('An unknown error occurred');
    }
  }
};

const List = () => (
  <div className="border border-base-300 bg-base-100 rounded-box mt-4 p-4 shimmer-border" style={{ maxWidth: '600px', margin: '0 auto' }}>
    <div className="d-flex justify-content-between mb-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
      <h5 className="mb-0">Popcorn Tasks</h5>
      <h5 className="mb-0">Multiplier</h5>
    </div>
    {tasks.map((task, index) => (
      <div key={index} className="border border-base-300 bg-base-100 rounded-box mt-2 cursor-pointer" onClick={() => handleTaskClick(task.name)}>
        <div className="text-lg font-medium flex items-center justify-between p-4">
          <div className="flex items-center">
            <img src="https://cdn.prod.website-files.com/65e801858cac0b57abc6ec85/66df316e0b778a3e6e6db43c_dfFrame%201012262758.svg" alt="icon" className="w-4 h-4 mr-2 svg-black" />
            <span className="mr-2">{task.name}</span>
          </div>
          <span className="text-sm text-gray-500">{task.multiplier}</span>
        </div>
      </div>
    ))}
  </div>
);

const UpgradeSeatModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (seatType: string) => void }) => {
  if (!isOpen) return null;

  const seatOptions = ['Golden', 'Premium', 'VIP', 'Basic', 'Creator'];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-4">Select Seat Type</h2>
        <ul>
          {seatOptions.map((option) => (
            <li key={option} className="mb-2">
              <button className="btn btn-secondary w-full" onClick={() => onSelect(option)}>{option}</button>
            </li>
          ))}
        </ul>
        <button className="btn btn-primary mt-4" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export const TestProfile = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState(users[0]);

  const handleUpgradeSeat = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSelectSeat = (seatType: string) => {
    setSelectedSeat(seatType);
    setModalOpen(false);
    alert(`Seat upgraded to: ${seatType}`);
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const user = users.find(user => user.username === event.target.value);
    if (user) {
      setSelectedUser(user);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label htmlFor="user-select" className="mr-2">Select User:</label>
        <select id="user-select" onChange={handleUserChange} value={selectedUser.username}>
          {users.map(user => (
            <option key={user.username} value={user.username}>{user.username}</option>
          ))}
        </select>
      </div>
      <Card
        avatar={selectedUser.avatar}
        username={selectedUser.username}
        seatType={selectedSeat || selectedUser.seatType}
        seatNumber={selectedUser.seatNumber}
        rowName={selectedUser.rowName}
        lotteryNumber={selectedUser.lotteryNumber}
        popcorn={selectedUser.popcorn}
        multiplier={selectedUser.multiplier}
      >
        <button className="btn btn-primary mt-4" onClick={handleUpgradeSeat}>Upgrade Seat</button>
      </Card>
      <div className="mt-8"> {/* Add space between the card and the accordion */}
        <List />
      </div>
      <UpgradeSeatModal isOpen={isModalOpen} onClose={handleCloseModal} onSelect={handleSelectSeat} />
    </div>
  );
};