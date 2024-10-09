import React, { useState } from 'react';

const prefixes = ['Crypto', 'Bitcoin', 'Ethereum', 'Ripple', 'Litecoin', 'Cardano', 'Polkadot', 'Stellar', 'Chainlink', 'Binance', 'Tether', 'Monero', 'EOS', 'Tron', 'Tezos', 'Dash', 'Zcash', 'Dogecoin', 'VeChain', 'IOTA', 'NEO', 'NEM', 'Ontology', 'Qtum', 'ICON', 'Lisk'];
const suffixes = ['Steve', 'Bob', 'Joe', 'Alice', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack', 'Kathy', 'Leo', 'Mona', 'Nina', 'Oscar', 'Paul', 'Quincy', 'Rita', 'Sam', 'Tina', 'Uma', 'Vince', 'Wendy'];

const testData = Array.from({ length: 25 }, (_, index) => ({
  rank: index + 1,
  name: `${prefixes[index % prefixes.length]} ${suffixes[index % suffixes.length]}`,
  avatar: 'https://via.placeholder.com/50',
  seat: ['Golden', 'Premium', 'Basic', 'VIP', 'Creator'][index % 5],
  multiplier: (Math.random() * 2).toFixed(2),
  popcorn: (Math.random() * 100).toFixed(2),
}));

const getSeatClass = (seat: string) => {
  switch (seat) {
    case 'Golden':
      return 'bg-yellow-500';
    case 'Premium':
      return 'bg-blue-500';
    case 'Basic':
      return 'bg-gray-500';
    case 'VIP':
      return 'bg-purple-500';
    case 'Creator':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const TestLeaderboard = () => {
  const [data, setData] = useState(testData);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  const handleSort = (key: keyof typeof testData[0]) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setData(sortedData);
    setSortConfig({ key, direction });
  };

  const getClassNamesFor = (name: string) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Test Leaderboard</h2>
      <table className="w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left cursor-pointer" onClick={() => handleSort('rank')}>
              Rank {getClassNamesFor('rank') === 'ascending' ? '▲' : getClassNamesFor('rank') === 'descending' ? '▼' : ''}
            </th>
            <th className="py-2 px-4 border-b text-left cursor-pointer" onClick={() => handleSort('name')}>
              Name {getClassNamesFor('name') === 'ascending' ? '▲' : getClassNamesFor('name') === 'descending' ? '▼' : ''}
            </th>
            <th className="py-2 px-4 border-b text-left cursor-pointer" onClick={() => handleSort('seat')}>
              Seat {getClassNamesFor('seat') === 'ascending' ? '▲' : getClassNamesFor('seat') === 'descending' ? '▼' : ''}
            </th>
            <th className="py-2 px-4 border-b text-left cursor-pointer" onClick={() => handleSort('multiplier')}>
              Multiplier {getClassNamesFor('multiplier') === 'ascending' ? '▲' : getClassNamesFor('multiplier') === 'descending' ? '▼' : ''}
            </th>
            <th className="py-2 px-4 border-b text-left cursor-pointer" onClick={() => handleSort('popcorn')}>
              Popcorn {getClassNamesFor('popcorn') === 'ascending' ? '▲' : getClassNamesFor('popcorn') === 'descending' ? '▼' : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((data) => (
            <tr key={data.rank}>
              <td className="py-2 px-4 border-b text-center">{data.rank}</td>
              <td className="py-2 px-4 border-b flex items-center">
                <img src={data.avatar} alt="Avatar" className="rounded-full w-8 h-8 mr-2" />
                <span className="flex-1">{data.name}</span>
              </td>
              <td className="py-2 px-4 border-b text-center">
                <span className={`px-2 py-1 rounded-full text-white ${getSeatClass(data.seat)}`}>
                  {data.seat}
                </span>
              </td>
              <td className="py-2 px-4 border-b text-center">{data.multiplier}</td>
              <td className="py-2 px-4 border-b text-center flex items-center justify-center">
                <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="Popcorn" className="w-4 h-4 mr-1" />
                {data.popcorn}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};