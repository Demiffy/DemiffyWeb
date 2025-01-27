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
  fontSize: number;
  fontFamily: string;
  color: string;
}

const Desinote: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [notes, setNotes] = useState<{ [id: string]: DrawableText }>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [inputWidths, setInputWidths] = useState<{ [id: string]: number }>({});
  const [scale, setScale] = useState(1);
  const [isHoveringText, setIsHoveringText] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [gridEnabled, setGridEnabled] = useState(false);
  const gridSize = 20;

  const [viewportOffset, setViewportOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  const inputRefs = useRef<{ [id: string]: HTMLInputElement | null }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  const CLICK_THRESHOLD = 5;

  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [initialPositions, setInitialPositions] = useState<{ [id: string]: {x: number, y: number} }>({});

  const [showProperties, setShowProperties] = useState<boolean>(false);
  const [propertyValues, setPropertyValues] = useState<{
    fontSize: number;
    fontFamily: string;
    color: string;
  }>({
    fontSize: 16,
    fontFamily: "Arial",
    color: "#FFFFFF"
  });

  const newNoteIdsRef = useRef<Set<string>>(new Set());

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
  const handleWheel = useCallback((event: WheelEvent) => {
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
  }, [scale, viewportOffset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const handleWheelNative = (event: WheelEvent) => {
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

    // Draw grid if enabled
    if (gridEnabled) {
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width / scale; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height / scale);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height / scale; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width / scale, y);
        ctx.stroke();
      }
    }

    // Draw notes
    Object.values(notes).forEach(note => {
      if (!note.isEditing) {
        ctx.font = `${note.fontSize}px ${note.fontFamily}`;
        ctx.fillStyle = note.color;
        ctx.textBaseline = "top";

        const x = (note.x - viewportOffset.x);
        const y = (note.y - viewportOffset.y);

        ctx.fillText(note.text, x, y);

        if (selectedNotes.has(note.id)) {
          const textWidth = ctx.measureText(note.text).width;
          const textHeight = note.fontSize;

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

    // Draw selection rectangle if selecting
    if (isSelecting && selectionStart && selectionEnd) {
      const ctxSel = canvas.getContext("2d");
      if (ctxSel) {
        ctxSel.save();
        ctxSel.scale(scale, scale);
        ctxSel.strokeStyle = "rgba(0, 123, 255, 0.5)";
        ctxSel.lineWidth = 1;
        ctxSel.setLineDash([6]);
        ctxSel.fillStyle = "rgba(0, 123, 255, 0.2)";

        // Adjust for viewport offset
        const x1 = selectionStart.x - viewportOffset.x;
        const y1 = selectionStart.y - viewportOffset.y;
        const x2 = selectionEnd.x - viewportOffset.x;
        const y2 = selectionEnd.y - viewportOffset.y;

        const rectX = Math.min(x1, x2);
        const rectY = Math.min(y1, y2);
        const rectWidth = Math.abs(x2 - x1);
        const rectHeight = Math.abs(y2 - y1);

        ctxSel.beginPath();
        ctxSel.rect(rectX, rectY, rectWidth, rectHeight);
        ctxSel.fill();
        ctxSel.stroke();
        ctxSel.setLineDash([]);
        ctxSel.restore();
      }
    }
  }, [
    notes,
    canvasSize,
    scale,
    viewportOffset,
    gridEnabled,
    isSelecting,
    selectionStart,
    selectionEnd,
    selectedNotes
  ]);

  // Redraw the canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Function to add a new note at a specific position
  const addNoteAtPosition = (x: number, y: number) => {
    const notesRef = dbRef(db, `lessonNotes`);
    const newNoteRef = push(notesRef);
    const newNoteId = newNoteRef.key;
    if (newNoteId) {
      // Mark this ID as a new note to prevent premature saving
      newNoteIdsRef.current.add(newNoteId);

      const defaultX = gridEnabled ? Math.round(x / gridSize) * gridSize : x;
      const defaultY = gridEnabled ? Math.round(y / gridSize) * gridSize : y;
      const newNote: DrawableText = {
        id: newNoteId,
        x: defaultX,
        y: defaultY,
        text: "",
        isDragging: false,
        isEditing: true,
        fontSize: 16,
        fontFamily: "Arial",
        color: "#FFFFFF"
      };
      set(newNoteRef, {
        id: newNote.id,
        content: newNote.text,
        x: newNote.x,
        y: newNote.y,
        fontSize: newNote.fontSize,
        fontFamily: newNote.fontFamily,
        color: newNote.color
      })
        .then(() => {
          setNotes((prev) => ({
            ...prev,
            [newNoteId]: newNote,
          }));
          setSelectedNoteId(newNoteId);
          setSelectedNotes(new Set([newNoteId]));
          setDragStart(null);
          setInitialPositions({
            [newNoteId]: { x: newNote.x, y: newNote.y }
          });
          setShowProperties(true);
          setPropertyValues({
            fontSize: newNote.fontSize,
            fontFamily: newNote.fontFamily,
            color: newNote.color
          });

          setTimeout(() => {
            newNoteIdsRef.current.delete(newNoteId);
          }, 0);
        })
        .catch((error) => {
          console.error("Error adding new lesson note:", error);
          newNoteIdsRef.current.delete(newNoteId);
        });
    }
  };

  // Handle mouse down for dragging or panning or selecting
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;

    if (isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = (event.clientX - rect.left) / scale + viewportOffset.x;
    const y = (event.clientY - rect.top) / scale + viewportOffset.y;

    // Check if clicked on a note to start dragging
    let clickedOnNote = false;
    let clickedNoteId: string | null = null;
    Object.values(notes).forEach(note => {
      if (!note.isEditing) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.font = `${note.fontSize}px ${note.fontFamily}`;
        const textWidth = ctx.measureText(note.text).width;
        const textHeight = note.fontSize;

        if (
          x >= note.x - 7 &&
          x <= note.x + textWidth + 7 &&
          y >= note.y - 7 &&
          y <= note.y + textHeight + 7
        ) {
          clickedOnNote = true;
          clickedNoteId = note.id;
        }
      }
    });

    if (clickedOnNote && clickedNoteId) {
      if (selectedNotes.has(clickedNoteId)) {
        // Start dragging all selected notes
        setDragStart({ x: event.clientX, y: event.clientY });

        const initialPos: { [id: string]: { x: number; y: number } } = {};
        selectedNotes.forEach(id => {
          const note = notes[id];
          initialPos[id] = { x: note.x, y: note.y };
        });
        setInitialPositions(initialPos);
      } else {
        // Select only the clicked note
        setSelectedNotes(new Set([clickedNoteId]));
        setDragStart({ x: event.clientX, y: event.clientY });
        setInitialPositions({
          [clickedNoteId]: { x: notes[clickedNoteId].x, y: notes[clickedNoteId].y }
        });
        setShowProperties(true);
        setPropertyValues({
          fontSize: notes[clickedNoteId].fontSize,
          fontFamily: notes[clickedNoteId].fontFamily,
          color: notes[clickedNoteId].color
        });
      }
    } else {
      // Start selection
      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });

      // Deselect all notes when starting a new selection
      setSelectedNotes(new Set());

      // Reset dragging state
      setSelectedNoteId(null);
    }
  };

  // Handle mouse move for dragging or panning or selecting
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

    if (isSelecting) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / scale + viewportOffset.x;
      const y = (event.clientY - rect.top) / scale + viewportOffset.y;
      setSelectionEnd({ x, y });
      return;
    }

    if (dragStart) {
      const currentX = event.clientX;
      const currentY = event.clientY;

      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;

      // Update positions based on delta
      const updatedNotes: { [id: string]: DrawableText } = { ...notes };
      selectedNotes.forEach(id => {
        const initialPos = initialPositions[id];
        if (initialPos) {
          const newX = initialPos.x + deltaX / scale;
          const newY = initialPos.y + deltaY / scale;

          updatedNotes[id] = {
            ...updatedNotes[id],
            x: gridEnabled ? Math.round(newX / gridSize) * gridSize : newX,
            y: gridEnabled ? Math.round(newY / gridSize) * gridSize : newY,
          };
        }
      });

      setNotes(updatedNotes);
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
      ctx.font = `${note.fontSize}px ${note.fontFamily}`;
      const textWidth = ctx.measureText(note.text).width;
      const textHeight = note.fontSize;

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
  };

  // Handle mouse up to stop dragging or panning or finalize selection
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (dragStart) {
      // Finalize dragging
      // Save all selectedNotes' new positions, excluding newly added notes
      selectedNotes.forEach(id => {
        const note = notes[id];
        if (note) { 
          if (newNoteIdsRef.current.has(id)) {
            // Skip saving newly added notes
            console.log(`Skipping save for new note ID: ${id}`);
            return;
          }
          saveLessonNote(note);
        } else {
          console.error(`Cannot save note ${id} because it is undefined.`);
        }
      });

      // Clear dragging state
      setDragStart(null);
      setInitialPositions({});
    }

    if (isSelecting && selectionStart && selectionEnd) {
      const selX1 = Math.min(selectionStart.x, selectionEnd.x);
      const selY1 = Math.min(selectionStart.y, selectionEnd.y);
      const selX2 = Math.max(selectionStart.x, selectionEnd.x);
      const selY2 = Math.max(selectionStart.y, selectionEnd.y);

      const movement = Math.hypot(selectionEnd.x - selectionStart.x, selectionEnd.y - selectionStart.y);

      if (movement < CLICK_THRESHOLD) {
        // Treat as a click to deselect
        setSelectedNotes(new Set());
        setShowProperties(false);
      } else {
        // Perform selection
        const newSelectedNotes = new Set<string>();

        Object.values(notes).forEach(note => {
          const noteX = note.x;
          const noteY = note.y;
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return;
          ctx.font = `${note.fontSize}px ${note.fontFamily}`;
          const textWidth = ctx.measureText(note.text).width;
          const textHeight = note.fontSize;

          if (
            noteX >= selX1 &&
            noteX + textWidth <= selX2 &&
            noteY >= selY1 &&
            noteY + textHeight <= selY2
          ) {
            newSelectedNotes.add(note.id);
          }
        });

        setSelectedNotes(newSelectedNotes);
        setShowProperties(newSelectedNotes.size > 0);
        if (newSelectedNotes.size === 1) {
          const singleId = Array.from(newSelectedNotes)[0];
          const singleNote = notes[singleId];
          setPropertyValues({
            fontSize: singleNote.fontSize,
            fontFamily: singleNote.fontFamily,
            color: singleNote.color
          });
        } else {
          setPropertyValues({
            fontSize: 16,
            fontFamily: "Arial",
            color: "#FFFFFF"
          });
        }
      }

      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
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

      ctx.font = `${note.fontSize}px ${note.fontFamily}`;
      const textWidth = ctx.measureText(note.text).width;
      const textHeight = note.fontSize;

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
      setShowProperties(true);
      setPropertyValues({
        fontSize: notes[foundId!].fontSize,
        fontFamily: notes[foundId!].fontFamily,
        color: notes[foundId!].color
      });
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
      ctx.font = `${notes[id].fontSize}px ${notes[id].fontFamily}`;
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
    setShowProperties(selectedNotes.size > 0);
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
      setShowProperties(selectedNotes.size > 0);
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
    if (!note) {
      console.error(`Attempted to save an undefined note.`);
      return;
    }

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
      fontSize: note.fontSize,
      fontFamily: note.fontFamily,
      color: note.color
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
          setNotes(prevNotes => {
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
                isEditing: prevNotes[id]?.isEditing || false,
                fontSize: typeof note.fontSize === "number" ? note.fontSize : 16,
                fontFamily: typeof note.fontFamily === "string" ? note.fontFamily : "Arial",
                color: typeof note.color === "string" ? note.color : "#FFFFFF",
              };

              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.font = `${validatedNotes[id].fontSize}px ${validatedNotes[id].fontFamily}`;
                const textWidth = ctx.measureText(note.content || "").width;
                newInputWidths[id] = Math.max(100, textWidth + 20);
              }
            });

            setInputWidths(newInputWidths);
            return validatedNotes;
          });
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

  // Handle changes in the properties panel
  const handlePropertyChange = (property: keyof typeof propertyValues, value: any) => {
    setPropertyValues(prev => ({
      ...prev,
      [property]: value
    }));

    // Update all selected notes with the new property, excluding newly added notes
    const updatedNotes: { [id: string]: DrawableText } = { ...notes };
    selectedNotes.forEach(id => {
      if (!newNoteIdsRef.current.has(id)) { // **Skip newly added notes**
        updatedNotes[id] = {
          ...updatedNotes[id],
          [property]: value
        };
      }
    });
    setNotes(updatedNotes);
  };

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

      {/* Display selected notes count */}
      {selectedNotes.size > 0 && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-20 bg-opacity-75 backdrop-filter backdrop-blur-lg p-2 rounded shadow-lg">
          <span className="text-sm text-white">{selectedNotes.size} note(s) selected</span>
        </div>
      )}

      {/* Properties Panel */}
      {showProperties && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-opacity-75 backdrop-filter backdrop-blur-lg p-4 rounded shadow-lg flex space-x-4 items-center">
          <label className="flex items-center space-x-2">
            <span className="text-white">Size:</span>
            <input
              type="number"
              min="16"
              max="72"
              value={propertyValues.fontSize}
              onChange={(e) => handlePropertyChange("fontSize", parseInt(e.target.value) || 16)}
              className="w-16 p-1 rounded text-white font-bold"
            />
          </label>
          <label className="flex items-center space-x-2">
            <span className="text-white">Font:</span>
            <select
              value={propertyValues.fontFamily}
              onChange={(e) => handlePropertyChange("fontFamily", e.target.value)}
              className="p-1 rounded text-white font-bold"
            >
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
            </select>
          </label>
          <label className="flex items-center space-x-2">
            <span className="text-white">Color:</span>
            <input
              type="color"
              value={propertyValues.color}
              onChange={(e) => handlePropertyChange("color", e.target.value)}
              className="p-1 rounded"
            />
          </label>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="block"
        style={{
          background: "#121212",
          cursor: dragStart ? "grabbing" : (isSelecting ? "crosshair" : (isHoveringText ? "move" : (isPanning ? "grab" : "default"))),
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
              fontSize: `${notes[note.id].fontSize}px`,
              fontFamily: notes[note.id].fontFamily,
              color: notes[note.id].color,
              lineHeight: `${notes[note.id].fontSize + 4}px`,
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