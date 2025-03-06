import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  initializeApp,
  getApps,
  getApp,
} from "firebase/app";
import {
  getDatabase,
  ref as dbRef,
  set,
  onValue,
  push,
  off,
  remove,
} from "firebase/database";
import {
  FiMove,
  FiCheckSquare,
  FiType,
  FiImage,
  FiGrid,
  FiSquare,
} from "react-icons/fi";

// --------------------- Firebase Initialization ---------------------
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

// --------------------- Type Definitions ---------------------
interface TextItem {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  isDragging: boolean;
  isEditing: boolean;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isUnderline: boolean;
  isCrossedOut: boolean;
}

interface ImageItem {
  id: string;
  type: "image";
  x: number;
  y: number;
  imageUrl: string;
  isDragging: boolean;
  isEditing: boolean;
  width: number;
  height: number;
}

type DrawableItem = TextItem | ImageItem;

// --------------------- Main Component ---------------------
const Desinote: React.FC = () => {
  // Refs and States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRefs = useRef<{ [id: string]: HTMLInputElement | null }>({});
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const newItemIdsRef = useRef<Set<string>>(new Set());
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef<boolean>(false);

  const [items, setItems] = useState<{ [id: string]: DrawableItem }>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [inputWidths, setInputWidths] = useState<{ [id: string]: number }>({});
  const [inputPositions, setInputPositions] = useState<{
    [id: string]: { top: number; left: number };
  }>({});
  const [scale, setScale] = useState(1);
  const [viewportOffset, setViewportOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [gridEnabled, setGridEnabled] = useState(false);
  const gridSize = 20;
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringItem, setIsHoveringItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPositions, setInitialPositions] = useState<{ [id: string]: { x: number; y: number } }>({});
  const [resizingImage, setResizingImage] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [propertyValues, setPropertyValues] = useState<{
    fontSize: number;
    fontFamily: string;
    color: string;
    bold: boolean;
    underline: boolean;
    crossedOut: boolean;
  }>({
    fontSize: 16,
    fontFamily: "Arial",
    color: "#FFFFFF",
    bold: false,
    underline: false,
    crossedOut: false,
  });
  const [currentTool, setCurrentTool] = useState<"pan" | "select" | "text" | "image">("pan");
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const CLICK_THRESHOLD = 5;

  // --------------------- Helper Functions ---------------------
  const getWorldCoordinates = useCallback(
    (
      event: React.MouseEvent<HTMLCanvasElement> | MouseEvent,
      canvas: HTMLCanvasElement
    ) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event as MouseEvent).clientX - rect.left) / scale + viewportOffset.x,
        y: ((event as MouseEvent).clientY - rect.top) / scale + viewportOffset.y,
      };
    },
    [scale, viewportOffset]
  );

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5 / scale;
    const startX = Math.floor(viewportOffset.x / gridSize) * gridSize;
    const endX = viewportOffset.x + canvasWidth / scale;
    const startY = Math.floor(viewportOffset.y / gridSize) * gridSize;
    const endY = viewportOffset.y + canvasHeight / scale;
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x - viewportOffset.x, 0);
      ctx.lineTo(x - viewportOffset.x, canvasHeight / scale);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y - viewportOffset.y);
      ctx.lineTo(canvasWidth / scale, y - viewportOffset.y);
      ctx.stroke();
    }
  };

  const drawText = (
    ctx: CanvasRenderingContext2D,
    item: TextItem,
    selected: boolean
  ) => {
    const x = item.x - viewportOffset.x;
    const y = item.y - viewportOffset.y;
    ctx.font = `${item.isBold ? "bold " : ""}${item.fontSize}px ${item.fontFamily}`;
    ctx.fillStyle = item.color;
    ctx.textBaseline = "top";
    ctx.fillText(item.text, x, y);
    const textWidth = ctx.measureText(item.text).width;
    if (item.isUnderline) {
      ctx.beginPath();
      ctx.moveTo(x, y + item.fontSize);
      ctx.lineTo(x + textWidth, y + item.fontSize);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1 / scale;
      ctx.stroke();
    }
    if (item.isCrossedOut) {
      ctx.beginPath();
      ctx.moveTo(x, y + item.fontSize / 2);
      ctx.lineTo(x + textWidth, y + item.fontSize / 2);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1 / scale;
      ctx.stroke();
    }
    if (selected) {
      const borderRadius = 6,
        padding = 8,
        paddingTop = 6,
        paddingBottom = 1;
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
        y + item.fontSize + paddingBottom,
        borderRadius
      );
      ctx.arcTo(
        x + textWidth + padding,
        y + item.fontSize + paddingBottom,
        x - padding,
        y + item.fontSize + paddingBottom,
        borderRadius
      );
      ctx.arcTo(x - padding, y + item.fontSize + paddingBottom, x - padding, y - paddingTop, borderRadius);
      ctx.arcTo(x - padding, y - paddingTop, x + textWidth + padding, y - paddingTop, borderRadius);
      ctx.closePath();
      ctx.stroke();
    }
  };

  const drawImageItem = (
    ctx: CanvasRenderingContext2D,
    item: ImageItem,
    selected: boolean
  ) => {
    const x = item.x - viewportOffset.x;
    const y = item.y - viewportOffset.y;
    const cachedImage = imageCacheRef.current.get(item.imageUrl);
    if (cachedImage && cachedImage.complete) {
      ctx.drawImage(cachedImage, x, y, item.width, item.height);
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = item.imageUrl;
      img.onload = () => {
        imageCacheRef.current.set(item.imageUrl, img);
        drawCanvas();
      };
      img.onerror = () => console.error(`Failed to load image at URL: ${item.imageUrl}`);
    }
    if (selected) {
      const baseLineWidth = 2,
        baseDashLength = 6,
        basePadding = 4,
        baseHandleSize = 14;
      const adjustedLineWidth = baseLineWidth / scale;
      const adjustedDash = [baseDashLength / scale];
      const adjustedPadding = basePadding / scale;
      const adjustedHandleSize = baseHandleSize / scale;
      ctx.strokeStyle = "rgba(0, 123, 255, 0.8)";
      ctx.lineWidth = adjustedLineWidth;
      ctx.setLineDash(adjustedDash);
      ctx.strokeRect(
        x - adjustedPadding,
        y - adjustedPadding,
        item.width + 2 * adjustedPadding,
        item.height + 2 * adjustedPadding
      );
      ctx.setLineDash([]);
      const handleX = x + item.width - adjustedHandleSize;
      const handleY = y + item.height - adjustedHandleSize;
      ctx.fillStyle = "rgba(0, 123, 255, 0.9)";
      ctx.fillRect(handleX, handleY, adjustedHandleSize, adjustedHandleSize);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = adjustedLineWidth;
      ctx.strokeRect(handleX, handleY, adjustedHandleSize, adjustedHandleSize);
    }
  };

  // --------------------- Canvas Drawing ---------------------
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

    if (gridEnabled) drawGrid(ctx, canvas.width, canvas.height);

    // Draw images first, then texts
    const allItems = Object.values(items);
    const images = allItems.filter((it) => it.type === "image") as ImageItem[];
    const texts = allItems.filter((it) => it.type === "text") as TextItem[];

    images.forEach((item) =>
      drawImageItem(ctx, item, selectedNotes.has(item.id))
    );
    texts.forEach((item) =>
      drawText(ctx, item, selectedNotes.has(item.id))
    );
    ctx.restore();

    // Draw selection rectangle if selecting and dragged
    if (isSelecting && selectionStart && selectionEnd && hasDraggedRef.current) {
      const ctxSel = canvas.getContext("2d");
      if (ctxSel) {
        ctxSel.save();
        ctxSel.scale(scale, scale);
        ctxSel.strokeStyle = "rgba(0, 123, 255, 0.5)";
        ctxSel.lineWidth = 1;
        ctxSel.setLineDash([6]);
        ctxSel.fillStyle = "rgba(0, 123, 255, 0.2)";
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
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // --------------------- Canvas Size and Zoom ---------------------
  const updateCanvasSize = useCallback(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollbarHeight = window.innerHeight - document.documentElement.clientHeight;
    setCanvasSize({
      width: window.innerWidth - scrollbarWidth,
      height: window.innerHeight - scrollbarHeight,
    });
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      const zoomFactor = 0.1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const { clientX, clientY } = event;
      const worldX = (clientX - rect.left) / scale + viewportOffset.x;
      const worldY = (clientY - rect.top) / scale + viewportOffset.y;
      setScale((prev) => {
        let newScale = event.deltaY < 0 ? prev + zoomFactor : prev - zoomFactor;
        newScale = Math.min(Math.max(newScale, 0.5), 3);
        setViewportOffset({
          x: worldX - (clientX - rect.left) / newScale,
          y: worldY - (clientY - rect.top) / newScale,
        });
        return newScale;
      });
    },
    [scale, viewportOffset]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    canvas.addEventListener("wheel", wheelHandler, { passive: false });
    return () => canvas.removeEventListener("wheel", wheelHandler);
  }, [handleWheel]);

  // --------------------- Keyboard Handlers ---------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (e.code === "Space" && !(active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)) {
        if (currentTool === "pan") return;
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (currentTool === "pan") return;
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentTool]);

  // --------------------- Firebase Loading ---------------------
  const loadLessonNotes = () => {
    const notesRef = dbRef(db, "lessonNotes");
    const listener = onValue(
      notesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const validated: { [id: string]: DrawableItem } = {};
          const newWidths: { [id: string]: number } = {};
          Object.keys(data).forEach((id) => {
            const note = data[id];
            validated[id] = {
              id: note.id || id,
              type: "text",
              x: typeof note.x === "number" ? note.x : 100,
              y: typeof note.y === "number" ? note.y : 100,
              text: typeof note.content === "string" ? note.content : "",
              isDragging: false,
              isEditing: false,
              fontSize: typeof note.fontSize === "number" ? note.fontSize : 16,
              fontFamily: typeof note.fontFamily === "string" ? note.fontFamily : "Arial",
              color: typeof note.color === "string" ? note.color : "#FFFFFF",
              isBold: !!note.isBold,
              isUnderline: !!note.isUnderline,
              isCrossedOut: !!note.isCrossedOut,
            };
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.font = `${validated[id].fontSize}px ${validated[id].fontFamily}`;
              const textWidth = ctx.measureText(note.content || "").width;
              newWidths[id] = Math.max(100, textWidth + 20);
            }
          });
          setItems((prev) => ({ ...prev, ...validated }));
          setInputWidths((prev) => ({ ...prev, ...newWidths }));
        } else {
          setItems((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((id) => {
              if (updated[id].type === "text") delete updated[id];
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
    return () => off(notesRef, "value", listener);
  };

  const loadLessonImages = () => {
    const imagesRef = dbRef(db, "lessonImages");
    const listener = onValue(
      imagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const validated: { [id: string]: DrawableItem } = {};
          Object.keys(data).forEach((id) => {
            const image = data[id];
            validated[id] = {
              id: image.id || id,
              type: "image",
              x: typeof image.x === "number" ? image.x : 100,
              y: typeof image.y === "number" ? image.y : 100,
              imageUrl: typeof image.imageUrl === "string" ? image.imageUrl : "",
              isDragging: false,
              isEditing: false,
              width: typeof image.width === "number" ? image.width : 100,
              height: typeof image.height === "number" ? image.height : 100,
            };
            if (image.imageUrl && !imageCacheRef.current.get(image.imageUrl)) {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.src = image.imageUrl;
              img.onload = () => {
                imageCacheRef.current.set(image.imageUrl, img);
                drawCanvas();
              };
              img.onerror = () =>
                console.error(`Failed to load image at URL: ${image.imageUrl}`);
            }
          });
          setItems((prev) => ({ ...prev, ...validated }));
        } else {
          setItems((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((id) => {
              if (updated[id].type === "image") delete updated[id];
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
    return () => off(imagesRef, "value", listener);
  };

  useEffect(() => {
    loadLessonNotes();
    loadLessonImages();
  }, []);

  // --------------------- Mouse Event Handlers ---------------------
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getWorldCoordinates(event, canvas);
    // Check for image resize on selected image items (only when in select mode)
    if (currentTool === "select") {
      const baseHandleSize = 14;
      const adjustedHandleSize = baseHandleSize / scale;
      for (const id of selectedNotes) {
        const item = items[id];
        if (item && item.type === "image") {
          if (
            x >= item.x + item.width - adjustedHandleSize &&
            x <= item.x + item.width &&
            y >= item.y + item.height - adjustedHandleSize &&
            y <= item.y + item.height
          ) {
            setResizingImage({
              id: item.id,
              startX: event.clientX,
              startY: event.clientY,
              initialWidth: item.width,
              initialHeight: item.height,
            });
            return;
          }
        }
      }
    }
    mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
    hasDraggedRef.current = false;
    if (currentTool === "pan" || isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: event.clientX, y: event.clientY });
      return;
    }
    if (currentTool === "select") {
      let clickedOnItem = false;
      let clickedItemId: string | null = null;
      let clickedItemType: "text" | "image" | null = null;
      const itemsArray = Object.values(items);
      // Draw texts on top so reverse order
      const orderedItems = [...itemsArray.filter(it => it.type === "text"), ...itemsArray.filter(it => it.type === "image")];
      const checkImagePromises: Promise<void>[] = [];
      for (let i = orderedItems.length - 1; i >= 0; i--) {
        const item = orderedItems[i];
        if (item.type === "text") {
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.font = `${item.fontSize}px ${item.fontFamily}`;
          const textWidth = ctx.measureText(item.text).width;
          if (
            x >= item.x - 7 &&
            x <= item.x + textWidth + 7 &&
            y >= item.y - 7 &&
            y <= item.y + item.fontSize + 7
          ) {
            clickedOnItem = true;
            clickedItemId = item.id;
            clickedItemType = "text";
            break;
          }
        } else if (item.type === "image") {
          const cached = imageCacheRef.current.get(item.imageUrl);
          if (cached && cached.complete) {
            if (
              x >= item.x &&
              x <= item.x + item.width &&
              y >= item.y &&
              y <= item.y + item.height
            ) {
              clickedOnItem = true;
              clickedItemId = item.id;
              clickedItemType = "image";
              break;
            }
          } else {
            const img = new Image();
            img.crossOrigin = "anonymous";
            const promise = new Promise<void>((resolve) => {
              img.onload = () => {
                imageCacheRef.current.set(item.imageUrl, img);
                if (
                  x >= item.x &&
                  x <= item.x + img.width &&
                  y >= item.y &&
                  y <= item.y + img.height
                ) {
                  clickedOnItem = true;
                  clickedItemId = item.id;
                  clickedItemType = "image";
                }
                resolve();
              };
              img.onerror = () => resolve();
            });
            img.src = item.imageUrl;
            checkImagePromises.push(promise);
          }
        }
      }
      Promise.all(checkImagePromises).then(() => {
        if (clickedOnItem && clickedItemId) {
          if (selectedNotes.has(clickedItemId)) {
            setDragStart({ x: event.clientX, y: event.clientY });
            const initPos: { [id: string]: { x: number; y: number } } = {};
            selectedNotes.forEach((id) => {
              const it = items[id];
              if (it) initPos[id] = { x: it.x, y: it.y };
            });
            setInitialPositions(initPos);
          } else {
            setSelectedNotes(new Set([clickedItemId]));
            setDragStart({ x: event.clientX, y: event.clientY });
            setInitialPositions({
              [clickedItemId]: { x: items[clickedItemId].x, y: items[clickedItemId].y },
            });
            setShowProperties(clickedItemType === "text");
            if (clickedItemType === "text") {
              const textItem = items[clickedItemId] as TextItem;
              setPropertyValues({
                fontSize: textItem.fontSize,
                fontFamily: textItem.fontFamily,
                color: textItem.color,
                bold: textItem.isBold,
                underline: textItem.isUnderline,
                crossedOut: textItem.isCrossedOut,
              });
            }
          }
        } else {
          setIsSelecting(true);
          setSelectionStart({ x, y });
          setSelectionEnd({ x, y });
          setSelectedNotes(new Set());
          setSelectedNoteId(null);
        }
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (resizingImage) {
      const deltaX = event.clientX - resizingImage.startX;
      const deltaY = event.clientY - resizingImage.startY;
      if (!event.shiftKey) {
        const newWidth = Math.max(20, resizingImage.initialWidth + deltaX / scale);
        const aspectRatio = resizingImage.initialWidth / resizingImage.initialHeight;
        const newHeight = Math.max(20, newWidth / aspectRatio);
        setItems((prev) => ({
          ...prev,
          [resizingImage.id]: {
            ...prev[resizingImage.id],
            width: newWidth,
            height: newHeight,
          },
        }));
      } else {
        setItems((prev) => ({
          ...prev,
          [resizingImage.id]: {
            ...prev[resizingImage.id],
            width: Math.max(20, resizingImage.initialWidth + deltaX / scale),
            height: Math.max(20, resizingImage.initialHeight + deltaY / scale),
          },
        }));
      }
      return;
    }
    if (isPanning) {
      const deltaX = event.clientX - panStart.x;
      const deltaY = event.clientY - panStart.y;
      setPanStart({ x: event.clientX, y: event.clientY });
      setViewportOffset((prev) => ({
        x: prev.x - deltaX / scale,
        y: prev.y - deltaY / scale,
      }));
      return;
    }
    if (isSelecting) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { x, y } = getWorldCoordinates(event, canvas);
      setSelectionEnd({ x, y });
      if (mouseDownPosRef.current) {
        const dx = event.clientX - mouseDownPosRef.current.x;
        const dy = event.clientY - mouseDownPosRef.current.y;
        if (Math.hypot(dx, dy) > CLICK_THRESHOLD && !hasDraggedRef.current) {
          hasDraggedRef.current = true;
          setIsSelecting(true);
        }
      }
      return;
    }
    if (dragStart) {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      const updated: { [id: string]: DrawableItem } = { ...items };
      selectedNotes.forEach((id) => {
        const init = initialPositions[id];
        if (init) {
          const newX = init.x + deltaX / scale;
          const newY = init.y + deltaY / scale;
          updated[id] = {
            ...updated[id],
            x: gridEnabled ? Math.round(newX / gridSize) * gridSize : newX,
            y: gridEnabled ? Math.round(newY / gridSize) * gridSize : newY,
          };
        }
      });
      setItems(updated);
      return;
    }
    // Hover detection
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getWorldCoordinates(event, canvas);
    let hovering = false;
    const hoverPromises: Promise<void>[] = [];
    for (const it of Object.values(items)) {
      if (it.type === "text") {
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.font = `${it.fontSize}px ${it.fontFamily}`;
        const textWidth = ctx.measureText(it.text).width;
        if (x >= it.x && x <= it.x + textWidth && y >= it.y && y <= it.y + it.fontSize) {
          hovering = true;
          break;
        }
      } else if (it.type === "image") {
        const cached = imageCacheRef.current.get(it.imageUrl);
        if (cached && cached.complete) {
          if (x >= it.x && x <= it.x + it.width && y >= it.y && y <= it.y + it.height) {
            hovering = true;
            break;
          }
        } else {
          const img = new Image();
          img.crossOrigin = "anonymous";
          const promise = new Promise<void>((resolve) => {
            img.onload = () => {
              imageCacheRef.current.set(it.imageUrl, img);
              if (x >= it.x && x <= it.x + img.width && y >= it.y && y <= it.y + img.height) {
                hovering = true;
              }
              resolve();
            };
            img.onerror = () => resolve();
          });
          img.src = it.imageUrl;
          hoverPromises.push(promise);
        }
      }
    }
    Promise.all(hoverPromises).then(() => setIsHoveringItem(hovering));
  };

  const handleMouseUp = useCallback(() => {
    if (resizingImage) {
      const resized = items[resizingImage.id];
      if (resized) saveLessonItem(resized);
      setResizingImage(null);
      return;
    }
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (dragStart) {
      selectedNotes.forEach((id) => {
        const item = items[id];
        if (item) {
          if (newItemIdsRef.current.has(id)) {
            console.log(`Skipping save for new item ID: ${id}`);
            return;
          }
          saveLessonItem(item);
        }
      });
      setDragStart(null);
      setInitialPositions({});
    }
    if (isSelecting && selectionStart && selectionEnd) {
      const selLeft = Math.min(selectionStart.x, selectionEnd.x);
      const selTop = Math.min(selectionStart.y, selectionEnd.y);
      const selRight = Math.max(selectionStart.x, selectionEnd.x);
      const selBottom = Math.max(selectionStart.y, selectionEnd.y);
      if (Math.hypot(selectionEnd.x - selectionStart.x, selectionEnd.y - selectionStart.y) < CLICK_THRESHOLD) {
        setSelectedNotes(new Set());
        setShowProperties(false);
      } else {
        const newSelected = new Set<string>();
        const intersect = (il: number, it: number, ir: number, ib: number) =>
          !(ir < selLeft || il > selRight || ib < selTop || it > selBottom);
        for (const it of Object.values(items)) {
          if (it.type === "text") {
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) continue;
            ctx.font = `${it.fontSize}px ${it.fontFamily}`;
            const tw = ctx.measureText(it.text).width;
            if (intersect(it.x, it.y, it.x + tw, it.y + it.fontSize)) newSelected.add(it.id);
          } else if (it.type === "image") {
            if (intersect(it.x, it.y, it.x + it.width, it.y + it.height))
              newSelected.add(it.id);
          }
        }
        setSelectedNotes(newSelected);
        const hasText = Array.from(newSelected).some((id) => items[id].type === "text");
        setShowProperties(hasText);
        if (newSelected.size === 1) {
          const [singleId] = Array.from(newSelected);
          const single = items[singleId];
          if (single.type === "text") {
            setPropertyValues({
              fontSize: single.fontSize,
              fontFamily: single.fontFamily,
              color: single.color,
              bold: single.isBold,
              underline: single.isUnderline,
              crossedOut: single.isCrossedOut,
            });
          }
        } else if (newSelected.size > 1) {
          setPropertyValues({
            fontSize: 16,
            fontFamily: "Arial",
            color: "#FFFFFF",
            bold: false,
            underline: false,
            crossedOut: false,
          });
        }
      }
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      hasDraggedRef.current = false;
      mouseDownPosRef.current = null;
    }
  }, [isPanning, dragStart, selectedNotes, items, isSelecting, selectionStart, selectionEnd, resizingImage]);

  useEffect(() => {
    const globalMouseUp = () => handleMouseUp();
    if (isSelecting || dragStart || isPanning) window.addEventListener("mouseup", globalMouseUp);
    return () => window.removeEventListener("mouseup", globalMouseUp);
  }, [isSelecting, dragStart, isPanning, handleMouseUp]);

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getWorldCoordinates(event, canvas);
    let dblClickedId: string | null = null;
    let dblClickedType: "text" | "image" | null = null;
    const itemsArray = Object.values(items);
    const ordered = [...itemsArray.filter((it) => it.type === "text"), ...itemsArray.filter((it) => it.type === "image")];
    for (let i = ordered.length - 1; i >= 0; i--) {
      const it = ordered[i];
      if (!selectedNotes.has(it.id)) continue;
      if (it.type === "text") {
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.font = `${it.fontSize}px ${it.fontFamily}`;
        const tw = ctx.measureText(it.text).width;
        if (
          x >= it.x - 7 &&
          x <= it.x + tw + 7 &&
          y >= it.y - 7 &&
          y <= it.y + it.fontSize + 7
        ) {
          dblClickedId = it.id;
          dblClickedType = "text";
          break;
        }
      } else if (it.type === "image") {
        const cached = imageCacheRef.current.get(it.imageUrl);
        if (cached && cached.complete) {
          if (x >= it.x && x <= it.x + it.width && y >= it.y && y <= it.y + it.height) {
            dblClickedId = it.id;
            dblClickedType = "image";
            break;
          }
        } else {
          const img = new Image();
          img.onload = () => {
            imageCacheRef.current.set(it.imageUrl, img);
          };
          img.src = it.imageUrl;
        }
      }
    }
    if (dblClickedId && dblClickedType) {
      if (dblClickedType === "text") {
        setItems((prev) => ({
          ...prev,
          [dblClickedId!]: { ...prev[dblClickedId!], isEditing: true },
        }));
        setSelectedNoteId(dblClickedId);
      } else if (dblClickedType === "image") {
        const newUrl = prompt("Enter the new Image or GIF URL:");
        if (newUrl && /\.(jpeg|jpg|gif|png)$/.test(newUrl.trim())) {
          const updated = {
            ...(items[dblClickedId] as ImageItem),
            imageUrl: newUrl.trim(),
          };
          set(dbRef(db, `lessonImages/${dblClickedId}`), {
            id: updated.id,
            type: updated.type,
            imageUrl: updated.imageUrl,
            x: updated.x,
            y: updated.y,
            width: updated.width,
            height: updated.height,
          })
            .then(() => {
              setItems((prev) => ({ ...prev, [dblClickedId!]: updated }));
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.src = updated.imageUrl;
              img.onload = () => {
                imageCacheRef.current.set(updated.imageUrl, img);
                drawCanvas();
              };
              img.onerror = () => console.error(`Failed to load image at URL: ${updated.imageUrl}`);
            })
            .catch((error) => console.error("Error updating image URL:", error));
        } else if (newUrl) {
          alert("Please enter a valid image or GIF URL.");
        }
      }
    } else {
      if (currentTool === "text") addTextNoteAtPosition(x, y);
      if (currentTool === "image") {
        const imgUrl = prompt("Enter the Image or GIF URL:");
        if (imgUrl) addImageAtPosition(x, y, imgUrl.trim());
      }
    }
  };

  // --------------------- Text Editing Handlers ---------------------
  const handleInputChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const caret = e.target.selectionStart;
    setItems((prev) => ({ ...prev, [id]: { ...prev[id], text } }));
    setTimeout(() => {
      const input = inputRefs.current[id];
      if (input && caret !== null) input.setSelectionRange(caret, caret);
    }, 0);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const item = items[id];
      if (item && item.type === "text") {
        ctx.font = `${item.fontSize}px ${item.fontFamily}`;
        const tw = ctx.measureText(text).width;
        setInputWidths((prev) => ({ ...prev, [id]: Math.max(100, tw + 20) }));
      }
    }
  };

  const handleInputBlur = (id: string) => {
    setItems((prev) => ({ ...prev, [id]: { ...prev[id], isEditing: false } }));
    const item = items[id];
    if (item && item.type === "text") {
      if (item.text) saveLessonItem(item);
      else deleteLessonItem(id);
    }
    setShowProperties(Array.from(selectedNotes).some((id) => items[id].type === "text"));
  };

  const handleKeyDownInput = (id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setItems((prev) => ({ ...prev, [id]: { ...prev[id], isEditing: false } }));
      const item = items[id];
      if (item && item.type === "text") {
        if (item.text) saveLessonItem(item);
        else deleteLessonItem(id);
      }
      setShowProperties(Array.from(selectedNotes).some((id) => items[id].type === "text"));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      Object.keys(inputRefs.current).forEach((id) => {
        if (inputRefs.current[id] && !inputRefs.current[id]?.contains(e.target as Node)) {
          setItems((prev) => ({ ...prev, [id]: { ...prev[id], isEditing: false } }));
          const item = items[id];
          if (item && item.type === "text") {
            if (item.text) saveLessonItem(item);
            else deleteLessonItem(id);
          }
          setShowProperties(Array.from(selectedNotes).some((id) => items[id].type === "text"));
        }
      });
    };
    if (Object.values(items).some((it) => it.isEditing)) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [items, selectedNotes]);

  useEffect(() => {
    const newPos: { [id: string]: { top: number; left: number } } = {};
    Object.values(items).forEach((it) => {
      if (it.type === "text" && it.isEditing && canvasRef.current && containerRef.current) {
        newPos[it.id] = {
          top: (it.y - viewportOffset.y) * scale - 2.7 * scale,
          left: (it.x - viewportOffset.x) * scale,
        };
      }
    });
    setInputPositions(newPos);
  }, [items, scale, viewportOffset]);

  // --------------------- Firebase Operations ---------------------
  const saveLessonItem = (item: DrawableItem) => {
    if (!item) return;
    if (item.type === "text") {
      if (typeof item.text !== "string" || item.text.trim() === "") {
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
        color: item.color,
        isBold: item.isBold,
        isUnderline: item.isUnderline,
        isCrossedOut: item.isCrossedOut,
      }).catch((error) => console.error("Error saving lesson item:", error));
    } else if (item.type === "image") {
      const itemRef = dbRef(db, `lessonImages/${item.id}`);
      set(itemRef, {
        id: item.id,
        type: item.type,
        imageUrl: item.imageUrl,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
      }).catch((error) => console.error("Error saving lesson image:", error));
    }
  };

  const deleteLessonItem = (id: string) => {
    const item = items[id];
    if (!item) return;
    const refPath = item.type === "text" ? `lessonNotes/${id}` : `lessonImages/${id}`;
    remove(dbRef(db, refPath)).catch((error) => console.error(`Error deleting item ${id}:`, error));
    setItems((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  useEffect(() => {
    const handleGlobalMouseUpForResize = () => {
      if (resizingImage) {
        const resized = items[resizingImage.id];
        if (resized) saveLessonItem(resized);
        setResizingImage(null);
      }
    };
    if (resizingImage) window.addEventListener("mouseup", handleGlobalMouseUpForResize);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUpForResize);
  }, [resizingImage, items]);

  useEffect(() => {
    const handleDeleteKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedNotes.size > 0) {
        selectedNotes.forEach((id) => deleteLessonItem(id));
        setSelectedNotes(new Set());
        setSelectedNoteId(null);
        setShowProperties(false);
      }
    };
    window.addEventListener("keydown", handleDeleteKey);
    return () => window.removeEventListener("keydown", handleDeleteKey);
  }, [selectedNotes]);

  useEffect(() => {
    if (
      selectedNoteId &&
      items[selectedNoteId]?.isEditing &&
      items[selectedNoteId].type === "text"
    ) {
      const input = inputRefs.current[selectedNoteId];
      if (input) {
        input.focus();
        if (input.value.length)
          input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }, [selectedNoteId, items]);

  const handlePropertyChange = (property: keyof typeof propertyValues, value: any) => {
    setPropertyValues((prev) => ({ ...prev, [property]: value }));
    const updatedItems = { ...items };
    selectedNotes.forEach((id) => {
      const it = updatedItems[id];
      if (it && it.type === "text") {
        updatedItems[id] =
          property === "bold"
            ? { ...it, isBold: value }
            : property === "underline"
            ? { ...it, isUnderline: value }
            : property === "crossedOut"
            ? { ...it, isCrossedOut: value }
            : { ...it, [property]: value };
        saveLessonItem(updatedItems[id]);
      }
    });
    setItems(updatedItems);
  };

  // --------------------- Adding New Items ---------------------
  const addTextNoteAtPosition = (x: number, y: number) => {
    const notesRef = dbRef(db, "lessonNotes");
    const newNoteRef = push(notesRef);
    const newId = newNoteRef.key;
    if (newId) {
      newItemIdsRef.current.add(newId);
      const defaultX = gridEnabled ? Math.round(x / gridSize) * gridSize : x;
      const defaultY = gridEnabled ? Math.round(y / gridSize) * gridSize : y;
      const newNote: TextItem = {
        id: newId,
        type: "text",
        x: defaultX,
        y: defaultY,
        text: "",
        isDragging: false,
        isEditing: true,
        fontSize: 16,
        fontFamily: "Arial",
        color: "#FFFFFF",
        isBold: false,
        isUnderline: false,
        isCrossedOut: false,
      };
      set(newNoteRef, {
        id: newNote.id,
        type: newNote.type,
        content: newNote.text,
        x: newNote.x,
        y: newNote.y,
        fontSize: newNote.fontSize,
        fontFamily: newNote.fontFamily,
        color: newNote.color,
      })
        .then(() => {
          setItems((prev) => ({ ...prev, [newId]: newNote }));
          setSelectedNoteId(newId);
          setSelectedNotes(new Set([newId]));
          setDragStart(null);
          setInitialPositions({ [newId]: { x: newNote.x, y: newNote.y } });
          setShowProperties(true);
          setPropertyValues({
            fontSize: newNote.fontSize,
            fontFamily: newNote.fontFamily,
            color: newNote.color,
            bold: newNote.isBold,
            underline: newNote.isUnderline,
            crossedOut: newNote.isCrossedOut,
          });
          setTimeout(() => newItemIdsRef.current.delete(newId), 0);
        })
        .catch((error) => {
          console.error("Error adding new lesson note:", error);
          newItemIdsRef.current.delete(newId);
        });
    }
  };

  const isValidImageUrl = (url: string) => /\.(jpeg|jpg|gif|png)$/.test(url);

  const addImageAtPosition = (x: number, y: number, imageUrl: string) => {
    if (!isValidImageUrl(imageUrl)) {
      alert("Please enter a valid image or GIF URL.");
      return;
    }
    const imagesRef = dbRef(db, "lessonImages");
    const newImageRef = push(imagesRef);
    const newId = newImageRef.key;
    if (newId) {
      const defaultX = gridEnabled ? Math.round(x / gridSize) * gridSize : x;
      const defaultY = gridEnabled ? Math.round(y / gridSize) * gridSize : y;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        let { naturalWidth: width, naturalHeight: height } = img;
        const maxWidth = 300;
        if (width > maxWidth) {
          const factor = maxWidth / width;
          width = maxWidth;
          height = height * factor;
        }
        const newImage: ImageItem = {
          id: newId,
          type: "image",
          x: defaultX,
          y: defaultY,
          imageUrl,
          isDragging: false,
          isEditing: false,
          width,
          height,
        };
        set(newImageRef, {
          id: newImage.id,
          type: newImage.type,
          imageUrl: newImage.imageUrl,
          x: newImage.x,
          y: newImage.y,
          width: newImage.width,
          height: newImage.height,
        })
          .then(() => {
            setItems((prev) => ({ ...prev, [newId]: newImage }));
            setSelectedNotes(new Set([newId]));
            setShowProperties(false);
          })
          .catch((error) => console.error("Error adding new image:", error));
      };
      img.onerror = () =>
        alert("Failed to load image. Please check the URL and try again.");
    }
  };

  // --------------------- Render ---------------------
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Top Bar */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-4 bg-opacity-75 backdrop-filter backdrop-blur-lg p-2 rounded shadow-lg">
        <button
          onClick={() => setCurrentTool("pan")}
          className={`p-2 rounded ${currentTool === "pan" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Pan"
        >
          <FiMove size={24} color="#FFFFFF" />
        </button>
        <button
          onClick={() => setCurrentTool("select")}
          className={`p-2 rounded ${currentTool === "select" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Select"
        >
          <FiCheckSquare size={24} color="#FFFFFF" />
        </button>
        <button
          onClick={() => setCurrentTool("text")}
          className={`p-2 rounded ${currentTool === "text" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Add Text"
        >
          <FiType size={24} color="#FFFFFF" />
        </button>
        <button
          onClick={() => setCurrentTool("image")}
          className={`p-2 rounded ${currentTool === "image" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Add Image"
        >
          <FiImage size={24} color="#FFFFFF" />
        </button>
        <button
          onClick={() => setGridEnabled((prev) => !prev)}
          className={`p-2 rounded ${gridEnabled ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Grid Lock"
        >
          {gridEnabled ? (
            <FiGrid size={24} color="#FFFFFF" />
          ) : (
            <FiSquare size={24} color="#FFFFFF" />
          )}
        </button>
      </div>

      {selectedNotes.size > 0 && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-20 bg-opacity-75 backdrop-filter backdrop-blur-lg p-2 rounded shadow-lg">
          <span className="text-sm text-white">
            {selectedNotes.size} item(s) selected
          </span>
        </div>
      )}

      {/* Properties Panel */}
      {showProperties && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-opacity-75 backdrop-filter backdrop-blur-lg p-4 rounded shadow-lg flex flex-wrap gap-4 items-center">
          <label className="flex items-center space-x-2">
            <span className="text-white">Size:</span>
            <input
              type="number"
              min="16"
              max="72"
              value={propertyValues.fontSize}
              onChange={(e) =>
                handlePropertyChange("fontSize", parseInt(e.target.value) || 16)
              }
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
          <label className="flex items-center space-x-1 text-white">
            <input
              type="checkbox"
              checked={propertyValues.bold}
              onChange={(e) => handlePropertyChange("bold", e.target.checked)}
            />
            <span>Bold</span>
          </label>
          <label className="flex items-center space-x-1 text-white">
            <input
              type="checkbox"
              checked={propertyValues.underline}
              onChange={(e) => handlePropertyChange("underline", e.target.checked)}
            />
            <span>Underline</span>
          </label>
          <label className="flex items-center space-x-1 text-white">
            <input
              type="checkbox"
              checked={propertyValues.crossedOut}
              onChange={(e) => handlePropertyChange("crossedOut", e.target.checked)}
            />
            <span>Crossed Out</span>
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
          cursor:
            currentTool === "pan"
              ? isPanning
                ? "grabbing"
                : "grab"
              : currentTool === "select"
              ? isHoveringItem
                ? "move"
                : isSelecting && hasDraggedRef.current
                ? "crosshair"
                : "default"
              : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
      />

      {Object.values(items).map(
        (it) =>
          it.type === "text" &&
          it.isEditing && (
            <input
              key={it.id}
              ref={(el) => (inputRefs.current[it.id] = el)}
              type="text"
              value={it.text}
              onChange={(e) => handleInputChange(it.id, e)}
              onBlur={() => handleInputBlur(it.id)}
              onKeyDown={(e) => handleKeyDownInput(it.id, e)}
              className="absolute bg-transparent border-b border-white text-white z-10"
              style={{
                top: inputPositions[it.id]?.top || 0,
                left: inputPositions[it.id]?.left || 0,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                fontSize: `${it.fontSize}px`,
                fontFamily: it.fontFamily,
                color: it.color,
                lineHeight: `${it.fontSize + 4}px`,
                outline: "none",
                border: "none",
                caretColor: "white",
                width: `${inputWidths[it.id] || 100}px`,
              }}
            />
          )
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-white mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
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
            <span className="text-white text-lg font-semibold">
              Loading important stuff
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desinote;