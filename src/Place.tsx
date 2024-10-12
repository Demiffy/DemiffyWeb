//Place.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const GRID_SIZE = 50;
const WORKER_API_URL = 'https://demiffy-place-worker.velnertomas78-668.workers.dev';

const COLORS = [
  '#6d001a', '#be0039', '#ff4500', '#ffa800', '#ffd635', '#fff8b8',
  '#00a368', '#00cc78', '#7eed56', '#00756f', '#009eaa', '#00ccc0',
  '#2450a4', '#3690ea', '#51e9f4', '#493ac1', '#6a5cff', '#94b3ff',
  '#811e9f', '#b44ac0', '#e4abff', '#de107f', '#ff3881', '#ff99aa',
  '#6d482f', '#9c6926', '#ffb470', '#000000', '#515252', '#898d90',
  '#d4d7d9', '#ffffff'
];

const Place = () => {
  const [grid, setGrid] = useState<string[][]>(Array(GRID_SIZE).fill(Array(GRID_SIZE).fill('#FFFFFF')));
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    axios.get(`${WORKER_API_URL}/grid`).then((response) => {
      setGrid(response.data);
    }).catch((error) => {
      console.error('Error fetching grid:', error);
    });
  }, []);

  const handlePlacePixel = (x: number, y: number) => {
    if (cooldown) return;

    setCooldown(true);

    axios
      .post(`${WORKER_API_URL}/place`, { x, y, color: selectedColor })
      .then((response) => {
        setGrid(response.data);
        setCooldown(false);
      })
      .catch((error) => {
        console.error('Error placing pixel:', error);
        setCooldown(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-row items-start justify-center p-4 mt-20 space-x-6">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)` }}>
        {grid.map((row, rowIndex) => (
          row.map((pixelColor, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handlePlacePixel(rowIndex, colIndex)}
              className="cursor-pointer border border-gray-300"
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: pixelColor,
              }}
            ></div>
          ))
        ))}
      </div>

      <div className="flex flex-col items-center">
        <h2 className="text-lg mb-4">Select a Color:</h2>
        <div className="grid grid-cols-2 gap-4">
          {COLORS.map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-black' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Place;