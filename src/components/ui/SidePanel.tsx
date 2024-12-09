import { useState, useEffect } from "react";
import { getDatabase, ref, set, get, update, onValue } from "firebase/database";

const SidePanel = ({ onSignIn }: { onSignIn: (username: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [profilePicture, setProfilePicture] = useState(
    "https://demiffy.com/defaultuser.png"
  );
  const [pixelsPlaced, setPixelsPlaced] = useState(0);
  const [totalPixels, setTotalPixels] = useState(0);
  const [role, setRole] = useState("Guest");
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const db = getDatabase();


  const customAlert = (text: string, type: "success" | "error" | "info") => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // Track time spent on the page
  useEffect(() => {
    let localInterval: NodeJS.Timeout | null = null;
    let pushInterval: NodeJS.Timeout | null = null;

    if (isSignedIn) {
      localInterval = setInterval(() => {
        setTimeOnPage((prev) => prev + 1);
      }, 1000);

      pushInterval = setInterval(() => {
        const userRef = ref(db, `users/${username}`);
        setTimeOnPage((prev) => {
          update(userRef, { timeOnPage: prev }).catch((error) => {
            console.error("Failed to update timeOnPage:", error);
          });
          return prev;
        });
      }, 60000);
    }

    return () => {
      if (localInterval) clearInterval(localInterval);
      if (pushInterval) clearInterval(pushInterval);
    };
  }, [isSignedIn, username, db]);

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
  }, []);

  const formatTimeOnPage = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    let formattedTime = "";
  
    if (days > 0) {
      formattedTime += `${days}d `;
    }
    if (hours > 0 || days > 0) {
      formattedTime += `${hours}h `;
    }
    if (minutes > 0 || hours > 0 || days > 0) {
      formattedTime += `${minutes}m `;
    }
    formattedTime += `${remainingSeconds}s`;
  
    return formattedTime.trim();
  };
  
  const handleSignIn = async () => {
    if (!username.trim()) {
      customAlert("Please enter a valid name!", "error");
      return;
    }

    const normalizedUsername = username.toLowerCase();
    const userRef = ref(db, `users/${normalizedUsername}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      try {
        await set(userRef, {
          role: "Guest",
          timeOnPage: 0,
          pfpurl: "https://demiffy.com/defaultuser.png",
        });
      } catch (error) {
        console.error("Error setting user data:", error);
        customAlert("Failed to sign in. Please try again.", "error");
        return;
      }
    }

    const userData: Record<string, any> | null = snapshot.exists() ? snapshot.val() : null;

    if (userData) {
      setTimeOnPage(userData.timeOnPage || 0);
      setProfilePicture(userData.pfpurl || "https://demiffy.com/defaultuser.png");
      setRole(userData.role || "Guest");
    } else {
      setProfilePicture("https://demiffy.com/defaultuser.png");
      setRole("Guest");
    }

    setIsSignedIn(true);
    onSignIn(normalizedUsername);
};

  // Track total pixels and user pixels
  useEffect(() => {
    const canvasRef = ref(db, "canvas");

    const unsubscribe = onValue(canvasRef, (snapshot) => {
      const data: Record<string, any> | null = snapshot.val();
      if (data) {
        setTotalPixels(Object.keys(data).length);

        const userPixels = Object.values(data).filter(
          (pixel: any) => pixel.placedBy === username
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
    if (!isSignedIn) {
      customAlert("You need to sign in to delete pixels!", "error");
      return;
    }
  
    const confirmDelete = window.confirm("Are you sure you want to delete all your pixels?");
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

  // Handle profile picture update
  const handleUpdateProfilePicture = async (newPfpUrl: string) => {
    if (!newPfpUrl.trim()) {
      alert("Please enter a valid URL!");
      return;
    }

    try {
      const userRef = ref(db, `users/${username}`);
      await update(userRef, { pfpurl: newPfpUrl });
      setProfilePicture(newPfpUrl);
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
  };

  const handleUpdateUsername = async (newUsername: string) => {
    const normalizedNewUsername = newUsername.trim().toLowerCase();

    if (!normalizedNewUsername) {
        customAlert("Please enter a valid username!", "error");
        setUsername(username);
        return;
    }

    if (normalizedNewUsername === username.toLowerCase()) {
        return;
    }

    try {
        const newUserRef = ref(db, `users/${normalizedNewUsername}`);
        const newUserSnapshot = await get(newUserRef);

        if (newUserSnapshot.exists()) {
            customAlert("This username is already taken. Please choose another.", "error");
            setUsername(username);
            return;
        }

        const currentUserRef = ref(db, `users/${username.toLowerCase()}`);
        const currentUserData = (await get(currentUserRef)).val();

        if (!currentUserData) {
            customAlert("No user data found to update!", "error");
            setUsername(username);
            return;
        }

        const { pixelsPlaced, ...newUserData } = currentUserData;

        await set(newUserRef, { ...newUserData });
        await set(currentUserRef, null);

        setUsername(newUsername);
        onSignIn(normalizedNewUsername);
        customAlert("New username set!", "info");
    } catch (error) {
        console.error("Failed to update username:", error);
        customAlert("An error occurred while updating your username. Please try again.", "error");
        setUsername(username);
    }
};
  
  return (
    <div
      className={`side-panel bg-gray-900 w-60 h-full z-10 fixed text-white backdrop-blur-md bg-opacity-70 ${
        isOpen ? "open" : "closed"
      }`}
      style={{
        transition: "transform 0.3s ease-in-out",
      }}
    >
        
      <div className="panel-content flex flex-col h-full">
        {!isSignedIn ? (
          <div className="flex flex-col px-4 py-14">
            <h3 className="text-center text-lg font-semibold mb-4">Sign In</h3>
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              onClick={handleSignIn}
              className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="user-info flex flex-col items-center justify-center py-14 border-b border-gray-700">
              <img
                src={profilePicture}
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
              <p className="text-sm mt-2 text-gray-400">{formatTimeOnPage(timeOnPage)}</p>
            </div>

            {/* Stats */}
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

           {/* Settings */}
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

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
                  Update Name:
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter new username"
                  className="w-full p-2 rounded bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={username}
                  onBlur={(e) => handleUpdateUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateUsername(e.currentTarget.value);
                  }}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="avatar" className="block text-sm text-gray-400 mb-1">
                  Update Profile Picture URL:
                </label>
                <input
                  id="avatar"
                  type="text"
                  placeholder="Enter new profile picture URL"
                  className="w-full p-2 rounded bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={profilePicture}
                  onBlur={(e) => handleUpdateProfilePicture(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateProfilePicture(e.currentTarget.value);
                  }}
                />
              </div>
              <button className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold">
                Show Achievements
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SidePanel;