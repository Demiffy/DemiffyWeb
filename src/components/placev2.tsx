// PlaceV2.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import SidePanel from './ui/SidePanel';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "demiffycom.firebaseapp.com",
  databaseURL: "https://demiffycom-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "demiffycom",
  storageBucket: "demiffycom.firebasestorage.app",
  messagingSenderId: "423608998435",
  appId: "1:423608998435:web:1ee3cc6b9408777fbdaf96",
  measurementId: "G-9DVS3F5QST",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const colors = [
  '#6d001a', '#be0039', '#ff4500', '#ffa800', '#ffd635', '#fff8b8',
  '#00a368', '#00cc78', '#7eed56', '#00756f', '#009eaa', '#00ccc0',
  '#2450a4', '#3690ea', '#51e9f4', '#493ac1', '#6a5cff', '#94b3ff',
  '#811e9f', '#b44ac0', '#e4abff', '#de107f', '#ff3881', '#ff99aa',
  '#6d482f', '#9c6926', '#ffb470', '#000000', '#515252', '#898d90',
  '#d4d7d9', '#ffffff',
];

const pixelSize = 20;

const PlaceV2: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [user, setUser] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState<number>(31);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);

  // Zoom limits
  const MIN_SCALE = 0.4;
  const MAX_SCALE = 5;

  // Handle sign-in from the SidePanel
  const handleSignIn = (username: string) => {
    setUser(username);
  };

  // FPS Tracking
  const [fps, setFps] = useState<number>(0);
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateFps = () => {
      frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(updateFps);
    };

    updateFps();
  }, []);

  // State for viewport size
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update viewport size on window resize
  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Initialize offset to center (0,0) at the center of the canvas
  useEffect(() => {
    const initializeCanvas = () => {
      setOffset({ x: viewport.width / 2, y: viewport.height / 2 });
      drawCanvas([]);
    };

    initializeCanvas();
  }, [viewport.width, viewport.height]);

  // Fetch and draw canvas data from Firebase
  useEffect(() => {
    const canvasReference = ref(db, 'canvas');
    const unsubscribe = onValue(canvasReference, (snapshot) => {
      const data = snapshot.val();
      const canvasData = data ? Object.values(data) : [];
      drawCanvas(canvasData, hoveredPixel);
    });
  
    return () => unsubscribe();
  }, [offset, scale, hoveredPixel]);  

  // Draw the canvas
  const drawCanvas = useCallback(
    (canvasData: any[], hoveredPixel?: { x: number; y: number } | null) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, viewport.width, viewport.height);
  
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        const adjustedPixelSize = pixelSize + (scale < 1 ? 1 / scale : 0);
  
        canvasData.forEach((pixel: any) => {
          const x = pixel.x * pixelSize;
          const y = pixel.y * pixelSize;
          ctx.fillStyle = colors[pixel.color];
          ctx.fillRect(x, y, adjustedPixelSize, adjustedPixelSize);
        });
        
        // Highlight hovered pixel
        if (hoveredPixel) {
          const highlightX = hoveredPixel.x * pixelSize;
          const highlightY = hoveredPixel.y * pixelSize;
        
          ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
          ctx.fillRect(
            highlightX,
            highlightY,
            adjustedPixelSize,
            adjustedPixelSize
          );
        
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
          ctx.lineWidth = 2 / scale;
          ctx.strokeRect(
            highlightX + 1 / scale,
            highlightY + 1 / scale,
            adjustedPixelSize - 2 / scale,
            adjustedPixelSize - 2 / scale
          );
        }
  
        // Lines > 1.1 zoom
        if (scale > 1.1) {
          ctx.strokeStyle = '#CCCCCC';
          ctx.lineWidth = 0.5 / scale;
  
          const startX = Math.floor((-offset.x / scale) / pixelSize) - 1;
          const endX = Math.floor((viewport.width - offset.x) / scale / pixelSize) + 1;
          const startY = Math.floor((-offset.y / scale) / pixelSize) - 1;
          const endY = Math.floor((viewport.height - offset.y) / scale / pixelSize) + 1;
  
          for (let x = startX; x <= endX; x++) {
            const posX = x * pixelSize;
            ctx.beginPath();
            ctx.moveTo(posX, startY * pixelSize);
            ctx.lineTo(posX, endY * pixelSize);
            ctx.stroke();
          }
  
          for (let y = startY; y <= endY; y++) {
            const posY = y * pixelSize;
            ctx.beginPath();
            ctx.moveTo(startX * pixelSize, posY);
            ctx.lineTo(endX * pixelSize, posY);
            ctx.stroke();
          }
        }
  
        ctx.restore();
      }
    }
  }, [offset, scale, viewport.height, viewport.width, pixelSize]);
  

  // Handle placing/removing a pixel
  const handleCanvasInteraction = async (x: number, y: number) => {
  if (!user) {
    alert("Please sign in to place pixels!");
    return;
  }

  const canvas = canvasRef.current;
  if (!canvas) return;

  const adjustedX = (x - offset.x) / scale;
  const adjustedY = (y - offset.y) / scale;

  const pixelX = Math.floor(adjustedX / pixelSize);
  const pixelY = Math.floor(adjustedY / pixelSize);

  try {
    const pixelRef = ref(db, `canvas/${pixelX}_${pixelY}`);
    await set(pixelRef, { x: pixelX, y: pixelY, color: selectedColor, placedBy: user });
  } catch (error) {
    console.error("Failed to place pixel:", error);
  }
};

  // Event handler mouse down
