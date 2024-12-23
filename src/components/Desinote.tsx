import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  initializeApp,
  getApps,
  getApp
} from "firebase/app";
import {
  getDatabase,
  ref as dbRef,
  set,
  onValue,
  push,
  off,
  remove
} from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "demiffycom.firebaseapp.com",
  databaseURL:
    "https://demiffycom-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "demiffycom",
  storageBucket: "demiffycom.appspot.com",
  messagingSenderId: "423608998435",
  appId: "1:423608998435:web:1ee3cc6b9408777fbdaf96",
  measurementId: "G-9DVS3F5QST",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

interface DrawableText {
  id: string;
  x: number;
  y: number;
  text: string;
  isDragging: boolean;
  isEditing: boolean;
}

const Desinote: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [notes, setNotes] = useState<{ [id: string]: DrawableText }>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [inputWidths, setInputWidths] = useState<{ [id: string]: number }>({});
  const [scale, setScale] = useState(1);
  const [isHoveringText, setIsHoveringText] = useState(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>(
    { width: window.innerWidth, height: window.innerHeight }
  );
  const [gridEnabled, setGridEnabled] = useState(false);
  const gridSize = 20;

  const [viewportOffset, setViewportOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  const inputRefs = useRef<{ [id: string]: HTMLInputElement | null }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (e.code === 'Space' && !(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
  
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);  

  // Function to update canvas size
  const updateCanvasSize = useCallback(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollbarHeight = window.innerHeight - document.documentElement.clientHeight;

    setCanvasSize({
      width: window.innerWidth - scrollbarWidth,
      height: window.innerHeight - scrollbarHeight,
    });
  }, []);

  // Handle zooming with the mouse wheel
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
  
    const zoomFactor = 0.1;
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
  
    const worldX = (mouseX - rect.left) / scale + viewportOffset.x;
    const worldY = (mouseY - rect.top) / scale + viewportOffset.y;
  
    setScale((prevScale) => {
      let newScale = event.deltaY < 0 ? prevScale + zoomFactor : prevScale - zoomFactor;
      newScale = Math.min(Math.max(newScale, 0.5), 3); // Min 50%, Max 300%
  
      setViewportOffset({
        x: worldX - (mouseX - rect.left) / newScale,
        y: worldY - (mouseY - rect.top) / newScale,
      });
  
      return newScale;
    });
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const handleWheelNative = (event: WheelEvent) => {
      event.preventDefault();
      handleWheel(event);
    };
  
    canvas.addEventListener("wheel", handleWheelNative, { passive: false });
  
    return () => {
      canvas.removeEventListener("wheel", handleWheelNative);
    };
  }, [handleWheel]);

  // Update canvas size on window resize
  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

  // Draw the text on the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scale, scale);

    Object.values(notes).forEach(note => {
      if (!note.isEditing) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.textBaseline = "top";

        const x = (note.x - viewportOffset.x);
        const y = (note.y - viewportOffset.y);

        ctx.fillText(note.text, x, y);

        if (selectedNoteId === note.id) {
          const textWidth = ctx.measureText(note.text).width;
          const textHeight = 20;

          const borderRadius = 6;
          const padding = 8;
          const paddingTop = 6;
          const paddingBottom = 1;

          ctx.shadowColor = "rgba(0, 123, 255, 0.5)";
          ctx.shadowBlur = 10;

          ctx.strokeStyle = "rgba(0, 123, 255, 0.8)";
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.moveTo(x - padding + borderRadius, y - paddingTop);
          ctx.arcTo(
            x + textWidth + padding,
            y - paddingTop,
            x + textWidth + padding,
            y + textHeight + paddingBottom,
            borderRadius
          );
          ctx.arcTo(
            x + textWidth + padding,
            y + textHeight + paddingBottom,
            x - padding,
            y + textHeight + paddingBottom,
            borderRadius
          );
          ctx.arcTo(
            x - padding,
            y + textHeight + paddingBottom,
            x - padding,
            y - paddingTop,
            borderRadius
          );
          ctx.arcTo(
            x - padding,
            y - paddingTop,
            x + textWidth + padding,
            y - paddingTop,
            borderRadius
          );
          ctx.closePath();

          ctx.stroke();
        }
      }
    });

    ctx.restore();
  }, [notes, canvasSize, scale, selectedNoteId, viewportOffset, gridEnabled]);

  // Redraw the canvas when the notes or scale change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Function to add a new note at a specific position
  const addNoteAtPosition = (x: number, y: number) => {
    const notesRef = dbRef(db, `lessonNotes`);
    const newNoteRef = push(notesRef);
    const newNoteId = newNoteRef.key;
    if (newNoteId) {
      const defaultX = gridEnabled ? Math.round(x / gridSize) * gridSize : x;
      const defaultY = gridEnabled ? Math.round(y / gridSize) * gridSize : y;
      const newNote: DrawableText = {
        id: newNoteId,
        x: defaultX,
        y: defaultY,
        text: "",
        isDragging: false,
        isEditing: true,
      };
      set(newNoteRef, {
        id: newNote.id,
        content: newNote.text,
        x: newNote.x,
        y: newNote.y,
      })
        .then(() => {
          setNotes((prev) => ({
            ...prev,
            [newNoteId]: newNote,
          }));
          setSelectedNoteId(newNoteId);
        })
        .catch((error) => {
          console.error("Error adding new lesson note:", error);
        });
    }
  };

  // Handle mouse down for dragging or panning
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      return;
    }
  
    if (Object.values(notes).some(note => note.isEditing)) return;
  
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvas.getBoundingClientRect();
  
    const x = (event.clientX - rect.left) / scale + viewportOffset.x;
    const y = (event.clientY - rect.top) / scale + viewportOffset.y;
  
    let found = false;
    Object.values(notes).forEach(note => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
      ctx.font = "16px Arial";
      const textWidth = ctx.measureText(note.text).width;
      const textHeight = 20;
  
      if (
        x >= note.x - 7 &&
        x <= note.x + textWidth + 7 &&
        y >= note.y - 7 &&
        y <= note.y + textHeight + 7
      ) {
        setSelectedNoteId(note.id);
        setNotes(prev => ({
          ...prev,
          [note.id]: { ...prev[note.id], isDragging: true }
        }));
        setOffset({ x: x - note.x, y: y - note.y });
        found = true;
      }
    });
  
    if (!found) {
      setSelectedNoteId(null);
    }
  };  

  // Handle mouse move for dragging or panning
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const deltaX = event.clientX - panStart.x;
      const deltaY = event.clientY - panStart.y;
      setPanStart({ x: event.clientX, y: event.clientY });
  
      setViewportOffset(prev => ({
        x: prev.x - deltaX / scale,
        y: prev.y - deltaY / scale,
      }));
      return;
    }
  
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvas.getBoundingClientRect();
  
    const x = (event.clientX - rect.left) / scale + viewportOffset.x;
    const y = (event.clientY - rect.top) / scale + viewportOffset.y;
  
    let hovering = false;
    Object.values(notes).forEach(note => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.font = "16px Arial";
      const textWidth = ctx.measureText(note.text).width;
      const textHeight = 20;
  
      if (
        x >= note.x &&
        x <= note.x + textWidth &&
        y >= note.y &&
        y <= note.y + textHeight
      ) {
        hovering = true;
      }
    });
  
    setIsHoveringText(hovering);
  
    if (selectedNoteId && notes[selectedNoteId]?.isDragging) {
      let newX = x - offset.x;
      let newY = y - offset.y;
  
      if (gridEnabled) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
  
      setNotes(prev => ({
        ...prev,
        [selectedNoteId]: { ...prev[selectedNoteId], x: newX, y: newY },
      }));
    }
  };  

  // Handle mouse up to stop dragging or panning
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
  
    if (selectedNoteId && notes[selectedNoteId]?.isDragging) {
      setNotes(prev => ({
        ...prev,
        [selectedNoteId]: { ...prev[selectedNoteId], isDragging: false },
      }));
  
      if (notes[selectedNoteId]?.text) {
        saveLessonNote(notes[selectedNoteId]);
      } else if (notes[selectedNoteId]) {
        deleteLessonNote(selectedNoteId);
      }
    }
  };  

  // Handle double click to start editing or add a new note
  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const rect = canvas.getBoundingClientRect();
  
    const x = (event.clientX - rect.left) / scale + viewportOffset.x;
    const y = (event.clientY - rect.top) / scale + viewportOffset.y;
  
    let foundId: string | null = null;
    Object.values(notes).forEach(note => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
      ctx.font = "16px Arial";
      const textWidth = ctx.measureText(note.text).width;
      const textHeight = 20;
  
      if (
        x >= note.x - 7 &&
        x <= note.x + textWidth + 7 &&
        y >= note.y - 7 &&
        y <= note.y + textHeight + 7
      ) {
        foundId = note.id;
      }
    });
  
    if (foundId) {
      setSelectedNoteId(foundId);
      setNotes(prev => ({
        ...prev,
        [foundId!]: { ...prev[foundId!], isEditing: true, isDragging: false }
      }));
      setTimeout(() => {
        if (foundId !== null) {
          inputRefs.current[foundId]?.focus();
          inputRefs.current[foundId]?.select();
        }
      }, 0);
    } else {
      addNoteAtPosition(x, y);
    }
  };  

  // Handle input change
  const handleInputChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    const caretPosition = event.target.selectionStart;
  
    setNotes(prev => ({
      ...prev,
      [id]: { ...prev[id], text }
    }));
  
    setTimeout(() => {
      const input = inputRefs.current[id];
      if (input && caretPosition !== null) {
        input.setSelectionRange(caretPosition, caretPosition);
      }
    }, 0);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = "16px Arial";
      const textWidth = ctx.measureText(text).width;
      setInputWidths(prev => ({
        ...prev,
        [id]: Math.max(100, textWidth + 20)
      }));
    }
  };  

  // Handle input blur to stop editing
  const handleInputBlur = (id: string) => {
    setNotes(prev => ({
      ...prev,
      [id]: { ...prev[id], isEditing: false }
    }));
    if (notes[id].text) {
      saveLessonNote(notes[id]);
    } else {
      deleteLessonNote(id);
    }
  };

  // Handle key presses within the input
  const handleKeyDown = (id: string, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Escape") {
      setNotes(prev => ({
        ...prev,
        [id]: { ...prev[id], isEditing: false }
      }));
      if (notes[id].text) {
        saveLessonNote(notes[id]);
      } else {
        deleteLessonNote(id);
      }
    }
  };

  // Handle clicking outside the input to stop editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(inputRefs.current).forEach(id => {
        if (
          inputRefs.current[id] &&
          !inputRefs.current[id]?.contains(event.target as Node)
        ) {
          setNotes(prev => ({
            ...prev,
            [id]: { ...prev[id], isEditing: false }
          }));
          if (notes[id]?.text) {
            saveLessonNote(notes[id]);
          } else {
            deleteLessonNote(id);
          }
        }
      });
    };

    if (Object.values(notes).some(note => note.isEditing)) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notes]);

  const [inputPositions, setInputPositions] = useState<{ [id: string]: { top: number; left: number } }>({});

  useEffect(() => {
    const newPositions: { [id: string]: { top: number; left: number } } = {};
    Object.values(notes).forEach(note => {
      if (note.isEditing && canvasRef.current && containerRef.current) {
        const offsetAdjustment = -2.7 * scale;
        newPositions[note.id] = {
          top: (note.y - viewportOffset.y) * scale + offsetAdjustment,
          left: (note.x - viewportOffset.x) * scale,
        };
      }
    });
    setInputPositions(newPositions);
  }, [notes, scale, viewportOffset]);

  // Function to save lesson note to Firebase
  const saveLessonNote = (note: DrawableText) => {
    if (typeof note.text !== 'string') {
      console.error(`Cannot save note ${note.id} with undefined or non-string 'text'`);
      return;
    }

    if (note.text.trim() === "") {
      deleteLessonNote(note.id);
      return;
    }

    const noteRef = dbRef(db, `lessonNotes/${note.id}`);
    set(noteRef, {
      id: note.id,
      content: note.text,
      x: note.x,
      y: note.y,
    }).catch((error) => {
      console.error("Error saving lesson note:", error);
    });
  };

  // Function to delete a lesson note from Firebase
  const deleteLessonNote = (id: string) => {
    const noteRef = dbRef(db, `lessonNotes/${id}`);
    remove(noteRef).catch((error) => {
      console.error(`Error deleting lesson note ${id}:`, error);
    });
  };

  // Function to load lesson notes from Firebase
  const loadLessonNotes = () => {
    const notesRef = dbRef(db, `lessonNotes`);
    const listener = onValue(
      notesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const validatedNotes: { [id: string]: DrawableText } = {};
          const newInputWidths: { [id: string]: number } = {};
          Object.keys(data).forEach((id) => {
            const note = data[id];
            validatedNotes[id] = {
              id: note.id || id,
              x: typeof note.x === "number" ? note.x : 100,
              y: typeof note.y === "number" ? note.y : 100,
              text: typeof note.content === "string" ? note.content : "",
              isDragging: false,
              isEditing: false,
            };
  
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.font = "16px Arial";
              const textWidth = ctx.measureText(note.content || "").width;
              newInputWidths[id] = Math.max(100, textWidth + 20);
            }
          });
  
          setNotes(validatedNotes);
          setInputWidths(newInputWidths);
        } else {
          setNotes({});
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading lesson notes:", error);
        setIsLoading(false);
      }
    );
  
    return () => {
      off(notesRef, "value", listener);
    };
  };  

  // Load lesson notes on component mount
  useEffect(() => {
    loadLessonNotes();
  }, []);

  // Focus on the input field when a new note is selected for editing
  useEffect(() => {
    if (selectedNoteId && notes[selectedNoteId]?.isEditing) {
      const input = inputRefs.current[selectedNoteId];
      if (input) {
        input.focus();
        if (input.value.length) {
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
    }
  }, [selectedNoteId, notes]);  

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Main Tools */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div
          className="flex items-center space-x-4 bg-opacity-75 backdrop-filter backdrop-blur-lg p-4 rounded-full shadow-lg max-w-md w-full"
          style={{ backgroundColor: "#232329" }}
        >
          {/* Enable Grid Lock Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={gridEnabled}
              onChange={(e) => setGridEnabled(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-sm text-white">Grid Lock</span>
          </label>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="block"
        style={{
          background: "#121212",
          cursor: isHoveringText ? "move" : (isPanning ? "grab" : "default"),
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />

      {/* Input Fields*/}
      {Object.values(notes).map(note => (
        note.isEditing && (
          <input
            key={note.id}
            ref={(el) => inputRefs.current[note.id] = el}
            type="text"
            value={note.text || ""}
            onChange={(e) => handleInputChange(note.id, e)}
            onBlur={() => handleInputBlur(note.id)}
            onKeyDown={(e) => handleKeyDown(note.id, e)}
            className="absolute bg-transparent border-b border-white text-white z-10"
            style={{
              top: inputPositions[note.id]?.top || 0,
              left: inputPositions[note.id]?.left || 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              fontSize: "16px",
              fontFamily: "Arial",
              lineHeight: "20px",
              outline: "none",
              border: "none",
              caretColor: "white",
              width: `${inputWidths[note.id] || 100}px`,
            }}
          />
        )
      ))}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span className="text-white text-lg font-semibold">Loading important stuff</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desinote;