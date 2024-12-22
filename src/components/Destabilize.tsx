import React, { useState, useEffect, useRef, memo } from "react";
import { DndContext, useDraggable, DragEndEvent } from "@dnd-kit/core";
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

// Label
const Label = memo(
  ({
    note,
    updateNote,
    isSelected,
    setSelectedNoteId,
    isEditing,
    startEditing,
    stopEditing,
  }: {
    note: Note;
    updateNote: (updatedNote: Note) => void;
    isSelected: boolean;
    setSelectedNoteId: (id: string | null) => void;
    isEditing: boolean;
    startEditing: () => void;
    stopEditing: () => void;
  }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: note.id,
      disabled: isEditing,
    });

    const [isDragging, setIsDragging] = useState(false);

    const style: React.CSSProperties = {
      position: "absolute",
      left: note.x,
      top: note.y,
      transform: transform
        ? `translate(${transform.x}px, ${transform.y}px)`
        : "none",
      cursor: isEditing ? "text" : "move",
      zIndex: isEditing ? 50 : 1,
      userSelect: isEditing ? "text" : "none",
      boxSizing: "border-box",
      willChange: "transform",
    };

    const contentRef = useRef<HTMLDivElement>(null);

    const handleDoubleClick = () => {
      startEditing();
      setSelectedNoteId(note.id);
    };

    // Save changes when editing ends
    const handleBlur = () => {
      if (isEditing) {
        const newContent = contentRef.current?.innerText.trim() || "";
        if (newContent === "") {
          contentRef.current!.innerText = note.content;
        } else if (newContent !== note.content) {
          const updatedNote = {
            ...note,
            content: newContent,
          };
          updateNote(updatedNote);
        }
        stopEditing();
        setSelectedNoteId(null);
      }
    };

    useEffect(() => {
      if (isEditing && contentRef.current) {
        contentRef.current.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }, [isEditing]);

    return (
      <div
        ref={setNodeRef}
        className={`font-sans text-lg ${
            isSelected || isDragging
              ? "border-2 border-blue-400 rounded-lg p-2"
              : "border-2 border-transparent p-2"
          }`}          
        style={style}
        {...(!isEditing && listeners)}
        {...attributes}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNoteId(note.id);
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div
          ref={contentRef}
          className={`outline-none ${
            isEditing ? "border-b border-blue-500" : ""
          }`}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          onBlur={() => {
            setIsDragging(false);
            handleBlur();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleBlur();
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleBlur();
            }
          }}
          dir="ltr"
        >
          {note.content}
        </div>
      </div>
    );
  }
);

// Sidebar
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

// Destabilize
const Destabilize: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAddingText, setIsAddingText] = useState<boolean>(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);

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

  const handleDragStart = () => {
    if (gridEnabled) {
      setIsDragging(true);
    }
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, delta } = event;
    const note = notes.find((n) => n.id === active.id);
    if (note && delta) {
      let newX = note.x + delta.x;
      let newY = note.y + delta.y;

      if (gridEnabled) {
        const snapped = restrictToGrid(newX, newY, GRID_SIZE);
        newX = snapped.x;
        newY = snapped.y;
      }

      // Clamp within canvas boundaries
      if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const noteWidth = 300;
        const noteHeight = 100;

        newX = Math.max(0, Math.min(newX, canvasRect.width - noteWidth));
        newY = Math.max(0, Math.min(newY, canvasRect.height - noteHeight));
      }

      updateNote({ ...note, x: newX, y: newY });
    }
  };

  // Handle drag cancel event
  const handleDragCancel = () => {
    setIsDragging(false);
  };

  // Handle canvas click to add a new text label
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isAddingText) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const clickX = e.clientX - canvasRect.left;
        const clickY = e.clientY - canvasRect.top;

        let x = clickX;
        let y = clickY;
        if (gridEnabled) {
          const snapped = restrictToGrid(x, y, GRID_SIZE);
          x = snapped.x;
          y = snapped.y;
        }

        const id = nanoid();
        const newNote: Note = {
          id,
          content: "New Text",
          x,
          y,
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
  const startEditing = (id: string) => {
    setEditNoteId(id);
  };

  // Function to stop editing
  const stopEditing = () => {
    setEditNoteId(null);
  };

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="relative w-full h-screen text-white flex flex-col">
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
          <div className="flex items-center space-x-4 bg-opacity-75 backdrop-filter backdrop-blur-lg p-4 rounded-full shadow-lg"
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
          ref={canvasRef}
          className={`relative flex-grow overflow-hidden ${
            isAddingText ? "cursor-crosshair" : "cursor-default"
          }`}
          style={{ backgroundColor: "#121212" }}
          onClick={handleCanvasClick}
        >
          {/* Grid Overlay */}
          {isDragging && gridEnabled && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), " +
                  "linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
          )}

          {/* Draggable Labels */}
          {notes.map((note) => (
            <Label
              key={note.id}
              note={note}
              updateNote={updateNote}
              isSelected={selectedNoteId === note.id}
              setSelectedNoteId={setSelectedNoteId}
              isEditing={editNoteId === note.id}
              startEditing={() => startEditing(note.id)}
              stopEditing={stopEditing}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default Destabilize;