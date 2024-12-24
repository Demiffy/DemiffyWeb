import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import Footer from './ui/Footer';

const About = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('guest');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Valid credentials
  const validUsername = 'demiffy';
  const validPassword = 'password123';
  const guestPassword = 'guestpass';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check valid login
    if (
      (username === validUsername && password === validPassword) ||
      (username === 'guest' && password === guestPassword)
    ) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>About - Demiffy</title>
        <meta name="description" content="This is Demiffy's home page, showcasing skills and projects in IT" />
        <meta name="keywords" content="Demiffy, IT, aviation, jet pilot, projects, programming, portfolio" />
        <link rel="canonical" href="https://demiffy.com" />
      </Helmet>
      <div className="flex-grow">
        <div className="about-page-wrapper py-20">
          {!isLoggedIn && (
            <div className="warning-box max-w-md mx-auto bg-red-600 p-4 rounded-lg mb-8 shadow-md">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.516 11.59c.75 1.335-.213 3.01-1.742 3.01H3.483c-1.53 0-2.492-1.675-1.742-3.01L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a.75.75 0 01-.75-.75V7a.75.75 0 011.5 0v3.25A.75.75 0 0110 11z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-white font-medium">
                  This section contains sensitive information and is protected by a password. I do not wish to have this content
                  publicly displayed.
                </p>
              </div>
            </div>
          )}

          {!isLoggedIn ? (
            // Login
            <div className="login-form-wrapper max-w-sm mx-auto bg-slate-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-sky-400 mb-4">Login to Access About Section</h3>
              <form onSubmit={handleLogin} className="space-y-6">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                  <label htmlFor="username" className="block text-sky-400 mb-2 text-sm font-medium">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-700 border-sky-500 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sky-400 mb-2 text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-700 border-sky-500 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Login
                </button>
              </form>
            </div>
          ) : (
            // About
            <div className="about-content-wrapper bg-slate-900 p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-sky-400 mb-4">About Me</h1>
              <p className="text-xl text-gray-300">
                I am an 18-year-old Czech male interested in IT, army technologies, and aspiring to be an army jet pilot. 
                My journey has been focused on learning cutting-edge technology while integrating my passion for aviation 
                and military defense systems. I aim to combine these two fields to create impactful innovations in the future.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;