// ZoomedView.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import SidePanelLookUp from './ui/SidePanelLookUp';

const db = getDatabase();

const colors = [
  '#6d001a', '#be0039', '#ff4500', '#ffa800', '#ffd635', '#fff8b8',
  '#00a368', '#00cc78', '#7eed56', '#00756f', '#009eaa', '#00ccc0',
  '#2450a4', '#3690ea', '#51e9f4', '#493ac1', '#6a5cff', '#94b3ff',
  '#811e9f', '#b44ac0', '#e4abff', '#de107f', '#ff3881', '#ff99aa',
  '#6d482f', '#9c6926', '#ffb470', '#000000', '#515252', '#898d90',
  '#d4d7d9', '#ffffff',
];

const pixelSize = 20;

const ZoomedOutView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoomScale] = useState<number>(0.05); // 0.1x zoom

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [canvasData, setCanvasData] = useState<any[]>([]);

  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);

  const [onlinePlayers, setOnlinePlayers] = useState<number>(0);

  const [pickerX, setPickerX] = useState<number>(0);
  const [pickerY, setPickerY] = useState<number>(0);

  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: viewport.width / 2,
    y: viewport.height / 2,
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setOffset({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    };

    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const canvasReference = ref(db, 'canvas');
    const unsubscribe = onValue(canvasReference, (snapshot) => {
      const data = snapshot.val();
      const newCanvasData = data ? Object.values(data) : [];
      setCanvasData(newCanvasData);
    });

    return () => unsubscribe();
  }, []);

  // Draw the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        ctx.translate(offset.x, offset.y);
        ctx.scale(zoomScale, zoomScale);

        canvasData.forEach((pixel: any) => {
          if (pixel.color === -1) return;

          const x = pixel.x * pixelSize;
          const y = pixel.y * pixelSize;
          ctx.fillStyle = colors[pixel.color];
          ctx.fillRect(x, y, pixelSize, pixelSize);
        });
        ctx.restore();
      }
    }
  }, [canvasData, hoveredPixel, zoomScale, offset]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle mouse movement over the canvas
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const canvasX = (x - offset.x) / zoomScale;
    const canvasY = (y - offset.y) / zoomScale;

    const pixelX = Math.floor(canvasX / pixelSize);
    const pixelY = Math.floor(canvasY / pixelSize);

    setHoveredPixel({ x: pixelX, y: pixelY });
  };

  // Handle mouse leaving the canvas
  const handleMouseLeave = () => {
    setHoveredPixel(null);
  };

  // Coordinate Picker Handler to center selected pixel
  const handleCoordinateJump = () => {
    setOffset({
      x: viewport.width / 2 - pickerX * pixelSize * zoomScale,
      y: viewport.height / 2 - pickerY * pixelSize * zoomScale,
    });

    customAlert(`Centered on Coordinates: (${pickerX}, ${pickerY})`, "info");
  };

  const customAlert = (text: string, type: "success" | "error" | "info" | "tip") => {
    alert(`${type.toUpperCase()}: ${text}`);
  };



  // Listen for online players from Firebase
  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      if (users) {
        const onlineCount = Object.values(users).filter(
          (user: any) => user.online === true
        ).length;
        setOnlinePlayers(onlineCount);
      } else {
        setOnlinePlayers(0);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen bg-gray-900 text-white">
      <SidePanelLookUp
        onJumpToCoords={(x, y) => {
          setPickerX(x);
          setPickerY(y);
          handleCoordinateJump();
        }}
      />

      {/* Main Canvas */}
      <div className="relative w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          width={viewport.width}
          height={viewport.height}
          className="absolute top-0 left-0 w-full h-full cursor-default"
          style={{
            backgroundColor: colors[31],
            imageRendering: "pixelated",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Coordinate Picker */}
        <div className="absolute top-6 left-6 bg-opacity-70 p-4 rounded-xl text-white text-sm space-y-2 backdrop-blur-md max-w-xs shadow-lg">
          <h3 className="text-sm font-semibold mb-2">Coordinate Picker</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="X Coord"
              value={pickerX}
              onChange={(e) => setPickerX(parseInt(e.target.value, 10) || 0)}
              className="w-1/2 p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Y Coord"
              value={pickerY}
              onChange={(e) => setPickerY(parseInt(e.target.value, 10) || 0)}
              className="w-1/2 p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCoordinateJump}
            className="w-full py-1 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
          >
            Jump to Coordinates
          </button>
        </div>

        {/* Online Players Display */}
        <div className="absolute bottom-10 right-6 bg-opacity-70 p-2 rounded-lg text-zinc-800 text-xs backdrop-blur-md">
          <p className="flex items-center">
            <span className="font-bold mr-1">Online:</span>
            <span className='text-gray-500'>{onlinePlayers}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZoomedOutView;