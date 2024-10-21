// Place.tsx

import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';

const GRID_SIZE = 50;
const WORKER_API_URL = 'https://demiffy-place-worker.velnertomas78-668.workers.dev';

const COLOR_PALETTE: string[] = [
  '#6D001A', '#BE0039', '#FF4500', '#FFA800', '#FFD635', '#FFF8B8',
  '#00A368', '#00CC78', '#7EED56', '#00756F', '#009EAA', '#00CCC0',
  '#2450A4', '#3690EA', '#51E9F4', '#493AC1', '#6A5CFF', '#94B3FF',
  '#811E9F', '#B44AC0', '#E4ABFF', '#DE107F', '#FF3881', '#FF99AA',
  '#6D482F', '#9C6926', '#FFB470', '#000000', '#515252', '#898D90',
  '#D4D7D9', '#FFFFFF' // Index 31
];

interface TogglePlacingResponse {
  success: boolean;
  placingDisabled: boolean;
}

interface AdminLoginResponse {
  success: boolean;
  message?: string;
}

interface GetChangesResponse {
  changes: string[];
}

interface PixelAction {
  x: number;
  y: number;
  color: string | number;
  previousColor: string | number;
}

interface BatchPlaceResponse {
  success: boolean;
  timestamp: number;
  message?: string;
}

