import { useState, useEffect } from "react";

const SidePanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [pixelsPlaced, setPixelsPlaced] = useState(42); // Temporary pixels placed
  const [totalPixels] = useState(1000); // Temporary total pixels

  // Track time spent on the page
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnPage((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Detect mouse position relative to the left edge
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

  // Handle delete all pixels
  const handleDeleteAllPixels = () => {
    if (window.confirm("Are you sure you want to delete all your pixels?")) {
      setPixelsPlaced(0); // Temporary delete pixels
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
        {/* User Info Section */}
        <div className="user-info flex flex-col items-center justify-center py-14 border-b border-gray-700">
          <div
            className="avatar mb-4"
            style={{
              borderRadius: "50%",
              backgroundColor: "#334155",
              width: "60px",
              height: "60px",
            }}
          ></div>
          <h2 className="text-lg font-bold">JohnDoe</h2> {/* Temporary name */}
          <p className="text-sm text-blue-300">Developer</p> {/* Temporary role */}
          <p className="text-sm mt-2 text-gray-400">Time on page: {timeOnPage}s</p>
        </div>

        {/* Middle Section: Stats */}
        <div className="flex-grow px-4 py-6 text-center border-b border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Statistics</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-300">Pixels Placed By You:</p>
            <p className="text-2xl font-bold text-blue-500">{pixelsPlaced}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-300">Total Pixels Placed:</p>
            <p className="text-2xl font-bold text-green-500">{totalPixels}</p>
          </div>
          <button
            onClick={handleDeleteAllPixels}
            className="mt-4 py-2 px-4 w-full rounded bg-red-600 hover:bg-red-500 text-white font-bold"
          >
            Delete All My Pixels
          </button>
        </div>

        {/* Settings Section */}
        <div className="flex flex-col px-4 py-6 border-t border-gray-700">
          <h3 className="text-center text-lg font-semibold mb-4">Settings</h3>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
              Update Name:
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              className="w-full p-2 rounded bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="avatar" className="block text-sm text-gray-400 mb-1">
              Upload Avatar:
            </label>
            <input
              id="avatar"
              type="file"
              className="w-full p-2 rounded bg-gray-800 text-gray-200"
            />
          </div>
          <button className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold">
            Show Achievements
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;