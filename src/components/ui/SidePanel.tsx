import { useState, useEffect, useRef } from "react";
import { getDatabase, ref, get, update, onValue } from "firebase/database";

const SidePanel = ({
  userData,
  isSignedIn,
  onUpdateUsername,
  onTogglePixelInfo,
  isPixelInfoEnabled,
  onAchievementsButtonClick,
}: {
  userData: {
    username: string;
    role: string;
    timeOnPage: number;
    pfpurl: string;
  };
  onSignIn: (username: string) => void;
  isSignedIn: boolean;
  onUpdateUsername: (newUsername: string) => void;
  onTogglePixelInfo: () => void;
  isPixelInfoEnabled: boolean;
  onAchievementsButtonClick: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { username, role, pfpurl } = userData;
  const [updatedUsername, setUpdatedUsername] = useState<string>(username);
  const [updatedPfpUrl, setUpdatedPfpUrl] = useState<string>(pfpurl);
  const [pixelsPlaced, setPixelsPlaced] = useState(0);
  const [totalPixels, setTotalPixels] = useState(0);
  const [alertMessage, setAlertMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const db = getDatabase();

  const [timeOnPage, setTimeOnPage] = useState<number>(0);
  const timeOnPageRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Math.floor(Date.now() / 1000));

  const customAlert = (text: string, type: "success" | "error" | "info") => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  useEffect(() => {
    setUpdatedUsername(username);
    setUpdatedPfpUrl(pfpurl);
  }, [username, pfpurl]);

  const formatTimeOnPage = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let formattedTime = "";

    if (days > 0) formattedTime += `${days}d `;
    if (hours > 0 || days > 0) formattedTime += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) formattedTime += `${minutes}m `;
    formattedTime += `${remainingSeconds}s`;

    return formattedTime.trim();
  };

  const incrementTime = () => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - startTimeRef.current;
    const newTimeOnPage = timeOnPageRef.current + elapsed;
    setTimeOnPage(newTimeOnPage);
    timeOnPageRef.current = newTimeOnPage;
    startTimeRef.current = now;
  };

  // Track time spent on the page
  useEffect(() => {
    if (!isSignedIn) return;
    setTimeOnPage(userData.timeOnPage);
    timeOnPageRef.current = userData.timeOnPage;
    startTimeRef.current = Math.floor(Date.now() / 1000);

    const userRef = ref(db, `users/${userData.username}`);

    const localInterval = setInterval(incrementTime, 1000);
    const pushInterval = setInterval(() => {
      update(userRef, { timeOnPage: timeOnPageRef.current }).catch((error) => {
        console.error("Error updating timeOnPage:", error);
      });
    }, 10000);

    return () => {
      clearInterval(localInterval);
      clearInterval(pushInterval);
    };
  }, [db, userData.username, isSignedIn]);

