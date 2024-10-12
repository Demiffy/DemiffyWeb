// Place.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';

const GRID_SIZE = 50;
const WORKER_API_URL = 'https://demiffy-place-worker.velnertomas78-668.workers.dev';

const COLORS = [
  '#6d001a', '#be0039', '#ff4500', '#ffa800', '#ffd635', '#fff8b8',
  '#00a368', '#00cc78', '#7eed56', '#00756f', '#009eaa', '#00ccc0',
  '#2450a4', '#3690ea', '#51e9f4', '#493ac1', '#6a5cff', '#94b3ff',
  '#811e9f', '#b44ac0', '#e4abff', '#de107f', '#ff3881', '#ff99aa',
  '#6d482f', '#9c6926', '#ffb470', '#000000', '#515252', '#898d90',
  '#d4d7d9', '#ffffff'
];

const Place = () => {
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('#FFFFFF'))
  );
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [cooldown, setCooldown] = useState(false);
  const [placingDisabled, setPlacingDisabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchGrid = () => {
      axios
        .get(`${WORKER_API_URL}/grid`)
        .then((response) => {
          setGrid(response.data);
        })
        .catch((error) => {
          console.error('Error fetching grid:', error);
        });
    };

    const fetchPlacingStatus = () => {
      axios
        .get(`${WORKER_API_URL}/placing-disabled`)
        .then((response) => {
          setPlacingDisabled(response.data.placingDisabled);
        })
        .catch((error) => {
          console.error('Error fetching placing status:', error);
        });
    };

    fetchGrid();
    fetchPlacingStatus();

    const intervalId = setInterval(fetchGrid, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handlePlacePixel = (x: number, y: number) => {
    if (cooldown) return;

    setCooldown(true);

    axios
      .post(`${WORKER_API_URL}/place`, { x, y, color: selectedColor })
      .then((response) => {
        setGrid(response.data);
        setCooldown(false);
        setErrorMessage('');
      })
      .catch((error) => {
        console.error('Error placing pixel:', error);
        setCooldown(false);

        if (error.response && error.response.status === 403) {
          setPlacingDisabled(true);
          setErrorMessage('Placing is currently disabled.');
          setTimeout(() => {
            setErrorMessage('');
          }, 2000);
        } else {
          setErrorMessage('An error occurred while placing the pixel.');
          setTimeout(() => {
            setErrorMessage('');
          }, 2000);
        }
      });
  };

  const adminPanelVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-start justify-center p-4 mt-20 space-y-6 md:space-x-6 md:space-y-0">
      {/* Grid Container */}
      <div
        className="grid-container"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(10px, 20px))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((pixelColor, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handlePlacePixel(rowIndex, colIndex)}
              className="grid-block"
              style={{
                backgroundColor: pixelColor,
                width: 'min(vw, 20px)',
                height: 'min(4vw, 20px)',
              }}
            ></div>
          ))
        )}
      </div>

      {/* Color Picker */}
      <div className="flex flex-col items-center">
        <h2
          className="text-lg mb-4 select-none"
          onClick={() => {
            setClickCount((prev) => prev + 1);
            if (clickCount + 1 >= 10) {
              setShowLoginModal(true);
              setClickCount(0);
            }
          }}
        >
          Select a Color:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 color-picker">
          {COLORS.map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer border-2 ${
                selectedColor === color ? 'active-color' : 'inactive-color'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Custom Color Picker */}
        {isAdmin && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Hex"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="border rounded px-1 py-1"
              style={{ width: '4rem' }}
            />
            <button
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
              style={{ fontSize: '1rem' }}
              onClick={() => {
                if (/^#([0-9A-F]{3}){1,2}$/i.test(customColor)) {
                  setSelectedColor(customColor);
                } else {
                  setErrorMessage('Invalid Hex');
                  setTimeout(() => {
                    setErrorMessage('');
                  }, 1000);
                }
              }}
            >
              Set Color
            </button>
          </div>
        )}

        <p className="mt-4 text-gray-600 bg-slate-950 bg-opacity-50 backdrop-blur-lg shadow-lg p-2 rounded-lg">
          {' '}
          <span style={{ color: selectedColor }}>{selectedColor}</span>
        </p>

        {/* Display Error */}
        {errorMessage && (
          <p className="mt-2 text-red-500">{errorMessage}</p>
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
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={placingDisabled}
                  onChange={() => {
                    axios
                      .post(`${WORKER_API_URL}/toggle-placing`)
                      .then(() => {
                        axios
                          .get(`${WORKER_API_URL}/placing-disabled`)
                          .then((response) => {
                            setPlacingDisabled(response.data.placingDisabled);
                          });
                      });
                  }}
                  className="form-checkbox h-5 w-5 text-sky-600"
                />
                <span className="ml-2 text-white">Disable Placing</span>
              </label>
            </div>
            <button
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors mb-4"
              onClick={() => {
                axios.post(`${WORKER_API_URL}/clear-grid`).then(() => {
                  axios.get(`${WORKER_API_URL}/grid`).then((response) => {
                    setGrid(response.data);
                  });
                });
              }}
            >
              Clear Grid
            </button>
            <button
              className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors mb-2"
              onClick={() => {
                axios.get(`${WORKER_API_URL}/grid`).then((response) => {
                  setGrid(response.data);
                });
              }}
            >
              Refresh Grid
            </button>
            <button
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={() => {
                setIsAdmin(false);
                setAdminPassword('');
              }}
            >
              Logout
            </button>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPassword === 'demi') {
                    setIsAdmin(true);
                    setShowLoginModal(false);
                    setAdminPassword('');
                    setLoginError('');
                  } else {
                    setLoginError('Incorrect password');
                  }
                }}
                className="space-y-4 select-none"
              >
                <input
                  type="password"
                  className="w-full p-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
                {loginError && <p className="text-red-500">{loginError}</p>}
                <button
                  type="submit"
                  className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors"
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

export default Place;
