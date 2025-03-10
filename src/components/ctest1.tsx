import React, { useRef, useState, useEffect } from 'react';

interface TextItem {
  x: number;
  y: number;
  text: string;
}

const CanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [editingText, setEditingText] = useState('');
  const [editingPos, setEditingPos] = useState<{ x: number; y: number } | null>(null);

  // Helper function to measure text width using an offscreen canvas.
  const measureTextWidth = (text: string): number => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    ctx.font = '16px sans-serif';
    const metrics = ctx.measureText(text);
    return metrics.width;
  };

  // Draw all texts on the canvas (both committed and the one being edited)
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font style and left align text
    ctx.font = '16px sans-serif';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Draw previously committed texts
    texts.forEach((item) => {
      ctx.fillText(item.text, item.x, item.y);
    });

    // Draw the current editing text
    if (editingPos) {
      ctx.fillText(editingText, editingPos.x, editingPos.y);
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [texts, editingText, editingPos]);

  // Handle double-click on the canvas to position the input field.
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setEditingPos({ x, y });
    setEditingText('');
  };

  // Commit the text when the Enter key is pressed.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && editingPos) {
      if (editingText.trim() !== '') {
        setTexts((prev) => [...prev, { x: editingPos.x, y: editingPos.y, text: editingText }]);
      }
      setEditingPos(null);
      setEditingText('');
      // Remove focus from the input to trigger onBlur
      inputRef.current?.blur();
    }
  };

  // When the input loses focus, commit the text if there is any.
  const handleBlur = () => {
    if (editingPos && editingText.trim() !== '') {
      setTexts((prev) => [...prev, { x: editingPos.x, y: editingPos.y, text: editingText }]);
    }
    setEditingPos(null);
    setEditingText('');
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300"
        onDoubleClick={handleDoubleClick}
      />
      {editingPos && (
        <input
          ref={inputRef}
          type="text"
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            position: 'absolute',
            // Adjust the top value to shift the input upward for perfect vertical alignment.
            top: editingPos.y - 2,
            left: editingPos.x,
            fontSize: '16px',
            fontFamily: 'sans-serif',
            lineHeight: '16px',
            padding: 0,
            margin: 0,
            border: '1px solid blue',
            background: 'transparent',
            outline: 'none',
            // Set the input width dynamically based on the text width (with some extra space) and a minimum width.
            width: `${Math.max(measureTextWidth(editingText) + 4, 50)}px`,
          }}
          autoFocus
        />
      )}
    </div>
  );
};

export default CanvasEditor;
