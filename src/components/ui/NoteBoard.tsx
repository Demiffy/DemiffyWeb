import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Note {
  id: number;
  text: string;
  timestamp: string;
  ip: string;
}

const characterLimit = 250;

const NoteBoard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [typedString, setTypedString] = useState<string>('');
  const [adminText, setAdminText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [bannedIPs, setBannedIPs] = useState<string[]>([]);
  const [userIP, setUserIP] = useState<string>('');
  const [postError, setPostError] = useState<string | null>(null);

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

  // Function to fetch user IP
  const fetchUserIP = async () => {
    const ip = await fetchIPFromJsonIP();
    if (ip) {
      setUserIP(ip);
    } else {
      console.error('Failed to fetch IP');
    }
  };

  // Fetch notes and banned IPs from the worker API
  useEffect(() => {
    fetch('https://demiffy-noteboard-worker.velnertomas78-668.workers.dev')
      .then((res) => res.json())
      .then((data: { notes: Note[], bannedIPs: string[] }) => {
        setNotes(data.notes);
        setBannedIPs(data.bannedIPs);
      });

    // Fetch user's IP
    fetchUserIP();
  }, []);

  // Handle adding a new note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);

    if (!newNote.trim()) return;
    if (newNote.length > characterLimit) {
      setError(`Note cannot exceed ${characterLimit} characters`);
      return;
    }

    // Check if the user is banned
    if (bannedIPs.includes(userIP)) {
      setPostError("You are banned from posting notes.");
      return;
    }

    const timestamp = new Date().toLocaleString();

    fetch('https://demiffy-noteboard-worker.velnertomas78-668.workers.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newNote, timestamp }),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) {
            setPostError("You are banned from posting notes.");
            fetch('https://demiffy-noteboard-worker.velnertomas78-668.workers.dev')
              .then((res) => res.json())
              .then((data: { bannedIPs: string[] }) => {
                setBannedIPs(data.bannedIPs);
              });
          } else {
            setPostError("An error occurred while posting your note.");
          }
          throw new Error(`Error posting note: ${res.statusText}`);
        }
        return res.json();
      })
      .then((note: Note) => {
        setNotes([...notes, { ...note, timestamp }]);
        setNewNote('');
        setError('');
      })
      .catch((err) => {
        console.error(err);
        if (!postError) {
          setPostError("An unexpected error occurred.");
        }
      });
  };

  // Handle banning an IP
  const handleBanIP = (ip: string) => {
    if (isAdmin) {
      fetch('https://demiffy-noteboard-worker.velnertomas78-668.workers.dev/ban-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip }),
      })
        .then(() => {
          fetch('https://demiffy-noteboard-worker.velnertomas78-668.workers.dev')
            .then((res) => res.json())
            .then((data: { bannedIPs: string[] }) => {
              setBannedIPs(data.bannedIPs);
              if (ip === userIP) {
                setPostError("You are banned from posting notes.");
              }
            });
        });
    }
  };

  // Handle unbanning an IP
  const handleUnbanIP = (ip: string) => {
    if (isAdmin) {
      fetch('https://demiffy-noteboard-worker.velnertomas78-668.workers.dev/unban-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip }),
      }).then(() => {
        fetch('https://demiffy-noteboard-worker.velnertomas78-668.workers.dev')
          .then((res) => res.json())
          .then((data: { bannedIPs: string[] }) => {
            setBannedIPs(data.bannedIPs);
          });
      });
    }
  };

  // Handle deleting a note
  const handleDeleteNote = (noteId: number) => {
    if (isAdmin) {
      fetch('https://demiffy-noteboard-worker.velnertomas78-668.workers.dev/delete-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: noteId }),
      }).then(() => {
        setNotes(notes.filter((note) => note.id !== noteId));
      });
    }
  };

  const handleTitleClick = () => {
    setClickCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setTypedString((prev) => (prev + e.key).slice(-4));
    };

    window.addEventListener('keydown', handleKeyDown);

    if (clickCount >= 10 && typedString === 'demi') {
      setIsAdmin(true);
      setAdminText('Admin mode enabled');
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clickCount, typedString]);

  // Detect if text is a URL or image URL
  const renderTextWithLinks = (text: string | undefined) => {
    if (!text) return null;
  
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
            // Render normal URL as a link
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

  return (
    <div className="container mx-auto py-10 flex justify-between space-x-8">
      {/* Note Input Form */}
      <div className="w-1/2 bg-slate-900 p-6 rounded-lg shadow-lg">
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
          <p className={`text-sm ${newNote.length > characterLimit ? 'text-red-500' : 'text-gray-400'}`}>
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
            Your note is public. Please avoid sharing explicit content. Serious violations may result in legal action.
          </p>
        </form>
        {adminText && <p className="text-sm text-sky-500 mt-4">{adminText}</p>}

        {/* Admin Section */}
        {isAdmin && (
        <div className="mt-6">
            <h4 className="text-sky-400 font-bold text-lg mb-2">Banned IPs</h4>
            {bannedIPs.length === 0 ? (
            <p className="text-white">No banned IPs.</p>
            ) : (
            <ul className="space-y-2">
                {bannedIPs.map((ip, index) => (
                <li key={index} className="text-white">
                    IP: {ip}{' '}
                    <span
                    className="text-green-500 cursor-pointer hover:underline"
                    onClick={() => handleUnbanIP(ip)}
                    >
                    Unban IP
                    </span>
                </li>
                ))}
            </ul>
            )}
        </div>
        )}
      </div>

      {/* Scrollable Notes Container */}
      <div className="w-1/2 bg-slate-900 p-6 rounded-lg shadow-lg h-[600px] overflow-y-auto">
        <h3 className="text-sky-400 font-bold text-lg mb-4">Notes Board</h3>
        {notes.length === 0 ? (
          <p className="text-white">No notes yet. Be the first to leave one!</p>
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
                    className="absolute top-3 right-3 p-2 bg-transparent hover:bg-slate-700 text-white rounded-full z-50"
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
                <div className="text-white break-words">{renderTextWithLinks(note.text)}</div>
                <p className="text-sm text-gray-400 mt-2">{note.timestamp}</p>
                {isAdmin && (
                  <p className="text-sm text-gray-500 mt-1">
                    IP: {note.ip}{' '}
                    <span
                      className="text-red-500 cursor-pointer"
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
    </div>
  );
};

export default NoteBoard;
