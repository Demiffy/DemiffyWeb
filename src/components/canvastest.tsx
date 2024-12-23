import React, { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import { nanoid } from "nanoid";
import "tailwindcss/tailwind.css";
import {
  HiPlus,
  HiMenu,
  HiSave,
  HiX,
} from "react-icons/hi";

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

type Note = {
  id: string;
  content: string;
  x: number;
  y: number;
  timestamp: string;
};

const GRID_SIZE = 35;

const restrictToGrid = (x: number, y: number, gridSize: number) => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
};

// Sidebar component (Placeholder)
const Sidebar: React.FC<{ isOpen: boolean; toggleSidebar: () => void }> = ({
  isOpen,
  toggleSidebar,
}) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 text-white transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-30`}
      style={{ backgroundColor: "#232329" }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h2 className="text-xl font-semibold">Sidebar</h2>
        <button onClick={toggleSidebar}>
          <HiX className="h-6 w-6" />
        </button>
      </div>
      {/* Sidebar */}
      <div className="p-4">
        <p className="mb-4">Save Button (WIP)</p>
        <button className="flex items-center px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 w-full">
          <HiSave className="h-5 w-5 mr-2" />
          Save
        </button>
      </div>
    </div>
  );
};

// Main Canvas Component
const Destabilize: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [isAddingText, setIsAddingText] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [textareaStyle, setTextareaStyle] = useState<React.CSSProperties | null>(
    null
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to add a new note
  const addNote = () => {
    setIsAddingText(true);
  };

  // Function to update note position or content
  const updateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
    saveToFirebase(updatedNote);
  };

  // Function to save a note to Firebase
  const saveToFirebase = async (note: Note) => {
    const noteRef = ref(db, `lessonNotes/${note.id}`);
    try {
      await set(noteRef, note);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  // Function to load notes from Firebase
  const loadNotes = async () => {
    const notesRef = ref(db, "lessonNotes");
    try {
      const snapshot = await get(notesRef);
      if (snapshot.exists()) {
        const loadedNotes: Note[] = Object.values(snapshot.val());
        setNotes(loadedNotes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Handle canvas click to add a new text label
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (isAddingText) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        let clickX = e.clientX - rect.left;
        let clickY = e.clientY - rect.top;

        if (gridEnabled) {
          const snapped = restrictToGrid(clickX, clickY, GRID_SIZE);
          clickX = snapped.x;
          clickY = snapped.y;
        }

        const id = nanoid();
        const newNote: Note = {
          id,
          content: "New Text",
          x: clickX,
          y: clickY,
          timestamp: new Date().toISOString(),
        };

        setNotes((prev) => [...prev, newNote]);
        saveToFirebase(newNote);

        setSelectedNoteId(id);
        setEditNoteId(id);
      }
      setIsAddingText(false);
    } else {
      setSelectedNoteId(null);
      setEditNoteId(null);
    }
  };

  // Function to start editing a note
  const startEditing = (id: string, x: number, y: number) => {
    setEditNoteId(id); // Set the note being edited
    setDragging(null); // Stop any ongoing dragging
  
    const containerRect = containerRef.current?.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
  
    if (canvasRect && containerRect) {
      // Calculate absolute positioning for textarea
      const adjustedLeft = containerRect.left + x;
      const adjustedTop = containerRect.top + y;
  
      setTextareaStyle({
        position: "absolute",
        left: `${adjustedLeft}px`,
        top: `${adjustedTop}px`,
        transform: "translate(-50%, -50%)", // Center align to match note positioning
        fontSize: "1.125rem",
        fontFamily: "sans-serif",
        color: "white",
        background: "none",
        border: "1px solid #3B82F6", // Highlight textarea
        padding: "0.5rem",
        zIndex: 100,
        resize: "none",
        minWidth: "100px",
        minHeight: "20px",
        outline: "none", // Prevent extra outline
      });
  
      // Focus the textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 0);
    }
  };  

  // Function to stop editing
  const stopEditing = () => {
    if (editNoteId && textareaRef.current) {
      const newContent = textareaRef.current.value.trim();
      if (newContent === "") {
        // Optionally, remove the note if empty
      } else {
        const note = notes.find((n) => n.id === editNoteId);
        if (note && newContent !== note.content) {
          updateNote({ ...note, content: newContent });
        }
      }
      setEditNoteId(null);
      setTextareaStyle(null);
    }
  };   

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (editNoteId) return; // Skip dragging if editing a note
  
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
  
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    for (let i = notes.length - 1; i >= 0; i--) {
      const note = notes[i];
      const context = canvasRef.current?.getContext("2d");
      if (!context) continue;
  
      context.font = "1.125rem sans-serif";
      const textWidth = context.measureText(note.content).width;
      const textHeight = 20;
  
      if (
        x >= note.x - 10 &&
        x <= note.x + textWidth + 10 &&
        y >= note.y - textHeight &&
        y <= note.y + 10
      ) {
        setSelectedNoteId(note.id);
        setDragging({
          id: note.id,
          offsetX: x - note.x,
          offsetY: y - note.y,
        });
        return;
      }
    }
  
    setSelectedNoteId(null);
  };  

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      let newX = e.clientX - rect.left - dragging.offsetX;
      let newY = e.clientY - rect.top - dragging.offsetY;

      if (gridEnabled) {
        const snapped = restrictToGrid(newX, newY, GRID_SIZE);
        newX = snapped.x;
        newY = snapped.y;
      }

      // Clamp within canvas boundaries
      if (canvasRef.current) {
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
        const noteWidth = 300; // Assuming max width
        const noteHeight = 100; // Assuming max height

        newX = Math.max(0, Math.min(newX, canvasWidth - noteWidth));
        newY = Math.max(0, Math.min(newY, canvasHeight - noteHeight));
      }

      setNotes((prev) =>
        prev.map((note) =>
          note.id === dragging.id ? { ...note, x: newX, y: newY } : note
        )
      );
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    if (dragging) {
      const note = notes.find((n) => n.id === dragging.id);
      if (note) {
        updateNote(note);
      }
      setDragging(null);
    }
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Draw notes on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
  
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw grid if enabled
    if (gridEnabled) {
      context.strokeStyle = "rgba(255, 255, 255, 0.1)";
      context.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += GRID_SIZE) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      for (let y = 0; y < canvas.height; y += GRID_SIZE) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }
    }
  
    // Draw notes
    notes.forEach((note) => {
      // Skip drawing the note being edited
      if (note.id === editNoteId) return;
  
      context.font = "1.125rem sans-serif";
      context.fillStyle = note.id === selectedNoteId ? "#3B82F6" : "white";
      context.textBaseline = "top";
      context.fillText(note.content, note.x, note.y);
    });
  }, [notes, gridEnabled, selectedNoteId, editNoteId]);  
  

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle window resize to adjust canvas size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        draw();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  // Handle double click to edit
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    for (let i = notes.length - 1; i >= 0; i--) {
      const note = notes[i];
      const context = canvasRef.current?.getContext("2d");
      if (!context) continue;
      context.font = "1.125rem sans-serif"; // text-lg
      const textWidth = context.measureText(note.content).width;
      const textHeight = 20; // Approximate height
      if (
        x >= note.x - 10 &&
        x <= note.x + textWidth + 10 &&
        y >= note.y - textHeight &&
        y <= note.y + 10
      ) {
        startEditing(note.id, note.x, note.y); // Pass note position for textarea placement
        return;
      }
    }
  };  

  return (
    <div className="relative w-full h-screen text-white flex flex-col" ref={containerRef}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Floating Header Boxes */}

      {/* Top Center Box: Main Tools */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div
          className="flex items-center space-x-4 bg-opacity-75 backdrop-filter backdrop-blur-lg p-4 rounded-full shadow-lg max-w-md w-full"
          style={{ backgroundColor: "#232329" }}
        >
          {/* Add Text Button */}
          <button
            onClick={addNote}
            className={`p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-colors duration-200 ${
              isAddingText ? "bg-red-600" : "bg-blue-600"
            }`}
            aria-label={isAddingText ? "Cancel Adding Text" : "Add Text"}
          >
            <HiPlus className="h-6 w-6 text-white" />
          </button>

          {/* Enable Grid Lock Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
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

      {/* Sidebar Toggle and Save */}
      <div className="fixed top-4 right-4 z-20">
        <div
          className="flex items-center space-x-4 bg-opacity-75 backdrop-filter backdrop-blur-lg p-4 rounded-full shadow-lg"
          style={{ backgroundColor: "#232329" }}
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-gray-700 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <HiMenu className="h-6 w-6 text-white" />
          </button>

          {/* Save Button */}
          <button
            onClick={() => {
              console.log("Save button clicked (WIP)");
            }}
            className="p-2 rounded hover:bg-gray-700 focus:outline-none"
            aria-label="Save"
          >
            <HiSave className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className={`relative flex-grow overflow-hidden ${
          isAddingText ? "cursor-crosshair" : "cursor-default"
        }`}
        style={{ backgroundColor: "#121212" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        />
        {textareaStyle && (
        <textarea
          ref={textareaRef}
          style={textareaStyle}
          defaultValue={
            notes.find((note) => note.id === editNoteId)?.content || ""
          }
          onBlur={stopEditing}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              stopEditing();
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              stopEditing();
            }
          }}
          className="text-lg font-sans text-white bg-transparent"
        />
      )}
      </div>
    </div>
  );
};

export default Destabilize;