const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
  if ((event.button === 0 && event.ctrlKey) || event.button === 1) {
    event.preventDefault();
    setIsPanning(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  } else if (event.button === 0 && !event.ctrlKey) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    handleCanvasInteraction(x, y);
  }
};

// Event handler mouse move
const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const canvasX = (x - offset.x) / scale;
  const canvasY = (y - offset.y) / scale;
  setMouseCoords({ x: canvasX, y: canvasY });

  const pixelX = Math.floor(canvasX / pixelSize);
  const pixelY = Math.floor(canvasY / pixelSize);
  setHoveredPixel({ x: pixelX, y: pixelY });

  if (isPanning && lastMousePos) {
    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;
    setOffset((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setLastMousePos({ x: event.clientX, y: event.clientY });
  } else if (event.buttons === 1 && !event.ctrlKey) {
    handleCanvasInteraction(x, y);
  }
};

// Event handler mouse up
const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
  if ((event.button === 0 && isPanning) || event.button === 1) {
    setIsPanning(false);
    setLastMousePos(null);
  }
};

  // Handle zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Determine zoom direction
    const zoomFactor = 1.1;
    let newScale = scale;

    if (e.deltaY < 0) {
      // Zoom in
      newScale = scale * zoomFactor;
    } else {
      // Zoom out
      newScale = scale / zoomFactor;
    }

    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    const scaleRatio = newScale / scale;

    const newOffsetX = mouseX - scaleRatio * (mouseX - offset.x);
    const newOffsetY = mouseY - scaleRatio * (mouseY - offset.y);

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  }, [offset.x, offset.y, scale]);

  // Attach wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Prevent default context menu on middle click
  useEffect(() => {
    const preventDefault = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('contextmenu', preventDefault);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('contextmenu', preventDefault);
      }
    };
  }, []);

  return (
    <div className="h-screen bg-gray-900 text-white">
      {/* Side Panel */}
      <SidePanel onSignIn={handleSignIn} />
      {/* Main Canvas Area */}
      <div className="relative w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          width={viewport.width}
          height={viewport.height}
          className={`absolute top-0 left-0 w-full h-full ${
            isPanning ? 'cursor-grabbing' : 'cursor-crosshair'
          }`}
          style={{
            backgroundColor: colors[31],
            imageRendering: 'pixelated',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsPanning(false);
            setLastMousePos(null);
          }}
        />
  
        {/* Overlay Color Palette */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-opacity-70 p-4 rounded-xl text-white text-sm space-y-2 backdrop-blur-md max-w-fit shadow-lg">
          <div
            className="grid grid-flow-col auto-cols-max gap-2 justify-center items-center"
          >
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex justify-center items-center"
              >
                <div
                  className={`color-square w-11 h-11 rounded border transition-all ${
                    index === selectedColor
                      ? 'border-blue-500 border-4 shadow-lg shadow-blue-300 scale-110'
                      : 'border-gray-300 hover:border-gray-400 hover:scale-110 hover:shadow-md hover:shadow-gray-500 cursor-pointer'
                  }`}
                  style={{ backgroundColor: color, boxShadow: index === selectedColor ? '0px 0px 10px 2px rgba(59, 130, 246, 0.8)' : 'none' }}
                  onClick={() => setSelectedColor(index)}
                  aria-label={`Select color ${color}`}
                />
              </div>
            ))}
          </div>
        </div>
  
        {/* Coordinate and Zoom Display */}
        <div className="absolute top-12 right-6 bg-opacity-70 p-4 rounded-xl text-white text-sm space-y-2 backdrop-blur-md">
          <p className="flex items-center">
            <span className="font-bold mr-1">Coordinates:</span> 
            <span>X: {mouseCoords.x.toFixed(2)}, Y: {mouseCoords.y.toFixed(2)}</span>
          </p>
          <p className="flex items-center">
            <span className="font-bold mr-1">Zoom:</span> 
            <span>{scale.toFixed(2)}x</span>
          </p>
          <p className="flex items-center">
            <span className="font-bold mr-1">FPS:</span> 
            <span>{fps}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
export default PlaceV2;