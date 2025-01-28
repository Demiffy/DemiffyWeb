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
// Removed Firebase Storage imports since we're not using it anymore
// import {
//   getStorage,
//   ref as storageRef,
//   uploadBytes,
//   getDownloadURL
// } from "firebase/storage";
import {
  FiMove,
  FiCheckSquare,
  FiType,
  FiImage,
  FiGrid,
  FiSquare
} from "react-icons/fi"; // Importing icons from react-icons

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
// Removed Firebase Storage initialization
// const storage = getStorage(app); // Initialize Firebase Storage

// Define the type for drawable items
interface TextItem {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  isDragging: boolean;
  isEditing: boolean;
  fontSize: number;
  fontFamily: string;
  color: string;
}

interface ImageItem {
  id: string;
  type: 'image';
  x: number;
  y: number;
  imageUrl: string;
  isDragging: boolean;
  isEditing: boolean; // Typically false for images
}

type DrawableItem = TextItem | ImageItem;

const Desinote: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [items, setItems] = useState<{ [id: string]: DrawableItem }>({});
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

  const inputRefs = useRef<{ [id: string]: HTMLInputElement | null }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State variables for selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  // Threshold to differentiate between click and drag (in pixels)
  const CLICK_THRESHOLD = 5;

  // State variables for dragging multiple notes
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [initialPositions, setInitialPositions] = useState<{ [id: string]: {x: number, y: number} }>({});

  // State for properties panel
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

  // State to track newly added items to prevent premature saving
  const newItemIdsRef = useRef<Set<string>>(new Set());

  // State to track current tool/mode
  type Tool = 'pan' | 'select' | 'text' | 'image';
  const [currentTool, setCurrentTool] = useState<Tool>('pan');

  // State to track if Spacebar is pressed
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  // Refs to track mouse down position and drag state
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (e.code === 'Space' && !(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
        // Only enable panning if the current tool is not explicitly "pan"
        if (currentTool === 'pan') return;
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
  
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Disable panning if the current tool is not explicitly "pan"
        if (currentTool === 'pan') return;
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentTool]);

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

  // Draw the text and images on the canvas
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

    // Draw items
    Object.values(items).forEach(item => {
      if (item.type === 'text' && !item.isEditing) {
        ctx.font = `${item.fontSize}px ${item.fontFamily}`;
        ctx.fillStyle = item.color;
        ctx.textBaseline = "top";

        const x = (item.x - viewportOffset.x);
        const y = (item.y - viewportOffset.y);

        ctx.fillText(item.text, x, y);

        if (selectedNotes.has(item.id)) {
          const textWidth = ctx.measureText(item.text).width;
          const textHeight = item.fontSize; // Approximation based on font size

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

      if (item.type === 'image') {
        const img = new Image();
        img.crossOrigin = "anonymous"; // To handle CORS for images from external sources
        img.src = item.imageUrl;
        img.onload = () => {
          const x = (item.x - viewportOffset.x);
          const y = (item.y - viewportOffset.y);
          ctx.drawImage(img, x, y);
        };
        img.onerror = () => {
          console.error(`Failed to load image at URL: ${item.imageUrl}`);
        };
      }
    });

    ctx.restore();

    // Draw selection rectangle if selecting and has dragged
    if (isSelecting && selectionStart && selectionEnd && hasDraggedRef.current) {
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
    items,
    canvasSize,
    scale,
    viewportOffset,
    gridEnabled,
    isSelecting,
    selectionStart,
    selectionEnd,
    selectedNotes,
    gridSize
  ]);

  // Redraw the canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Function to add a new text note at a specific position
  const addTextNoteAtPosition = (x: number, y: number) => {
    const notesRef = dbRef(db, `lessonNotes`);
    const newNoteRef = push(notesRef);
    const newNoteId = newNoteRef.key;
    if (newNoteId) {
      // Mark this ID as a new note to prevent premature saving
      newItemIdsRef.current.add(newNoteId);

      const defaultX = gridEnabled ? Math.round(x / gridSize) * gridSize : x;
      const defaultY = gridEnabled ? Math.round(y / gridSize) * gridSize : y;
      const newNote: TextItem = {
        id: newNoteId,
        type: 'text',
        x: defaultX,
        y: defaultY,
        text: "",
        isDragging: false,
        isEditing: true,
        fontSize: 16, // Default font size
        fontFamily: "Arial", // Default font family
        color: "#FFFFFF" // Default color (white)
      };
      set(newNoteRef, {
        id: newNote.id,
        type: newNote.type,
        content: newNote.text,
        x: newNote.x,
        y: newNote.y,
        fontSize: newNote.fontSize,
        fontFamily: newNote.fontFamily,
        color: newNote.color
      })
        .then(() => {
          setItems((prev) => ({
            ...prev,
            [newNoteId]: newNote,
          }));
          setSelectedNoteId(newNoteId);
          setSelectedNotes(new Set([newNoteId]));
          setDragStart(null); // Reset dragStart
          setInitialPositions({
            [newNoteId]: { x: newNote.x, y: newNote.y }
          });
          setShowProperties(true); // Show properties panel for the new note
          setPropertyValues({
            fontSize: newNote.fontSize,
            fontFamily: newNote.fontFamily,
            color: newNote.color
          });

          // Remove from newItemIds after state update
          // Using a timeout to ensure state has updated
          setTimeout(() => {
            newItemIdsRef.current.delete(newNoteId);
          }, 0);
        })
        .catch((error) => {
          console.error("Error adding new lesson note:", error);
          newItemIdsRef.current.delete(newNoteId); // Clean up on error
        });
    }
  };

  // **Modified Function: Add Image Using URL Instead of File**
  const addImageAtPosition = (x: number, y: number, imageUrl: string) => {
    // Validate the URL (basic validation)
    if (!isValidImageUrl(imageUrl)) {
      alert("Please enter a valid image or GIF URL.");
      return;
    }

    const imagesRef = dbRef(db, `lessonImages`);
    const newImageRef = push(imagesRef);
    const newImageId = newImageRef.key;
    if (newImageId) {
      const defaultX = gridEnabled ? Math.round(x / gridSize) * gridSize : x;
      const defaultY = gridEnabled ? Math.round(y / gridSize) * gridSize : y;
      const newImage: ImageItem = {
        id: newImageId,
        type: 'image',
        x: defaultX,
        y: defaultY,
        imageUrl: imageUrl,
        isDragging: false,
        isEditing: false
      };
      set(newImageRef, {
        id: newImage.id,
        type: newImage.type,
        imageUrl: newImage.imageUrl,
        x: newImage.x,
        y: newImage.y
      })
        .then(() => {
          setItems(prev => ({
            ...prev,
            [newImageId]: newImage,
          }));
          setSelectedNotes(new Set([newImageId]));
          setShowProperties(false);
        })
        .catch(error => {
          console.error("Error adding new image:", error);
        });
    }
  };

  // **Utility Function: Validate Image URL**
  const isValidImageUrl = (url: string): boolean => {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  };

  // **Modified Mouse Down Handler**
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle left mouse button
    if (event.button !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = (event.clientX - rect.left) / scale + viewportOffset.x;
    const y = (event.clientY - rect.top) / scale + viewportOffset.y;

    // Record mouse down position
    mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
    hasDraggedRef.current = false;

    if (currentTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      return;
    }

    if ((currentTool as string) !== 'pan' && isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      return;
    }

    if (currentTool === 'select') {
      // Check if clicked on a note or image to start dragging
      let clickedOnItem = false;
      let clickedItemId: string | null = null;

      // Preload images to get dimensions
      const checkImageClickPromises: Promise<void>[] = [];

      for (const item of Object.values(items)) {
        if (item.type === 'text') {
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.font = `${item.fontSize}px ${item.fontFamily}`;
          const textWidth = ctx.measureText(item.text).width;
          const textHeight = item.fontSize; // Approximation based on font size

          if (
            x >= item.x - 7 &&
            x <= item.x + textWidth + 7 &&
            y >= item.y - 7 &&
            y <= item.y + textHeight + 7
          ) {
            clickedOnItem = true;
            clickedItemId = item.id;
            break;
          }
        }

        if (item.type === 'image') {
          const img = new Image();
          const promise = new Promise<void>((resolve) => {
            img.onload = () => {
              const imgWidth = img.width;
              const imgHeight = img.height;
              if (
                x >= item.x &&
                x <= item.x + imgWidth &&
                y >= item.y &&
                y <= item.y + imgHeight
              ) {
                clickedOnItem = true;
                clickedItemId = item.id;
              }
              resolve();
            };
            img.onerror = () => {
              resolve();
            };
          });
          img.src = item.imageUrl;
          checkImageClickPromises.push(promise);
        }
      }

      Promise.all(checkImageClickPromises).then(() => {
        if (clickedOnItem && clickedItemId) {
          if (selectedNotes.has(clickedItemId)) {
            // Start dragging all selected items
            setDragStart({ x: event.clientX, y: event.clientY });

            const initialPos: { [id: string]: { x: number; y: number } } = {};
            selectedNotes.forEach(id => {
              const item = items[id];
              initialPos[id] = { x: item.x, y: item.y };
            });
            setInitialPositions(initialPos);
          } else {
            // Select only the clicked item
            setSelectedNotes(new Set([clickedItemId]));
            setDragStart({ x: event.clientX, y: event.clientY });
            setInitialPositions({
              [clickedItemId]: { x: items[clickedItemId].x, y: items[clickedItemId].y }
            });
            setShowProperties(true);
            if (items[clickedItemId].type === 'text') {
              const textItem = items[clickedItemId] as TextItem;
              setPropertyValues({
                fontSize: textItem.fontSize,
                fontFamily: textItem.fontFamily,
                color: textItem.color
              });
            }
          }
        } else {
          // Start selection
          setIsSelecting(true);
          setSelectionStart({ x, y });
          setSelectionEnd({ x, y });

          // Deselect all items when starting a new selection
          setSelectedNotes(new Set());

          // Reset dragging state
          setSelectedNoteId(null);
        }
      });
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

      // Check if movement exceeds threshold
      if (mouseDownPosRef.current) {
        const dx = event.clientX - mouseDownPosRef.current.x;
        const dy = event.clientY - mouseDownPosRef.current.y;
        const distance = Math.hypot(dx, dy);
        if (distance > CLICK_THRESHOLD && !hasDraggedRef.current) {
          hasDraggedRef.current = true;
          setIsSelecting(true);
        }
      }
      return;
    }

    if (dragStart) {
      const currentX = event.clientX;
      const currentY = event.clientY;

      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;

      // Update positions based on delta
      const updatedItems: { [id: string]: DrawableItem } = { ...items };
      selectedNotes.forEach(id => {
        const initialPos = initialPositions[id];
        if (initialPos) {
          const newX = initialPos.x + deltaX / scale;
          const newY = initialPos.y + deltaY / scale;

          if (updatedItems[id].type === 'text') {
            updatedItems[id] = {
              ...updatedItems[id],
              x: gridEnabled ? Math.round(newX / gridSize) * gridSize : newX,
              y: gridEnabled ? Math.round(newY / gridSize) * gridSize : newY,
            };
          }

          if (updatedItems[id].type === 'image') {
            updatedItems[id] = {
              ...updatedItems[id],
              x: gridEnabled ? Math.round(newX / gridSize) * gridSize : newX,
              y: gridEnabled ? Math.round(newY / gridSize) * gridSize : newY,
            };
          }
        }
      });

      setItems(updatedItems);
      return;
    }

    // Existing hover logic
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = (event.clientX - rect.left) / scale + viewportOffset.x;
    const y = (event.clientY - rect.top) / scale + viewportOffset.y;

    let hovering = false;
    const hoverPromises: Promise<void>[] = [];

    for (const item of Object.values(items)) {
      if (item.type === 'text') {
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.font = `${item.fontSize}px ${item.fontFamily}`;
        const textWidth = ctx.measureText(item.text).width;
        const textHeight = item.fontSize; // Approximation based on font size

        if (
          x >= item.x &&
          x <= item.x + textWidth &&
          y >= item.y &&
          y <= item.y + textHeight
        ) {
          hovering = true;
          break;
        }
      }

      if (item.type === 'image') {
        const img = new Image();
        img.crossOrigin = "anonymous"; // To handle CORS for images from external sources
        const promise = new Promise<void>((resolve) => {
          img.onload = () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            if (
              x >= item.x &&
              x <= item.x + imgWidth &&
              y >= item.y &&
              y <= item.y + imgHeight
            ) {
              hovering = true;
            }
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
        });
        img.src = item.imageUrl;
        hoverPromises.push(promise);
      }
    }

    Promise.all(hoverPromises).then(() => {
      setIsHoveringText(hovering);
    });
  };

  // Handle mouse up to stop dragging or panning or finalize selection
  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (dragStart) {
      // Finalize dragging
      // Save all selectedNotes' new positions, excluding newly added items
      selectedNotes.forEach(id => {
        const item = items[id];
        if (item) { 
          if (newItemIdsRef.current.has(id)) {
            // Skip saving newly added items
            console.log(`Skipping save for new item ID: ${id}`);
            return;
          }
          saveLessonItem(item);
        } else {
          console.error(`Cannot save item ${id} because it is undefined.`);
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

        const checkImageSelectionPromises: Promise<void>[] = [];

        for (const item of Object.values(items)) {
          if (item.type === 'text') {
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) continue;
            ctx.font = `${item.fontSize}px ${item.fontFamily}`;
            const textWidth = ctx.measureText(item.text).width;
            const textHeight = item.fontSize; // Approximation based on font size

            if (
              item.x >= selX1 &&
              item.x + textWidth <= selX2 &&
              item.y >= selY1 &&
              item.y + textHeight <= selY2
            ) {
              newSelectedNotes.add(item.id);
            }
          }

          if (item.type === 'image') {
            const img = new Image();
            img.crossOrigin = "anonymous"; // To handle CORS
            const promise = new Promise<void>((resolve) => {
              img.onload = () => {
                const imgWidth = img.width;
                const imgHeight = img.height;
                if (
                  item.x >= selX1 &&
                  item.x + imgWidth <= selX2 &&
                  item.y >= selY1 &&
                  item.y + imgHeight <= selY2
                ) {
                  newSelectedNotes.add(item.id);
                }
                resolve();
              };
              img.onerror = () => {
                resolve();
              };
            });
            img.src = item.imageUrl;
            checkImageSelectionPromises.push(promise);
          }
        }

        Promise.all(checkImageSelectionPromises).then(() => {
          setSelectedNotes(newSelectedNotes);
          setShowProperties(newSelectedNotes.size > 0);
          if (newSelectedNotes.size === 1) {
            const singleId = Array.from(newSelectedNotes)[0];
            const singleItem = items[singleId];
            if (singleItem.type === 'text') {
              setPropertyValues({
                fontSize: singleItem.fontSize,
                fontFamily: singleItem.fontFamily,
                color: singleItem.color
              });
            }
          } else {
            // For multiple items, set default values or handle differently
            setPropertyValues({
              fontSize: 16,
              fontFamily: "Arial",
              color: "#FFFFFF"
            });
          }
        });
      }

      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      hasDraggedRef.current = false;
      mouseDownPosRef.current = null;
      return;
    }

    // No additional handling needed for text items as editing is managed elsewhere
  }, [isPanning, dragStart, selectedNotes, items, isSelecting, selectionStart, selectionEnd]);

  useEffect(() => {
    // Add global mouseup listener to handle cases where mouse is released outside the canvas
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    // Add global mouseup listener when selecting, dragging, or panning
    if (isSelecting || dragStart || isPanning) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSelecting, dragStart, isPanning, handleMouseUp]);

  // Handle double click to start editing or add a new text/image
  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = (event.clientX - rect.left) / scale + viewportOffset.x;
    const y = (event.clientY - rect.top) / scale + viewportOffset.y;

    if (currentTool === 'text') {
      addTextNoteAtPosition(x, y);
    }

    if (currentTool === 'image') {
      // **Modified: Prompt for Image URL Instead of Opening File Dialog**
      const imageUrl = prompt("Enter the Image or GIF URL:");
      if (imageUrl) {
        addImageAtPosition(x, y, imageUrl.trim());
      }
    }
  };  

  // Handle input change for text notes
  const handleInputChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    const caretPosition = event.target.selectionStart;

    setItems(prev => ({
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
      const item = items[id];
      if (item && item.type === 'text') {
        ctx.font = `${item.fontSize}px ${item.fontFamily}`;
        const textWidth = ctx.measureText(text).width;
        setInputWidths(prev => ({
          ...prev,
          [id]: Math.max(100, textWidth + 20)
        }));
      }
    }
  };  

  // Handle input blur to stop editing
  const handleInputBlur = (id: string) => {
    setItems(prev => ({
      ...prev,
      [id]: { ...prev[id], isEditing: false }
    }));
    const item = items[id];
    if (item && item.type === 'text') {
      if (item.text) {
        saveLessonItem(item);
      } else {
        deleteLessonItem(id);
      }
    }
    setShowProperties(selectedNotes.size > 0);
  };

  // Handle key presses within the input
  const handleKeyDown = (id: string, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Escape") {
      setItems(prev => ({
        ...prev,
        [id]: { ...prev[id], isEditing: false }
      }));
      const item = items[id];
      if (item && item.type === 'text') {
        if (item.text) {
          saveLessonItem(item);
        } else {
          deleteLessonItem(id);
        }
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
          setItems(prev => ({
            ...prev,
            [id]: { ...prev[id], isEditing: false }
          }));
          const item = items[id];
          if (item && item.type === 'text') {
            if (item.text) {
              saveLessonItem(item);
            } else {
              deleteLessonItem(id);
            }
          }
          setShowProperties(selectedNotes.size > 0);
        }
      });
    };

    if (Object.values(items).some(item => item.isEditing)) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [items, selectedNotes]);

  // Calculate input positions
  const [inputPositions, setInputPositions] = useState<{ [id: string]: { top: number; left: number } }>({});

  useEffect(() => {
    const newPositions: { [id: string]: { top: number; left: number } } = {};
    Object.values(items).forEach(item => {
      if (item.type === 'text' && item.isEditing && canvasRef.current && containerRef.current) {
        const offsetAdjustment = -2.7 * scale;
        newPositions[item.id] = {
          top: (item.y - viewportOffset.y) * scale + offsetAdjustment,
          left: (item.x - viewportOffset.x) * scale,
        };
      }
    });
    setInputPositions(newPositions);
  }, [items, scale, viewportOffset]);

  // Function to save lesson item to Firebase
  const saveLessonItem = (item: DrawableItem) => {
    if (!item) {
      console.error(`Attempted to save an undefined item.`);
      return;
    }

    if (item.type === 'text') {
      if (typeof item.text !== 'string') {
        console.error(`Cannot save text item ${item.id} with undefined or non-string 'text'`);
        return;
      }

      if (item.text.trim() === "") {
        deleteLessonItem(item.id);
        return;
      }

      const itemRef = dbRef(db, `lessonNotes/${item.id}`);
      set(itemRef, {
        id: item.id,
        type: item.type,
        content: item.text,
        x: item.x,
        y: item.y,
        fontSize: item.fontSize,
        fontFamily: item.fontFamily,
        color: item.color
      }).catch((error) => {
        console.error("Error saving lesson item:", error);
      });
    }

    if (item.type === 'image') {
      const itemRef = dbRef(db, `lessonImages/${item.id}`);
      set(itemRef, {
        id: item.id,
        type: item.type,
        imageUrl: item.imageUrl,
        x: item.x,
        y: item.y
      }).catch((error) => {
        console.error("Error saving lesson image:", error);
      });
    }
  };

  // Function to delete a lesson item from Firebase
  const deleteLessonItem = (id: string) => {
    // Determine if the item is text or image
    const item = items[id];
    if (!item) return;

    if (item.type === 'text') {
      const itemRef = dbRef(db, `lessonNotes/${id}`);
      remove(itemRef).catch((error) => {
        console.error(`Error deleting lesson note ${id}:`, error);
      });
    }

    if (item.type === 'image') {
      const itemRef = dbRef(db, `lessonImages/${id}`);
      remove(itemRef).catch((error) => {
        console.error(`Error deleting lesson image ${id}:`, error);
      });
    }

    // Remove from state
    setItems(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  // Function to load lesson items from Firebase
  const loadLessonItems = () => {
    const notesRef = dbRef(db, `lessonNotes`);
    const imagesRef = dbRef(db, `lessonImages`);

    const listenerNotes = onValue(
      notesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setItems(prevNotes => {
            const validatedNotes: { [id: string]: DrawableItem } = { ...prevNotes };
            Object.keys(data).forEach((id) => {
              const note = data[id];
              validatedNotes[id] = {
                id: note.id || id,
                type: 'text',
                x: typeof note.x === "number" ? note.x : 100,
                y: typeof note.y === "number" ? note.y : 100,
                text: typeof note.content === "string" ? note.content : "",
                isDragging: false,
                isEditing: prevNotes[id]?.isEditing || false, // Preserve isEditing
                fontSize: typeof note.fontSize === "number" ? note.fontSize : 16,
                fontFamily: typeof note.fontFamily === "string" ? note.fontFamily : "Arial",
                color: typeof note.color === "string" ? note.color : "#FFFFFF",
              };
            });
            return validatedNotes;
          });
        } else {
          setItems(prevNotes => {
            // Remove all text notes if none are present in Firebase
            const updated = { ...prevNotes };
            Object.keys(updated).forEach(id => {
              if (updated[id].type === 'text') {
                delete updated[id];
              }
            });
            return updated;
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading lesson notes:", error);
        setIsLoading(false);
      }
    );

    const listenerImages = onValue(
      imagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setItems(prevImages => {
            const validatedImages: { [id: string]: DrawableItem } = { ...prevImages };
            Object.keys(data).forEach((id) => {
              const image = data[id];
              validatedImages[id] = {
                id: image.id || id,
                type: 'image',
                x: typeof image.x === "number" ? image.x : 100,
                y: typeof image.y === "number" ? image.y : 100,
                imageUrl: typeof image.imageUrl === "string" ? image.imageUrl : "",
                isDragging: false,
                isEditing: false,
              };
            });
            return validatedImages;
          });
        } else {
          setItems(prevImages => {
            // Remove all image items if none are present in Firebase
            const updated = { ...prevImages };
            Object.keys(updated).forEach(id => {
              if (updated[id].type === 'image') {
                delete updated[id];
              }
            });
            return updated;
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading lesson images:", error);
        setIsLoading(false);
      }
    );

    return () => {
      off(notesRef, "value", listenerNotes);
      off(imagesRef, "value", listenerImages);
    };
  };

  // Load lesson items on component mount
  useEffect(() => {
    loadLessonItems();
  }, []);

  // Focus on the input field when a new text note is selected for editing
  useEffect(() => {
    if (selectedNoteId && items[selectedNoteId]?.isEditing && items[selectedNoteId].type === 'text') {
      const input = inputRefs.current[selectedNoteId];
      if (input) {
        input.focus();
        if (input.value.length) {
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
    }
  }, [selectedNoteId, items]);

  // Handle changes in the properties panel
  const handlePropertyChange = (property: keyof typeof propertyValues, value: any) => {
    setPropertyValues(prev => ({
      ...prev,
      [property]: value
    }));

    // Update all selected text notes with the new property, excluding newly added items
    const updatedItems: { [id: string]: DrawableItem } = { ...items };
    selectedNotes.forEach(id => {
      if (!newItemIdsRef.current.has(id) && updatedItems[id].type === 'text') { // **Skip newly added items and only update text items**
        updatedItems[id] = {
          ...updatedItems[id],
          [property]: value
        };
      }
    });
    setItems(updatedItems);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Top Bar */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-4 bg-opacity-75 backdrop-filter backdrop-blur-lg p-2 rounded shadow-lg">
        {/* Pan Tool */}
        <button
          onClick={() => setCurrentTool('pan')}
          className={`p-2 rounded ${currentTool === 'pan' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
          title="Pan"
        >
          <FiMove size={24} color="#FFFFFF" />
        </button>

        {/* Select Tool */}
        <button
          onClick={() => setCurrentTool('select')}
          className={`p-2 rounded ${currentTool === 'select' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
          title="Select"
        >
          <FiCheckSquare size={24} color="#FFFFFF" />
        </button>

        {/* Add Text Tool */}
        <button
          onClick={() => setCurrentTool('text')}
          className={`p-2 rounded ${currentTool === 'text' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
          title="Add Text"
        >
          <FiType size={24} color="#FFFFFF" />
        </button>

        {/* Add Image Tool */}
        <button
          onClick={() => setCurrentTool('image')}
          className={`p-2 rounded ${currentTool === 'image' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
          title="Add Image"
        >
          <FiImage size={24} color="#FFFFFF" />
        </button>

        {/* Grid Lock Toggle */}
        <button
          onClick={() => setGridEnabled(prev => !prev)}
          className={`p-2 rounded ${gridEnabled ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
          title="Grid Lock"
        >
          {gridEnabled ? <FiGrid size={24} color="#FFFFFF" /> : <FiSquare size={24} color="#FFFFFF" />}
        </button>
      </div>

      {/* Display selected items count */}
      {selectedNotes.size > 0 && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-20 bg-opacity-75 backdrop-filter backdrop-blur-lg p-2 rounded shadow-lg">
          <span className="text-sm text-white">{selectedNotes.size} item(s) selected</span>
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
              {/* Add more fonts as desired */}
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
          cursor: currentTool === 'pan' ? (isPanning ? "grabbing" : "grab") :
                  currentTool === 'select' ? (isHoveringText ? "move" : (isSelecting && hasDraggedRef.current ? "crosshair" : "default")) :
                  "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        // Removed onMouseUp to handle globally
        onDoubleClick={handleDoubleClick}
      />

      {/* Input Fields for Text Notes */}
      {Object.values(items).map(item => (
        item.type === 'text' && item.isEditing && (
          <input
            key={item.id}
            ref={(el) => inputRefs.current[item.id] = el}
            type="text"
            value={item.text}
            onChange={(e) => handleInputChange(item.id, e)}
            onBlur={() => handleInputBlur(item.id)}
            onKeyDown={(e) => handleKeyDown(item.id, e)}
            className="absolute bg-transparent border-b border-white text-white z-10"
            style={{
              top: inputPositions[item.id]?.top || 0,
              left: inputPositions[item.id]?.left || 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              fontSize: `${item.fontSize}px`,
              fontFamily: item.fontFamily,
              color: item.color,
              lineHeight: `${item.fontSize + 4}px`,
              outline: "none",
              border: "none",
              caretColor: "white",
              width: `${inputWidths[item.id] || 100}px`,
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