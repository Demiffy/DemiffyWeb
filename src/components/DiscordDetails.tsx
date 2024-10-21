import { useState } from 'react';
import Footer from './ui/Footer';

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
}

export default function DiscordUserProfile() {
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscordUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/fetchDiscordUser?userId=${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }
      const data: DiscordUser = await response.json();
      setUser(data);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchUser = () => {
    if (userId.trim()) {
      fetchDiscordUser(userId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Discord User Profile</h1>
          <p className="mb-4">Enter a Discord User ID to fetch their profile information.</p>
          <div className="flex items-center space-x-4 justify-center">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter Discord User ID"
              className="px-4 py-2 text-black rounded-lg shadow w-64"
            />
            <button
              onClick={handleFetchUser}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg shadow"
            >
              Fetch Profile
            </button>
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {user && (
          <div className="text-center mt-8">
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`}
              alt={`${user.username}'s avatar`}
              className="rounded-full shadow-lg mb-4 w-32 h-32"
            />
            <h2 className="text-3xl font-bold">{user.username}#{user.discriminator}</h2>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
