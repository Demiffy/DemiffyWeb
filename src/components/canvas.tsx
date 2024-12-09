import React, { useRef, useEffect, useState } from 'react';

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  
  // Define minimum and maximum scale levels
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  // Initialize offset to center (0,0) at the center of the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Center (0,0) by setting offset to half of canvas dimensions
        setOffset({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        draw(canvas, { x: window.innerWidth / 2, y: window.innerHeight / 2 }, scale);
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [scale]);

  // Draw the center block and other elements
  const draw = (canvas: HTMLCanvasElement, offset: { x: number; y: number }, scale: number) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations: translate and scale
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      // Draw a large black block at the center (0,0)
      const blockSize = 20; // Size of the block
      ctx.fillStyle = 'black';
      ctx.fillRect(-blockSize / 2, -blockSize / 2, blockSize, blockSize);

      ctx.restore();
    }
  };

  // Initial draw and redraw on offset or scale change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      draw(canvas, offset, scale);
    }
  }, [offset, scale]);

  // Handle mouse events for panning and coordinate tracking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        setIsPanning(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Calculate mouse position relative to the canvas and account for offset and scale
      const canvasX = (e.clientX - rect.left - offset.x) / scale;
      const canvasY = (e.clientY - rect.top - offset.y) / scale;
      setMouseCoords({ x: canvasX, y: canvasY });

      if (isPanning && lastMousePos) {
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        setOffset((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) { // Middle mouse button
        setIsPanning(false);
        setLastMousePos(null);
      }
    };

    const handleMouseLeave = () => {
      setIsPanning(false);
      setLastMousePos(null);
    };

    // Prevent default middle-click behavior (auto-scroll)
    const preventMiddleClick = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };

    // Handle zooming
    const handleWheel = (e: WheelEvent) => {
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
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('contextmenu', preventMiddleClick); // Disable context menu on middle-click
    window.addEventListener('wheel', handleWheel, { passive: false }); // Handle zooming

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('contextmenu', preventMiddleClick);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isPanning, lastMousePos, offset, scale]);

  return (
    <div className="fixed inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab"
        style={{ backgroundColor: 'white' }}
      />
      {/* Coordinate and Zoom Display */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-75 p-2 rounded shadow">
        <p className="text-black text-sm">
          X: {mouseCoords.x.toFixed(2)}, Y: {mouseCoords.y.toFixed(2)}
        </p>
        <p className="text-black text-sm">
          Zoom: {(scale).toFixed(2)}x
        </p>
        <p className="text-black text-sm">Use middle mouse button to pan. Scroll to zoom.</p>
      </div>
    </div>
  );
};

export default CanvasComponent;
