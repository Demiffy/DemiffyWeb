import React, { useState } from 'react';
import Footer from './ui/Footer';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

const FetchDiscordUserPage: React.FC = () => {
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
        <h1 className="text-3xl font-bold text-center">Discord User Fetcher</h1>
      </header>

      <main className="flex-grow p-6 overflow-auto">
        <div className="flex flex-col items-center space-y-6">
          <input
            type="text"
            placeholder="Enter Discord User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full max-w-lg p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleFetchUser}
            disabled={loading || !userId}
            className={`flex items-center justify-center py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
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
            <div className="w-full max-w-lg bg-gray-700 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">User Details</h2>
              <div className="space-y-4">
                <div>
                  <strong>ID:</strong> {userData.id}
                </div>
                <div>
                  <strong>Username:</strong> {userData.username}#
                  {userData.discriminator}
                </div>
                <div>
                  <strong>Avatar:</strong>
                </div>
                {userData.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full"
                  />
                ) : (
                  <p>No avatar available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FetchDiscordUserPage;
