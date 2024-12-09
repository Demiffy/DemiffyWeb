// PlaceV2.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';

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

// Define the color palette
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

  // State for selected color
  const [selectedColor, setSelectedColor] = useState<number>(31);

  // State for panning and zooming
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null);

  // State for mouse coordinates
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Zoom limits
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  // State for viewport size
  const [viewport, setViewport] = useState({
    width: window.innerWidth - 100,
    height: window.innerHeight,
  });

  // Update viewport size on window resize
  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth - 100,
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
      drawCanvas(canvasData);
    });

    return () => unsubscribe();
  }, [offset, scale]);

  // Function to draw the canvas
  const drawCanvas = useCallback((canvasData: any[]) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;

        // Clear the visible area
        ctx.clearRect(0, 0, viewport.width, viewport.height);

        // Apply transformations: translate and scale
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        // Draw grid lines (optional)
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 0.5 / scale;

        // Determine visible range based on panning and scaling
        const startX = Math.floor((-offset.x / scale) / pixelSize) - 1;
        const endX = Math.floor((viewport.width - offset.x) / scale / pixelSize) + 1;
        const startY = Math.floor((-offset.y / scale) / pixelSize) - 1;
        const endY = Math.floor((viewport.height - offset.y) / scale / pixelSize) + 1;

        // Draw vertical grid lines
        for (let x = startX; x <= endX; x++) {
          const posX = x * pixelSize;
          ctx.beginPath();
          ctx.moveTo(posX, startY * pixelSize);
          ctx.lineTo(posX, endY * pixelSize);
          ctx.stroke();
        }

        // Draw horizontal grid lines
        for (let y = startY; y <= endY; y++) {
          const posY = y * pixelSize;
          ctx.beginPath();
          ctx.moveTo(startX * pixelSize, posY);
          ctx.lineTo(endX * pixelSize, posY);
          ctx.stroke();
        }

        // Draw each pixel within the visible range
        canvasData.forEach((pixel: any) => {
          ctx.fillStyle = colors[pixel.color];
          ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
        });

        // Draw a large black block at the center (0,0)
        const blockSize = 20;
        ctx.fillStyle = 'black';
        ctx.fillRect(-blockSize / 2, -blockSize / 2, blockSize, blockSize);

        ctx.restore();
      }
    }
  }, [offset, scale, viewport.height, viewport.width]);

  // Function to handle placing/removing a pixel
  const handleCanvasInteraction = async (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const adjustedX = (x - offset.x) / scale;
    const adjustedY = (y - offset.y) / scale;

    const pixelX = Math.floor(adjustedX / pixelSize);
    const pixelY = Math.floor(adjustedY / pixelSize);

    try {
      const pixelRef = ref(db, `canvas/${pixelX}_${pixelY}`);
      if (selectedColor === 31) {
        await remove(pixelRef);
      } else {
        await set(pixelRef, { x: pixelX, y: pixelY, color: selectedColor });
      }
    } catch (error) {
      console.error('Failed to place pixel:', error);
    }
  };

  // Event handler for mouse down
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (event.button === 1) {
      event.preventDefault();
      setIsPanning(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    } else if (event.button === 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      handleCanvasInteraction(x, y);
    }
  };

  // Event handler for mouse move
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate mouse position relative to the canvas and account for offset and scale
    const canvasX = (x - offset.x) / scale;
    const canvasY = (y - offset.y) / scale;
    setMouseCoords({ x: canvasX, y: canvasY });

    if (isPanning && lastMousePos) {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;
      setOffset((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastMousePos({ x: event.clientX, y: event.clientY });
    } else if (event.buttons === 1) {
      handleCanvasInteraction(x, y);
    }
  };

  // Event handler for mouse up
  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (event.button === 1) {
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

    // Clamp the new scale
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    // Calculate the scale ratio
    const scaleRatio = newScale / scale;

    // Adjust the offset to keep the mouse position stable
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
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar for Color Palette */}
      <div className="w-24 bg-gray-800 flex flex-col items-center p-2 space-y-2">
        <h1 className="text-lg font-bold mb-4">Colors</h1>
        {colors.map((color, index) => (
          <button
            key={index}
            style={{ backgroundColor: color }}
            className={`w-8 h-8 rounded border ${
              index === selectedColor ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setSelectedColor(index)}
          />
        ))}
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={viewport.width}
          height={viewport.height}
          className={`absolute top-0 left-0 ${
            isPanning ? 'cursor-grabbing' : 'cursor-crosshair'
          }`}
          style={{
            backgroundColor: colors[31],
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setIsPanning(false); setLastMousePos(null); }}
        />

        {/* Coordinate and Zoom Display */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-75 p-2 rounded shadow text-black text-sm">
          <p>
            <strong>Coordinates:</strong> X: {mouseCoords.x.toFixed(2)}, Y: {mouseCoords.y.toFixed(2)}
          </p>
          <p>
            <strong>Zoom:</strong> {scale.toFixed(2)}x
          </p>
          <p>Middle mouse button to pan. Scroll to zoom.</p>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-24 right-4 text-center text-gray-400">
          <p>
            <strong>Instructions:</strong>
            <br />
            - Click or drag with the left mouse button to place pixels.
            <br />
            - Hold the middle mouse button (scroll wheel) and drag to pan around the canvas.
            <br />
            - Use white color to delete pixels. Updates are real-time!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceV2;