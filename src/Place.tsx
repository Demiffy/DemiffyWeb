// Place.tsx
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';

const GRID_SIZE = 50;
const WORKER_API_URL = 'https://demiffy-place-worker.velnertomas78-668.workers.dev';

// Define the color palette with indices
const COLOR_PALETTE = [
  '#6D001A', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#FFF8B8',
  '#00A368', '#00CC78', '#7EED56', '#00756F', '#009EAA', '#00CCC0',
  '#2450A4', '#3690EA', '#51E9F4', '#493AC1', '#6A5CFF', '#94B3FF',
  '#811E9F', '#B44AC0', '#E4ABFF', '#DE107F', '#FF3881', '#FF99AA',
  '#6D482F', '#9C6926', '#FFB470', '#000000', '#515252', '#898D90',
  '#D4D7D9', '#FFFFFF' // Index 31
];

// Removed unused 'Change' interface

// Define interfaces for API responses
interface TogglePlacingResponse {
  success: boolean;
  placingDisabled: boolean;
}

interface PlaceResponse {
  success: boolean;
  x: number;
  y: number;
  color: number | string;
  timestamp: number;
}

interface AdminLoginResponse {
  success: boolean;
  message?: string;
}

const Place = () => {
  const [grid, setGrid] = useState<(number | string)[]>(Array(GRID_SIZE * GRID_SIZE).fill(31)); // Default to white
  const [selectedColor, setSelectedColor] = useState<number>(0); // Default to first color in palette
  const [cooldown, setCooldown] = useState(false);
  const [placingDisabled, setPlacingDisabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  // Utility function to convert compact grid string to array of color indices
  const parseGridString = (gridStr: string): (number | string)[] => {
    const gridArray: (number | string)[] = Array(GRID_SIZE * GRID_SIZE).fill(31); // Initialize with white
    if (!gridStr) return gridArray;
    const pixels = gridStr.split('/');
    pixels.forEach(pixel => {
      if (pixel) {
        const [coords, colorPart] = pixel.split(':');
        const [x, y] = coords.split(';').map(Number);
        if (!isNaN(x) && !isNaN(y)) {
          const position = x * GRID_SIZE + y;
          if (position >= 0 && position < GRID_SIZE * GRID_SIZE) {
            const [color] = colorPart.split(','); // Removed 'timestampStr'
            if (!isNaN(parseInt(color, 10))) {
              gridArray[position] = parseInt(color, 10);
            } else {
              gridArray[position] = color.toUpperCase(); // Store hex if not in palette
            }
          }
        }
      }
    });
    return gridArray;
  };

  // Function to get color from grid value
  const getColor = (value: number | string): string => {
    if (typeof value === 'number') {
      return COLOR_PALETTE[value] || '#FFFFFF';
    }
    return value; // Assume it's a valid hex code
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${WORKER_API_URL}/grid`);
        const data = response.data;
        const initialGrid = parseGridString(data.grid);
        setGrid(initialGrid);
        setLastUpdate(parseInt(data.lastUpdate, 10));
        if (data.placingDisabled !== undefined) {
          setPlacingDisabled(data.placingDisabled);
        }
      } catch (error) {
        console.error('Error fetching initial grid:', error);
      }
    };

    fetchInitialData();

    const fetchChanges = async () => {
      try {
        const response = await axios.get(`${WORKER_API_URL}/get-changes`, {
          params: { since: lastUpdate },
        });
        const data = response.data;
        const changes: string[] = data.changes;

        if (changes.length > 0) {
          setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            changes.forEach(changeStr => {
              if (changeStr) {
                const [coords, colorTimestamp] = changeStr.split(':');
                const [color] = colorTimestamp.split(','); // Removed 'timestampStr'
                const [x, y] = coords.split(';').map(Number);
                const position = x * GRID_SIZE + y;
                if (position >= 0 && position < GRID_SIZE * GRID_SIZE) {
                  if (color.toLowerCase() === 'white') {
                    newGrid[position] = 31; // Reset to white
                  } else {
                    const colorIndex = parseInt(color, 10);
                    if (!isNaN(colorIndex) && COLOR_PALETTE[colorIndex]) {
                      newGrid[position] = colorIndex;
                    } else {
                      newGrid[position] = color.toUpperCase();
                    }
                  }
                }
              }
            });
            return newGrid;
          });
          // Update lastUpdate to the latest timestamp
          const latestTimestamp = changes.reduce((max, changeStr) => {
            const [_, colorTimestamp] = changeStr.split(':');
            const [__, timestampStr] = colorTimestamp.split(',');
            const timestamp = parseInt(timestampStr, 10);
            return timestamp > max ? timestamp : max;
          }, lastUpdate);
          setLastUpdate(latestTimestamp);
        }
      } catch (error) {
        console.error('Error fetching changes:', error);
      }
    };

    const pollingInterval = 5000; // 5 seconds to reduce KV usage

    const intervalId = setInterval(fetchChanges, pollingInterval);

    return () => clearInterval(intervalId);
  }, [lastUpdate]);

  const handlePlacePixel = async (x: number, y: number) => {
    if (cooldown || placingDisabled) return;

    setCooldown(true);

    try {
      const selectedColorValue = COLOR_PALETTE[selectedColor];
      const response = await axios.post<PlaceResponse>(`${WORKER_API_URL}/place`, { x, y, color: selectedColorValue });
      const data = response.data;

      if (data.success) {
        const position = x * GRID_SIZE + y;
        const newGrid = [...grid];
        if (data.color === 'white') {
          newGrid[position] = 31; // Reset to white
        } else if (typeof data.color === 'number') {
          newGrid[position] = data.color;
        } else {
          newGrid[position] = data.color.toUpperCase();
        }
        setGrid(newGrid);
        setLastUpdate(data.timestamp);
        setErrorMessage('');
      } else {
        // Since 'message' does not exist, provide a generic error message
        setErrorMessage('Placing failed.');
      }
    } catch (error: any) {
      console.error('Error placing pixel:', error);

      if (error.response && error.response.status === 403) {
        setPlacingDisabled(true);
        setErrorMessage('Placing is currently disabled.');
        setTimeout(() => {
          setErrorMessage('');
        }, 2000);
      } else if (error.response && error.response.data && error.response.data.message) {
        // This block can be removed or modified if 'message' is not expected
        setErrorMessage(error.response.data.message);
        setTimeout(() => {
          setErrorMessage('');
        }, 2000);
      } else {
        setErrorMessage('An error occurred while placing the pixel.');
        setTimeout(() => {
          setErrorMessage('');
        }, 2000);
      }
    } finally {
      setTimeout(() => {
        setCooldown(false);
      }, 300);
    }
  };

  const adminPanelVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  // Handle Admin Login Submission
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdminLogin();
  };

  // Function to handle admin login
  const handleAdminLogin = async () => {
    try {
      const response = await axios.post<AdminLoginResponse>(`${WORKER_API_URL}/admin-login`, { password: adminPassword });
      const data = response.data;
      if (data.success) {
        setIsAdmin(true);
        setShowLoginModal(false);
        setLoginError('');
      } else {
        // Ensure that 'message' exists before accessing it
        setLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError('An unexpected error occurred.');
    }
  };

  // Function to handle toggling placing status
  const togglePlacing = async () => {
    if (!isAdmin) return;

    try {
      const response = await axios.post<TogglePlacingResponse>(`${WORKER_API_URL}/toggle-placing`, { password: adminPassword });
      const data = response.data;
      if (data.success) {
        setPlacingDisabled(data.placingDisabled);
      } else {
        // Since 'message' does not exist, log a generic error
        console.error('Toggle placing failed.');
      }
    } catch (error) {
      console.error('Error toggling placing status:', error);
    }
  };

  // Function to handle clearing the grid
  const clearGrid = async () => {
    if (!isAdmin) return;

    try {
      const response = await axios.post<{ success: boolean; message: string }>(`${WORKER_API_URL}/clear-grid`, { password: adminPassword });
      const data = response.data;
      if (data.success) {
        const clearedGrid = Array(GRID_SIZE * GRID_SIZE).fill(31); // Reset to white
        setGrid(clearedGrid);
        setLastUpdate(Date.now());
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error clearing grid:', error);
    }
  };

  // Function to handle admin logout
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminPassword('');
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-start justify-center p-4 mt-20 space-y-6 md:space-x-6 md:space-y-0">
      <Helmet>
        <title>Place - Demiffy</title>
        <meta name="description" content="This is Demiffy's home page, showcasing skills and projects in IT" />
        <meta name="keywords" content="Demiffy, IT, aviation, jet pilot, projects, programming, portfolio" />
        <link rel="canonical" href="https://demiffy.com" />
        {/* Discord tags */}
        <meta property="og:title" content="Demiffy!" />
        <meta property="og:description" content="What a dumbass who coded this" />
        <meta property="og:url" content="https://demiffy.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://demiffy.com/plane.png" />
      </Helmet>
      
      {/* Grid Container */}
      <div
        className="grid-container"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
          gridGap: '0px', // Remove gaps between pixels
          backgroundColor: '#000', // Optional: Background color for grid
        }}
      >
        {grid.map((value, index) => {
          const x = Math.floor(index / GRID_SIZE);
          const y = index % GRID_SIZE;
          return (
            <div
              key={`${x}-${y}`}
              onClick={() => handlePlacePixel(x, y)}
              className="grid-block"
              style={{
                backgroundColor: getColor(value),
                width: '20px',
                height: '20px',
                cursor: placingDisabled ? 'not-allowed' : 'pointer',
              }}
            ></div>
          );
        })}
      </div>

      {/* Color Picker */}
      <div className="flex flex-col items-center">
        <h2
          className="text-lg mb-4 select-none cursor-pointer"
          onClick={handleTitleClick}
          title="Click 10 times to open admin login"
        >
          Select a Color:
        </h2>
        <div className="grid grid-cols-4 gap-2 color-picker">
          {COLOR_PALETTE.map((color, index) => (
            <div
              key={color}
              onClick={() => setSelectedColor(index)}
              className={`w-8 h-8 rounded-full cursor-pointer ${
                selectedColor === index ? 'ring-2 ring-black' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Custom Color Picker */}
        {isAdmin && (
          <div className="mt-4 flex items-center">
            <input
              type="text"
              placeholder="Hex"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="border rounded px-2 py-1"
              style={{ width: '6rem' }}
            />
            <button
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => {
                if (/^#([0-9A-F]{3}){1,2}$/i.test(customColor)) {
                  const upperHex = customColor.toUpperCase();
                  const existingIndex = COLOR_PALETTE.indexOf(upperHex);
                  if (existingIndex === -1) {
                    // Add new color to palette
                    COLOR_PALETTE.push(upperHex);
                    setSelectedColor(COLOR_PALETTE.length - 1);
                  } else {
                    setSelectedColor(existingIndex);
                  }
                  setCustomColor('');
                } else {
                  setErrorMessage('Invalid Hex');
                  setTimeout(() => {
                    setErrorMessage('');
                  }, 1000);
                }
              }}
            >
              Set
            </button>
          </div>
        )}

        <p className="mt-4 text-gray-600 bg-slate-950 bg-opacity-50 backdrop-blur-lg shadow-lg p-2 rounded-lg">
          <span style={{ color: getColor(COLOR_PALETTE[selectedColor]) }}>
            {COLOR_PALETTE[selectedColor]}
          </span>
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
                  onChange={togglePlacing}
                  className="form-checkbox h-5 w-5 text-sky-600"
                />
                <span className="ml-2 text-white">Disable Placing</span>
              </label>
            </div>
            <button
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors mb-4"
              onClick={clearGrid}
            >
              Clear Grid
            </button>
            <button
              className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors mb-2"
              onClick={async () => {
                try {
                  const response = await axios.get(`${WORKER_API_URL}/grid`);
                  const data = response.data;
                  const refreshedGrid = parseGridString(data.grid);
                  setGrid(refreshedGrid);
                  setLastUpdate(parseInt(data.lastUpdate, 10));
                  if (data.placingDisabled !== undefined) {
                    setPlacingDisabled(data.placingDisabled);
                  }
                } catch (error) {
                  console.error('Error refreshing grid:', error);
                }
              }}
            >
              Refresh Grid
            </button>
            <button
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={handleAdminLogout}
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
