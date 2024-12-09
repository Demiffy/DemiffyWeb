import React, { useState, useEffect, useRef } from 'react';

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
  const [canvasData, setCanvasData] = useState<any[]>([]);

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        const response = await fetch('/api/placedb');
        const data = await response.json();
        setCanvasData(data);
      } catch (error) {
        console.error('Failed to fetch canvas:', error);
      }
    };

    fetchCanvas();
  }, []);

  useEffect(() => {
    // Draw the canvas whenever the data changes
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = colors[15];
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw each pixel
        canvasData.forEach((pixel) => {
          ctx.fillStyle = colors[pixel.color];
          ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
        });

        // Draw grid lines for better visualization
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
  }, [canvasData]);

  const handleCanvasClick = async (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize);
    const y = Math.floor((event.clientY - rect.top) / pixelSize);

    try {
      const response = await fetch('/api/placedb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, color: selectedColor }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to place pixel.');
        return;
      }

      setCanvasData((prev) => [...prev, { x, y, color: selectedColor }]);
    } catch (error) {
      console.error('Failed to place pixel:', error);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col items-center py-14">
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
      <p className="mt-4 text-gray-400">Click on the canvas to place a pixel.</p>
    </div>
  );
};

export default PlaceV2;