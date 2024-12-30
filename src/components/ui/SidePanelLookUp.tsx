import { useState, useEffect } from "react";
import { getDatabase, ref, get, onValue } from "firebase/database";

const SidePanelLookUp = ({ onJumpToCoords }: { onJumpToCoords: (x: number, y: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lookupUsername, setLookupUsername] = useState("");
  const [pixelsPlaced, setPixelsPlaced] = useState<{ x: number; y: number }[]>([]);
  const [userCursor, setUserCursor] = useState<{ x: number; y: number } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const db = getDatabase();

  const customAlert = (text: string) => {
    setAlertMessage(text);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleLookupUser = async () => {
    if (!lookupUsername.trim()) {
        customAlert("Please enter a username to look up");
        return;
    }

    const normalizedUsername = lookupUsername.toLowerCase();
    const canvasRef = ref(db, "canvas");
    const cursorRef = ref(db, `users/${normalizedUsername}/cursor`);

    try {
        const canvasSnapshot = await get(canvasRef);
        const canvasData: Record<string, any> | null = canvasSnapshot.val();

        if (canvasData) {
            const userPixels = Object.entries(canvasData)
                .filter(([, pixel]) => pixel.placedBy === normalizedUsername)
                .map(([, pixel]) => ({
                    x: pixel.x,
                    y: pixel.y,
                    timestamp: pixel.timestamp || 0,
                }))
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 100); // 100 most recent pixels

            if (userPixels.length > 0) {
                setPixelsPlaced(userPixels);
                customAlert(`Showing the 100 most recent pixels placed by ${lookupUsername}.`);
            } else {
                setPixelsPlaced([]);
                customAlert("No pixels found for this user");
            }
        } else {
            setPixelsPlaced([]);
            customAlert("No canvas data available");
        }

        // Listen for cursor updates
        onValue(cursorRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserCursor(snapshot.val());
            } else {
                setUserCursor(null);
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        customAlert("An error occurred while looking up the user");
    }
  };

  // Toggle panel
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientX >= window.innerWidth - 50) {
        setIsOpen(true);
      } else if (event.clientX < window.innerWidth - 330) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={`side-panel bg-gray-900 w-80 h-full z-10 fixed right-0 text-white backdrop-blur-md bg-opacity-70 ${
        isOpen ? "open" : "closed"
      }`}
      style={{
        transition: "transform 0.3s ease-in-out",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
      }}
    >
      <div className="panel-content flex flex-col h-full p-6 pt-12">
        <h2 className="text-lg font-bold mb-4">User Lookup</h2>

        {/* Alert Message */}
        {alertMessage && (
          <div className="mb-4 p-2 rounded bg-blue-600 text-white text-sm">
            {alertMessage}
          </div>
        )}

        {/* Lookup Form */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter username"
            value={lookupUsername}
            onChange={(e) => setLookupUsername(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-gray-200 mb-4"
          />
          <button
            onClick={handleLookupUser}
            className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold"
          >
            Search
          </button>
        </div>

        {/* Results */}
        <div className="flex-grow overflow-y-auto mb-4">
          {pixelsPlaced.length > 0 ? (
            <ul className="space-y-2">
              {pixelsPlaced.map((pixel, index) => (
                <li
                  key={index}
                  className="p-3 rounded bg-gray-800 hover:bg-gray-700 transition-all shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        ({pixel.x}, {pixel.y})
                      </p>
                    </div>
                    <button
                      onClick={() => onJumpToCoords(pixel.x, pixel.y)}
                      className="py-1 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      Jump
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No results found.</p>
          )}
        </div>

        {/* User Cursor Location */}
        <div className="p-3 rounded bg-gray-800">
        {userCursor ? (
            <div className="flex justify-between items-center">
            <p className="text-sm text-gray-300">
                <strong>Cursor:</strong> ({userCursor.x}, {userCursor.y})
            </p>
            <button
                onClick={() => onJumpToCoords(userCursor.x, userCursor.y)}
                className="py-1 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
            >
                Jump
            </button>
            </div>
        ) : (
            <p className="text-sm text-gray-400">Cursor location unavailable.</p>
        )}
        </div>
      </div>
    </div>
  );
};

export default SidePanelLookUp;