// Detect mouse position
useEffect(() => {
  const handleMouseMove = (event: MouseEvent) => {
    if (event.clientX <= 50) {
      setIsOpen(true);
    } else if (event.clientX > 240) {
      setIsOpen(false);
    }
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
  };
}, [isSignedIn]);

  // Track total pixels and user pixels
  useEffect(() => {
    const canvasRef = ref(db, "canvas");
    const unsubscribe = onValue(canvasRef, (snapshot) => {
      const data: Record<string, any> | null = snapshot.val();
      if (data) {
        setTotalPixels(Object.keys(data).length);
        const userPixels = Object.values(data).filter(
          (pixel: any) => pixel.placedBy === username.toLowerCase()
        ).length;
        setPixelsPlaced(userPixels);
      } else {
        setTotalPixels(0);
        setPixelsPlaced(0);
      }
    });

    return () => unsubscribe();
  }, [db, username]);

  const handleDeleteAllPixels = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all your pixels?"
    );
    if (!confirmDelete) {
      return;
    }

    const canvasRef = ref(db, "canvas");

    try {
      const snapshot = await get(canvasRef);
      const canvasData: Record<string, any> | null = snapshot.val();

      if (canvasData) {
        const updates: Record<string, null> = {};
        Object.entries(canvasData).forEach(([key, value]) => {
          if (value.placedBy === username) {
            updates[key] = null;
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(canvasRef, updates);
          customAlert("All your pixels have been deleted!", "success");
        } else {
          customAlert("No pixels found to delete!", "info");
        }
      } else {
        customAlert("No canvas data found!", "info");
      }
    } catch (error) {
      console.error("Failed to delete pixels:", error);
      customAlert("Error deleting pixels. Please try again.", "error");
    }
  };

  const handleUpdateProfilePicture = async (newPfpUrl: string) => {
    if (!newPfpUrl.trim()) {
      customAlert("Please enter a valid URL!", "error");
      return;
    }

    try {
      const userRef = ref(db, `users/${username}`);
      await update(userRef, { pfpurl: newPfpUrl });
      setUpdatedPfpUrl(newPfpUrl);
      customAlert("Profile picture updated!", "success");
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      customAlert("Error updating profile picture. Try again!", "error");
    }
  };

  const handleUpdateUsername = async (newUsername: string) => {
    const normalizedNewUsername = newUsername.trim().toLowerCase();

    if (!normalizedNewUsername) {
        customAlert("Please enter a valid username!", "error");
        setUpdatedUsername(userData.username);
        return;
    }

    if (normalizedNewUsername === userData.username.toLowerCase()) {
        customAlert("This is already your username!", "info");
        return;
    }

    try {
        await onUpdateUsername(normalizedNewUsername);

        setUpdatedUsername(normalizedNewUsername);

        customAlert("Username updated successfully!", "success");
    } catch (error) {
        console.error("Failed to update username:", error);
        customAlert("An error occurred while updating your username. Please try again.", "error");
        setUpdatedUsername(userData.username);
    }
};

  return (
    <div
      className={`side-panel bg-primary-color w-60 h-full z-10 fixed text-white backdrop-blur-md bg-opacity-70 select-none ${
        isOpen ? "open" : "closed"
      }`}
      style={{
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <div className="panel-content flex flex-col h-full">
        <div className="user-info flex flex-col items-center justify-center py-14 border-b border-gray-700">
          <img
            src={updatedPfpUrl}
            alt={`${username}'s profile`}
            className="avatar mb-4"
            style={{
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              objectFit: "cover",
            }}
          />
          <h2 className="text-lg font-bold">{username}</h2>
          <p className="text-sm text-blue-300">{role}</p>
          <p className="text-sm mt-2 text-gray-400">
            {formatTimeOnPage(timeOnPage)}
          </p>
        </div>
        <div className="flex-grow px-4 py-6 text-center border-b border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Statistics</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-300">Pixels Placed By You</p>
            <p className="text-2xl font-bold text-blue-500">{pixelsPlaced}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-300">Total Pixels Placed</p>
            <p className="text-2xl font-bold text-green-500">{totalPixels}</p>
          </div>
          <button
            onClick={handleDeleteAllPixels}
            className="mt-4 py-2 px-4 w-full rounded bg-red-600 hover:bg-red-500 text-white font-bold"
          >
            Delete All My Pixels
          </button>
        </div>
        <div className="flex flex-col px-4 py-6 border-t border-gray-700">
          <h3 className="text-center text-lg font-semibold mb-4">Settings</h3>
          {alertMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                alertMessage.type === "success"
                  ? "bg-green-600"
                  : alertMessage.type === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
              } text-white text-sm`}
            >
              {alertMessage.text}
            </div>
          )}

          {/* Pixel Info Toggle */}
          <div className="mb-4">
            <label
              htmlFor="togglePixelInfo"
              className="block text-sm text-gray-400 mb-1"
            >
              Pixel Info:
            </label>
            <button
              id="togglePixelInfo"
              onClick={onTogglePixelInfo}
              className={`w-full py-2 rounded ${
                isPixelInfoEnabled
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-gray-600 hover:bg-gray-500"
              } text-white font-bold`}
            >
              {isPixelInfoEnabled ? "Disable Pixel Info" : "Enable Pixel Info"}
            </button>
          </div>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm text-gray-400 mb-1"
            >
              Update Name:
            </label>
            <input
            id="name"
            type="text"
            placeholder="Enter new username"
            value={updatedUsername}
            className="w-full p-2 rounded bg-secondary-color text-gray-200"
            onChange={(e) => setUpdatedUsername(e.target.value)}
            onBlur={() => handleUpdateUsername(updatedUsername)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdateUsername(updatedUsername);
            }}
          />
          </div>
          <div className="mb-4">
            <label
              htmlFor="avatar"
              className="block text-sm text-gray-400 mb-1"
            >
              Update Profile Picture URL:
            </label>
            <input
              id="avatar"
              type="text"
              placeholder="Enter new profile picture URL"
              value={updatedPfpUrl}
              className="w-full p-2 rounded bg-secondary-color text-gray-200"
              onChange={(e) => setUpdatedPfpUrl(e.target.value)}
              onBlur={() => handleUpdateProfilePicture(updatedPfpUrl)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateProfilePicture(updatedPfpUrl);
              }}
            />
          </div>
          <button 
          onClick={onAchievementsButtonClick}
          className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold">
            Achievements
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;