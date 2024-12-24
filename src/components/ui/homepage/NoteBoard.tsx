import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Note {
  id: number;
  text: string;
  timestamp: string;
  ip: string;
}

const characterLimit = 250;
const WORKER_API_URL = 'https://demiffy-noteboard-worker.velnertomas78-668.workers.dev';

const NoteBoard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [bannedIPs, setBannedIPs] = useState<string[]>([]);
  const [userIP, setUserIP] = useState<string>('');
  const [postError, setPostError] = useState<string | null>(null);
  const [adminActionError, setAdminActionError] = useState<string | null>(null);
  const [postingDisabled, setPostingDisabled] = useState<boolean>(false);
  const [noteCount, setNoteCount] = useState<number>(0);
  const [lastPostTime, setLastPostTime] = useState<number | null>(null);

  // Fetch IP from jsonip.com
  const fetchIPFromJsonIP = async () => {
    try {
      const res = await fetch('https://jsonip.com/');
      if (!res.ok) throw new Error('Failed to fetch from jsonip');
      const data = await res.json();
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP from jsonip:', error);
      return null;
    }
  };

  // Fetch user IP
  const fetchUserIP = async () => {
    const ip = await fetchIPFromJsonIP();
    if (ip) {
      setUserIP(ip);
    } else {
      console.error('Failed to fetch IP');
    }
  };

  // Fetch notes and banned IPs from worker
  useEffect(() => {
    fetchNotes();
    fetchUserIP();
  }, []);

  const fetchNotes = () => {
    axios
      .get(WORKER_API_URL)
      .then((response) => {
        const data = response.data;
        setNotes(data.notes);
        setBannedIPs(data.bannedIPs);
        setPostingDisabled(data.postingDisabled);
        setNoteCount(data.notes.length);
      })
      .catch((error) => {
        console.error('Error fetching notes:', error);
      });
  };

  // Handle adding a new note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);

    if (postingDisabled) {
      setPostError('Posting is currently disabled.');
      return;
    }

    if (!newNote.trim()) return;
    if (newNote.length > characterLimit) {
      setError(`Note cannot exceed ${characterLimit} characters`);
      return;
    }

    // Check if the user is banned
    if (bannedIPs.includes(userIP)) {
      setPostError('You are banned from posting notes.');
      return;
    }

    // Rate limit
    const currentTime = Date.now();
    if (lastPostTime && currentTime - lastPostTime < 30000) {
      setPostError('Please wait 30 seconds between posting notes.');
      setTimeout(() => {
        setPostError(null);
      }, 5000);
      return;
    }

    const timestamp = new Date().toLocaleString();

    axios
      .post(`${WORKER_API_URL}/`, { text: newNote, timestamp })
      .then((res) => {
        const response = res.data;
        if (response.success) {
          setNotes([...notes, { ...response.note, timestamp }]);
          setNewNote('');
          setError('');
          setNoteCount(noteCount + 1);
          setLastPostTime(currentTime);
        } else {
          setPostError(response.message || 'An error occurred while posting your note.');
        }
      })
      .catch((err) => {
        console.error(err);
        if (!postError) {
          setPostError('An unexpected error occurred.');
        }
      });
  };

  // Handle banning an IP
  const handleBanIP = (ip: string) => {
    if (isAdmin) {
      axios
        .post(
          `${WORKER_API_URL}/ban-ip`,
          { ip, password: adminPassword },
          { headers: { 'Content-Type': 'application/json' } }
        )
        .then((res) => {
          const response = res.data;
          if (response.success) {
            fetchNotes();
            setAdminActionError(null);
          } else {
            setAdminActionError(response.message || 'Failed to ban IP.');
            console.error(response.message);
          }
        })
        .catch((error) => {
          console.error('Error banning IP:', error);
          if (error.response && error.response.data && error.response.data.message) {
            setAdminActionError(error.response.data.message);
          } else {
            setAdminActionError('An unexpected error occurred while banning the IP.');
          }
        });
    }
  };

  // Handle unbanning an IP
  const handleUnbanIP = (ip: string) => {
    if (isAdmin) {
      axios
        .post(
          `${WORKER_API_URL}/unban-ip`,
          { ip, password: adminPassword },
          { headers: { 'Content-Type': 'application/json' } }
        )
        .then((res) => {
          const response = res.data;
          if (response.success) {
            fetchNotes();
            setAdminActionError(null);
          } else {
            setAdminActionError(response.message || 'Failed to unban IP.');
            console.error(response.message);
          }
        })
        .catch((error) => {
          console.error('Error unbanning IP:', error);
          if (error.response && error.response.data && error.response.data.message) {
            setAdminActionError(error.response.data.message);
          } else {
            setAdminActionError('An unexpected error occurred while unbanning the IP.');
          }
        });
    }
  };

  // Handle deleting a note
  const handleDeleteNote = (noteId: number) => {
    if (isAdmin) {
      axios
        .post(
          `${WORKER_API_URL}/delete-note`,
          { id: noteId, password: adminPassword },
          { headers: { 'Content-Type': 'application/json' } }
        )
        .then((res) => {
          const response = res.data;
          if (response.success) {
            setNotes(notes.filter((note) => note.id !== noteId));
            setNoteCount(noteCount - 1);
            setAdminActionError(null);
          } else {
            setAdminActionError(response.message || 'Failed to delete note.');
            console.error(response.message);
          }
        })
        .catch((error) => {
          console.error('Error deleting note:', error);
          if (error.response && error.response.data && error.response.data.message) {
            setAdminActionError(error.response.data.message);
          } else {
            setAdminActionError('An unexpected error occurred while deleting the note.');
          }
        });
    }
  };

  const handleTitleClick = () => {
    setClickCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    if (clickCount >= 10) {
      setShowLoginModal(true);
      setClickCount(0);
    }
  }, [clickCount]);

  const renderTextWithLinks = (text: string | undefined) => {
    if (!text) return null;

    if (text.includes('<iframe')) {
      return <div dangerouslySetInnerHTML={{ __html: text }} />;
    }

    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const elements: JSX.Element[] = [];

    text.split('\n').forEach((line, index) => {
      const parts = line.split(' ');

      parts.forEach((word, i) => {
        if (urlPattern.test(word)) {
          if (/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/.test(word)) {
            elements.push(
              <div key={`${index}-${i}`} className="mt-2">
                <img
                  src={word}
                  alt="Posted content"
                  className="max-w-full max-h-48 object-contain rounded-md"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            );
          } else {
            elements.push(
              <a
                key={`${index}-${i}`}
                href={word}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline"
              >
                {word}
              </a>
            );
          }
        } else {
          elements.push(<span key={`${index}-${i}`}>{word} </span>);
        }
      });

      elements.push(<div key={`br-${index}`} className="my-2" />);
    });

    return elements;
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const adminPanelVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  // Handle Admin Login Submission
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Handle admin login
  const handleAdminLogin = () => {
    axios
      .post(`${WORKER_API_URL}/admin-login`, { password: adminPassword }, { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        const data = response.data;
        if (data.success) {
          setIsAdmin(true);
          setShowLoginModal(false);
          setLoginError('');
          setAdminActionError(null);
        } else {
          setLoginError(data.message || 'Login failed');
        }
      })
      .catch((error) => {
        console.error('Admin login error:', error);
        if (error.response && error.response.data && error.response.data.message) {
          setLoginError(error.response.data.message);
        } else {
          setLoginError('An unexpected error occurred.');
        }
      });
  };

  // Handle toggling posting status
  const togglePosting = () => {
    if (!isAdmin) return;

    axios
      .post(`${WORKER_API_URL}/toggle-posting`, { password: adminPassword }, { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        const data = response.data;
        if (data.success) {
          setPostingDisabled(data.postingDisabled || false);
          setAdminActionError(null);
        } else {
          setAdminActionError(data.message || 'Failed to toggle posting status.');
          console.error(data.message);
        }
      })
      .catch((error) => {
        console.error('Error toggling posting status:', error);
        if (error.response && error.response.data && error.response.data.message) {
          setAdminActionError(error.response.data.message);
        } else {
          setAdminActionError('An unexpected error occurred while toggling posting status.');
        }
      });
  };

  // Handle clearing all notes
  const clearNotes = () => {
    if (!isAdmin) return;

    axios
      .post(`${WORKER_API_URL}/clear-notes`, { password: adminPassword }, { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        const data = response.data;
        if (data.success) {
          setNotes([]);
          setNoteCount(0);
          setAdminActionError(null);
        } else {
          setAdminActionError(data.message || 'Failed to clear all notes.');
          console.error(data.message);
        }
      })
      .catch((error) => {
        console.error('Error clearing notes:', error);
        if (error.response && error.response.data && error.response.data.message) {
          setAdminActionError(error.response.data.message);
        } else {
          setAdminActionError('An unexpected error occurred while clearing notes.');
        }
      });
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminPassword('');
    setAdminActionError(null);
  };

  return (
    <div className="container mx-auto py-10 flex flex-col lg:flex-row justify-between space-y-8 lg:space-y-0 lg:space-x-8 relative">
      <div className="w-full lg:w-1/2 bg-slate-900 p-6 rounded-lg shadow-lg">
        <motion.h3
          className="text-sky-400 font-bold text-lg mb-4 select-none"
          onClick={handleTitleClick}
          style={{ cursor: 'default' }}
        >
          Leave a Note
        </motion.h3>
        <form onSubmit={handleAddNote} className="space-y-4">
          <textarea
            className={`w-full p-3 rounded-lg bg-slate-800 text-white border-sky-500 focus:ring-2 focus:ring-sky-500 ${
              newNote.length > characterLimit ? 'border-red-500' : ''
            }`}
            rows={6}
            placeholder="Write your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <p
            className={`text-sm ${
              newNote.length > characterLimit
                ? 'text-red-500'
                : 'text-gray-400'
            } select-none`}
          >
            {newNote.length}/{characterLimit} characters
          </p>
          {error && <p className="text-red-500">{error}</p>}
          <motion.button
            type="submit"
            className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            disabled={!newNote.trim()}
          >
            Post Note
          </motion.button>
          {postError && <p className="text-red-500">{postError}</p>}
          <p className="text-sm text-gray-400 mt-4">
            Your note is public. Please avoid sharing explicit content. Serious
            violations may result in legal action.
          </p>
        </form>
      </div>

      <div className="w-full lg:w-1/2 bg-slate-900 p-6 rounded-lg shadow-lg h-[600px] overflow-y-auto">
        <h3 className="text-sky-400 font-bold text-lg mb-4 select-none">Notes Board</h3>
        {notes.length === 0 ? (
          <p className="text-white">
            No notes yet. Be the first to leave one!
          </p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                className="bg-slate-800 p-4 rounded-lg relative shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                {/* Delete Button */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="absolute top-3 right-3 p-2 bg-transparent hover:bg-slate-700 text-white rounded-full"
                    style={{ zIndex: 50 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <div className="text-white break-words">
                  {renderTextWithLinks(note.text)}
                </div>
                <p className="text-sm text-gray-400 mt-2">{note.timestamp}</p>
                {isAdmin && (
                  <p className="text-sm text-gray-500 mt-1">
                    IP: {note.ip}{' '}
                    <span
                      className="text-red-500 cursor-pointer hover:underline"
                      onClick={() => handleBanIP(note.ip)}
                    >
                      Ban IP
                    </span>
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Panel */}
      <AnimatePresence>
        {isAdmin && (
          <motion.div
            className="fixed bottom-4 right-4 w-80 bg-slate-950 bg-opacity-50 backdrop-blur-lg shadow-lg p-6 rounded-lg select-none"
            variants={adminPanelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <h4 className="text-sky-400 font-bold text-lg mb-4">
              Admin Dashboard
            </h4>
            <p className="text-white mb-2">
              <strong>Total Notes:</strong> {noteCount}
            </p>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={postingDisabled}
                  onChange={togglePosting}
                  className="form-checkbox h-5 w-5 text-sky-600"
                />
                <span className="ml-2 text-white">Disable Posting</span>
              </label>
            </div>
            <button
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors mb-4"
              onClick={clearNotes}
            >
              Clear All Notes
            </button>

            {/* Banned IPs */}
            <div className="mb-4">
              <h4 className="text-sky-400 font-bold text-lg mb-2">
                Banned IPs
              </h4>
              {bannedIPs.length === 0 ? (
                <p className="text-white">No banned IPs.</p>
              ) : (
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                  {bannedIPs.map((ip, index) => (
                    <li key={index} className="text-white text-sm">
                      {ip}{' '}
                      <span
                        className="text-green-500 cursor-pointer hover:underline"
                        onClick={() => handleUnbanIP(ip)}
                      >
                        Unban
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Admin Error Message */}
            {adminActionError && (
              <p className="text-red-500 text-sm mb-2">{adminActionError}</p>
            )}

            <div className="mb-4">
              <button
                className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors mb-2"
                onClick={fetchNotes}
              >
                Refresh Notes
              </button>
              <button
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={handleAdminLogout}
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="bg-slate-950 p-6 rounded-lg shadow-lg w-80 bg-opacity-50 backdrop-blur-lg"
              variants={modalVariants}
            >
              <h2 className="text-sky-400 font-bold text-lg mb-4 text-center select-none">
                Admin Login
              </h2>
              <form onSubmit={handleAdminLoginSubmit} className="space-y-4 select-none">
                <input
                  type="password"
                  className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
                {loginError && <p className="text-red-500">{loginError}</p>}
                <button
                  type="button"
                  className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors"
                  onClick={handleAdminLogin}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setShowLoginModal(false);
                    setAdminPassword('');
                    setLoginError('');
                  }}
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteBoard;