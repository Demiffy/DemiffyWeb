import { useState, useEffect } from "react";
import { getDatabase, ref, get, onValue } from "firebase/database";

interface Pixel {
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

interface LookedUpUser {
  username: string;
  pfpurl: string;
  pixelsCount: number;
}

const colors = [
  '#6d001a', '#be0039', '#ff4500', '#ffa800', '#ffd635', '#fff8b8',
  '#00a368', '#00cc78', '#7eed56', '#00756f', '#009eaa', '#00ccc0',
  '#2450a4', '#3690ea', '#51e9f4', '#493ac1', '#6a5cff', '#94b3ff',
  '#811e9f', '#b44ac0', '#e4abff', '#de107f', '#ff3881', '#ff99aa',
  '#6d482f', '#9c6926', '#ffb470', '#000000', '#515252', '#898d90',
  '#d4d7d9', '#ffffff',
];

const SidePanelLookUp = ({ onJumpToCoords }: { onJumpToCoords: (x: number, y: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lookupUsername, setLookupUsername] = useState("");
  const [pixelsPlaced, setPixelsPlaced] = useState<Pixel[]>([]);
  const [userCursor, setUserCursor] = useState<{ x: number; y: number } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [lookedUpUser, setLookedUpUser] = useState<LookedUpUser | null>(null);

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
    const userRef = ref(db, `users/${normalizedUsername}`);

    try {
      const [canvasSnapshot, userSnapshot] = await Promise.all([get(canvasRef), get(userRef)]);
      const canvasData: Record<string, any> | null = canvasSnapshot.val();
      const userData: any = userSnapshot.val();

      if (canvasData) {
        const allUserPixels = Object.entries(canvasData).filter(
          ([, pixel]) => pixel.placedBy === normalizedUsername
        );
        const totalUserPixelsCount = allUserPixels.length;

        // Get the 100 most recent pixels
        const recentUserPixels = allUserPixels
          .map(([, pixel]) => ({
            x: pixel.x,
            y: pixel.y,
            color: pixel.color || "NULL",
            timestamp: pixel.timestamp || 0,
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 100);


        if (recentUserPixels.length > 0) {
          setPixelsPlaced(recentUserPixels);
          customAlert(`Showing the 100 most recent pixels placed by ${lookupUsername}.`);
        } else {
          setPixelsPlaced([]);
          customAlert("No pixels found for this user");
        }

        setLookedUpUser({
          username: lookupUsername,
          pfpurl: userData?.pfpurl || "",
          pixelsCount: totalUserPixelsCount,
        });
      } else {
        setPixelsPlaced([]);
        customAlert("No canvas data available");
      }

      // Listen for cursor updates for the looked up user
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
      className={`side-panel bg-primary-color w-80 h-full z-10 fixed right-0 text-white backdrop-blur-md bg-opacity-70 select-none ${
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
            className="w-full p-2 rounded bg-secondary-color text-gray-200 mb-4"
          />
          <button
            onClick={handleLookupUser}
            className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold"
          >
            Search
          </button>
        </div>

        {/* Looked Up User Info */}
        {lookedUpUser && (
          <div className="mb-4 p-3 rounded bg-secondary-color flex items-center space-x-4">
            {lookedUpUser.pfpurl ? (
              <img
                src={lookedUpUser.pfpurl}
                alt={`${lookedUpUser.username}'s profile`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-500" />
            )}
            <div>
              <p className="font-bold">{lookedUpUser.username}</p>
              <p className="text-sm text-gray-300">
                Pixels Placed: {lookedUpUser.pixelsCount}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-grow overflow-y-auto mb-4">
          {pixelsPlaced.length > 0 ? (
            <ul className="space-y-2">
              {pixelsPlaced.map((pixel, index) => (
                <li
                  key={index}
                  className="p-3 rounded bg-secondary-color transition-all shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-300">
                        {pixel.x}, {pixel.y}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center">
                      <strong>Color:</strong>
                        <span
                          className="inline-block ml-2 w-4 h-4 rounded"
                          style={{
                            backgroundColor: colors[Number(pixel.color)] || '#000000',
                            verticalAlign: 'middle',
                          }}
                        ></span>
                      </p>
                      <p className="text-sm text-gray-400">
                        Placed: {new Date(pixel.timestamp).toLocaleString()}
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
        <div className="p-3 rounded bg-secondary-color">
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