const Place = () => {
  const [grid, setGrid] = useState<(number | string)[]>(Array(GRID_SIZE * GRID_SIZE).fill(31));
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [placingDisabled, setPlacingDisabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const gridFetchInterval = useRef<NodeJS.Timeout | null>(null);
  const batchQueue = useRef<PixelAction[]>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);
  const isSendingBatch = useRef<boolean>(false);
  const isFetchingGrid = useRef<boolean>(false);

  const parseGridString = (gridStr: string): (number | string)[] => {
    const gridArray: (number | string)[] = Array(GRID_SIZE * GRID_SIZE).fill(31);
    if (!gridStr) return gridArray;
    const pixels = gridStr.split('/');
    pixels.forEach(pixel => {
      if (pixel) {
        const [coords, colorPart] = pixel.split(':');
        const [x, y] = coords.split(';').map(Number);
        if (!isNaN(x) && !isNaN(y)) {
          const position = x * GRID_SIZE + y;
          if (position >= 0 && position < GRID_SIZE * GRID_SIZE) {
            const [color] = colorPart.split(',');
            if (!isNaN(parseInt(color, 10))) {
              gridArray[position] = parseInt(color, 10);
            } else {
              gridArray[position] = color.toUpperCase();
            }
          }
        }
      }
    });
    return gridArray;
  };

  const getColor = (value: number | string): string => {
    if (typeof value === 'number') {
      return COLOR_PALETTE[value] || '#FFFFFF';
    }
    return value;
  };

  const sendBatch = async () => {
    if (isSendingBatch.current || batchQueue.current.length === 0) {
      return;
    }

    isSendingBatch.current = true;

    const batch = [...batchQueue.current];
    batchQueue.current = [];

    try {
      const response = await axios.post<BatchPlaceResponse>(`${WORKER_API_URL}/place-batch`, {
        pixels: batch.map(action => ({
          x: action.x,
          y: action.y,
          color: action.color
        }))
      });

      const data = response.data;

      if (!data.success) {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          batch.forEach(action => {
            const position = action.x * GRID_SIZE + action.y;
            if (position >= 0 && position < GRID_SIZE * GRID_SIZE) {
              newGrid[position] = action.previousColor;
            }
          });
          return newGrid;
        });
        setErrorMessage(data.message || 'Batch placing failed.');
        setTimeout(() => setErrorMessage(''), 5000);
      } else {
        setLastUpdate(data.timestamp);
      }
    } catch (error: any) {
      console.error('Error sending batch:', error);
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        batch.forEach(action => {
          const position = action.x * GRID_SIZE + action.y;
          if (position >= 0 && position < GRID_SIZE * GRID_SIZE) {
            newGrid[position] = action.previousColor;
          }
        });
        return newGrid;
      });

      if (error.response && error.response.status === 403) {
        setPlacingDisabled(true);
        setErrorMessage('Placing is currently disabled.');
        setTimeout(() => setErrorMessage(''), 5000);
      } else if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
        setTimeout(() => setErrorMessage(''), 5000);
      } else {
        setErrorMessage('An error occurred while placing the pixels.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } finally {
      isSendingBatch.current = false;
    }
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
        setErrorMessage('Failed to load the grid. Please try again later.');
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      }
    };

    fetchInitialData();

    // Start polling for changes every 90 seconds
    pollingInterval.current = setInterval(async () => {
      try {
        const response = await axios.get<GetChangesResponse>(`${WORKER_API_URL}/get-changes`, {
          params: { since: lastUpdate },
        });
        const data = response.data;
        const changes = data.changes;

        if (changes.length > 0) {
          const parsedChanges = changes.map(changeStr => {
            const [coords, colorTimestamp] = changeStr.split(':');
            const [color, timestampStr] = colorTimestamp.split(',');
            const [x, y] = coords.split(';').map(Number);
            const timestamp = parseInt(timestampStr, 10);
            return { x, y, color, timestamp };
          });

          setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            parsedChanges.forEach(change => {
              const { x, y, color } = change;
              const position = x * GRID_SIZE + y;
              if (position >= 0 && position < GRID_SIZE * GRID_SIZE) {
                if (color.toLowerCase() === 'white') {
                  newGrid[position] = 31;
                } else {
                  const colorIndex = parseInt(color, 10);
                  if (!isNaN(colorIndex) && COLOR_PALETTE[colorIndex]) {
                    newGrid[position] = colorIndex;
                  } else {
                    newGrid[position] = color.toUpperCase();
                  }
                }
              }
            });
            return newGrid;
          });

          // Update lastUpdate to the latest timestamp
          const latestTimestamp = parsedChanges.reduce((max, change) => {
            return change.timestamp > max ? change.timestamp : max;
          }, lastUpdate);
          setLastUpdate(latestTimestamp);
        }
      } catch (error) {
        console.error('Error fetching changes:', error);
        setErrorMessage('Failed to update the grid. Please check your connection.');
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      }
    }, 90000);

    // Automatic grid fetching every 15 seconds
    gridFetchInterval.current = setInterval(async () => {
      if (isFetchingGrid.current) return;
      isFetchingGrid.current = true;

      try {
        await sendBatch();

        const response = await axios.get(`${WORKER_API_URL}/grid`);
        const data = response.data;
        const fetchedGrid = parseGridString(data.grid);
        setGrid(fetchedGrid);
        setLastUpdate(parseInt(data.lastUpdate, 10));
        if (data.placingDisabled !== undefined) {
          setPlacingDisabled(data.placingDisabled);
        }
      } catch (error) {
        console.error('Error fetching grid:', error);
        setErrorMessage('Failed to fetch the grid.');
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      } finally {
        isFetchingGrid.current = false;
      }
    }, 15000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      if (gridFetchInterval.current) {
        clearInterval(gridFetchInterval.current);
      }
    };
  }, [lastUpdate]);

  const handlePlacePixel = (x: number, y: number) => {
    if (placingDisabled) return;

    const position = x * GRID_SIZE + y;
    const previousColor = grid[position];
    const selectedColorValue = COLOR_PALETTE[selectedColor];

    // Update grid immediately
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      if (selectedColorValue.toLowerCase() === 'white') {
        newGrid[position] = 31;
      } else {
        newGrid[position] = selectedColor;
      }
      return newGrid;
    });

    // Add action to batch queue
    batchQueue.current.push({
      x,
      y,
      color: selectedColorValue,
      previousColor,
    });

    // Reset the batch timer
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
    }

    batchTimer.current = setTimeout(() => {
      sendBatch();
    }, 10000); // 10 seconds
  };

  const adminPanelVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdminLogin();
  };

  const handleAdminLogin = async () => {
    try {
      const response = await axios.post<AdminLoginResponse>(`${WORKER_API_URL}/admin-login`, { password: adminPassword });
      const data = response.data;
      if (data.success) {
        setIsAdmin(true);
        setShowLoginModal(false);
        setLoginError('');
      } else {
        setLoginError(data.message || 'Login failed');
        setTimeout(() => {
          setLoginError('');
        }, 5000);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError('An unexpected error occurred.');
      setTimeout(() => {
        setLoginError('');
      }, 5000);
    }
  };

  const togglePlacing = async () => {
    if (!isAdmin) return;

    try {
      const response = await axios.post<TogglePlacingResponse>(`${WORKER_API_URL}/toggle-placing`, { password: adminPassword });
      const data = response.data;
      if (data.success) {
        setPlacingDisabled(data.placingDisabled);
      } else {
        console.error('Toggle placing failed.');
        setErrorMessage('Failed to toggle placing status.');
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error toggling placing status:', error);
      setErrorMessage('An error occurred while toggling placing status.');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  const clearGrid = async () => {
    if (!isAdmin) return;

    try {
      const response = await axios.post<{ success: boolean; message: string }>(`${WORKER_API_URL}/clear-grid`, { password: adminPassword });
      const data = response.data;
      if (data.success) {
        const clearedGrid = Array(GRID_SIZE * GRID_SIZE).fill(31);
        setGrid(clearedGrid);
        setLastUpdate(Date.now());
        setErrorMessage('');
      } else {
        console.error(data.message);
        setErrorMessage(data.message || 'Failed to clear the grid.');
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error clearing grid:', error);
      setErrorMessage('An error occurred while clearing the grid.');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminPassword('');
  };

  const handleTitleClick = () => {
    setClickCount(prevCount => prevCount + 1);
  };

  useEffect(() => {
    if (clickCount >= 10) {
      setShowLoginModal(true);
      setClickCount(0);
    }
  }, [clickCount]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-start justify-center p-4 mt-20 space-y-6 md:space-x-6 md:space-y-0 bg-gray-800">
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
          gridGap: '0px',
          backgroundColor: '#000',
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
          className="text-lg mb-4 select-none cursor-pointer text-white"
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
              className="border rounded px-2 py-1 text-black"
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
                  }, 5000);
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
                  setErrorMessage('');
                } catch (error) {
                  console.error('Error refreshing grid:', error);
                  setErrorMessage('Failed to refresh the grid.');
                  setTimeout(() => {
                    setErrorMessage('');
                  }, 5000);
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
