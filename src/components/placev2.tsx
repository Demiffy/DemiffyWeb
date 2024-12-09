import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
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
  '#000000', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777',
  '#888888', '#999999', '#AAAAAA', '#BBBBBB', '#CCCCCC', '#DDDDDD', '#EEEEEE', '#FFFFFF',
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#808000',
  '#008000', '#800080', '#808080', '#C0C0C0', '#FFA500', '#A52A2A', '#8A2BE2', '#5F9EA0',
];

const canvasWidth = 800;
const canvasHeight = 800;
const pixelSize = 20;

const PlaceV2: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<number>(15);

  useEffect(() => {
    const canvasReference = ref(db, 'canvas');
    const unsubscribe = onValue(canvasReference, (snapshot) => {
      const data = snapshot.val();
      const canvas = data ? Object.values(data) : [];
      drawCanvas(canvas);
    });

    return () => unsubscribe();
  }, []);

  const drawCanvas = (canvasData: any[]) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = colors[15];
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw each pixel
        canvasData.forEach((pixel: any) => {
          ctx.fillStyle = colors[pixel.color];
          ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
        });

        // Draw grid lines
        ctx.strokeStyle = '#CCCCCC';
        for (let x = 0; x <= canvasWidth; x += pixelSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
        }
        for (let y = 0; y <= canvasHeight; y += pixelSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();
        }
      }
    }
  };

  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize);
    const y = Math.floor((event.clientY - rect.top) / pixelSize);

    try {
      const pixelRef = ref(db, `canvas/${x}_${y}`);
      await set(pixelRef, { x, y, color: selectedColor });

    } catch (error) {
      console.error('Failed to place pixel:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-4">Place V2</h1>

      {/* Color Palette */}
      <div className="flex space-x-2 mb-4">
        {colors.map((color, index) => (
          <button
            key={index}
            style={{ backgroundColor: color }}
            className={`w-8 h-8 rounded ${index === selectedColor ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedColor(index)}
          />
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-gray-700"
        onClick={handleCanvasClick}
      />

      {/* Instructions */}
      <p className="mt-4 text-gray-400">Click on the canvas to place a pixel. Updates are real-time!</p>
    </div>
  );
};

export default PlaceV2;