import React, { useState } from 'react';
import Footer from './ui/Footer';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

const DiscordUser: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    user_id: string;
    user_name: string;
    discriminator: string;
    avatar_url: string | null;
    banner_url: string | null;
    banner_color: string | null;
    accent_color: number | null;
    created_at: string;
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
          {error && <p className="text-red-400 text-center">{error}</p>}
          {userData && (
            <div
              className="rounded-lg shadow-lg overflow-hidden"
              style={{
                backgroundColor: userData.banner_color || userData.accent_color
                  ? `#${userData.banner_color?.replace('#', '') || userData.accent_color?.toString(16)}`
                  : '#4a5568',
              }}
            >
              {/* Banner */}
              {userData.banner_url ? (
                <div
                  className="h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url(${userData.banner_url})` }}
                ></div>
              ) : (
                <div className="h-32"></div>
              )}

              {/* Profile Section */}
              <div className="bg-gray-700 p-6 text-center relative">
                {userData.avatar_url ? (
                  <img
                    src={userData.avatar_url}
                    alt={`${userData.user_name}'s avatar`}
                    className="w-24 h-24 rounded-full mx-auto border-4 border-gray-800 -mt-12"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto border-4 border-gray-800 bg-gray-600 flex items-center justify-center text-gray-300 -mt-12">
                    <span className="text-3xl font-bold">{userData.user_name[0]}</span>
                  </div>
                )}
                <h2 className="text-2xl font-bold mt-4">
                  {userData.user_name}
                  <span className="text-gray-400">#{userData.discriminator}</span>
                </h2>
                <p className="text-sm text-gray-400">User ID: {userData.user_id}</p>
              </div>

              {/* Profile Details */}
              <div className="bg-gray-800 p-6">
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <strong>Username:</strong> {userData.user_name}
                  </li>
                  <li>
                    <strong>Discriminator:</strong> #{userData.discriminator}
                  </li>
                  <li>
                    <strong>User ID:</strong> {userData.user_id}
                  </li>
                  <li>
                    <strong>Created At:</strong> {userData.created_at}
                  </li>
                  {userData.banner_color && (
                    <li>
                      <strong>Banner Color:</strong>{' '}
                      <span
                        className="inline-block w-6 h-6 rounded-full"
                        style={{ backgroundColor: userData.banner_color }}
                      ></span>
                      <span className="ml-2">{userData.banner_color}</span>
                    </li>
                  )}
                  {userData.accent_color && (
                    <li>
                      <strong>Accent Color:</strong>{' '}
                      <span
                        className="inline-block w-6 h-6 rounded-full"
                        style={{ backgroundColor: `#${userData.accent_color.toString(16)}` }}
                      ></span>
                      <span className="ml-2">#{userData.accent_color.toString(16)}</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="bg-gray-700 p-4 flex justify-center space-x-4">
                <a
                  href={`https://discord.com/users/${userData.user_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
