import React, { useState } from 'react';
import Footer from './ui/Footer';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

const DiscordUser: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  } | null>(null);

  const handleFetchUser = async () => {
    setLoading(true);
    setError(null);
    setUserData(null);

    try {
      const response = await fetch(`/api/fetchDiscordUser?userId=${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch user.');
        return;
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError('An error occurred while fetching the user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col pt-12">
      <header className="p-6">
        <h1 className="text-3xl font-bold text-center">Discord Profile Viewer</h1>
      </header>

      <main className="flex-grow p-6 overflow-auto flex flex-col items-center">
        <div className="w-full max-w-lg space-y-6">
          <input
            type="text"
            placeholder="Enter Discord User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleFetchUser}
            disabled={loading || !userId}
            className={`w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center ${
              loading ? 'cursor-not-allowed opacity-70' : ''
            }`}
          >
            {loading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              'Fetch User'
            )}
          </button>
          {error && (
            <p className="text-red-400 text-center">{error}</p>
          )}
          {userData && (
            <div className="bg-gray-700 rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-4">
                {/* User Avatar */}
                {userData.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`}
                    alt={`${userData.username}'s avatar`}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-gray-300">
                    <span className="text-2xl font-bold">
                      {userData.username[0]}
                    </span>
                  </div>
                )}
                {/* User Info */}
                <div>
                  <h2 className="text-xl font-semibold">
                    {userData.username}
                    <span className="text-gray-400">#{userData.discriminator}</span>
                  </h2>
                  <p className="text-sm text-gray-400">
                    User ID: {userData.id}
                  </p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2 text-gray-200">
                  Profile Details
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <strong>Username:</strong> {userData.username}
                  </li>
                  <li>
                    <strong>Discriminator:</strong> #{userData.discriminator}
                  </li>
                  <li>
                    <strong>User ID:</strong> {userData.id}
                  </li>
                  {userData.avatar && (
                    <li>
                      <strong>Avatar:</strong>{' '}
                      <a
                        href={`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View Avatar
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-4 flex space-x-4">
                <a
                  href={`https://discord.com/users/${userData.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View Profile on Discord
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DiscordUser;
