import React, { useRef, useState, useEffect, useCallback } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref as dbRef, set, onValue, push, off, remove } from "firebase/database";
import {
  FiMove,
  FiCheckSquare,
  FiType,
  FiImage,
  FiGrid,
  FiSquare,
  FiLock,
  FiUnlock,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiAlignJustify,
  FiSave,
  FiSettings,
  FiHelpCircle,
  FiDownload,
  FiX
} from "react-icons/fi";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from '@dnd-kit/modifiers';

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
interface BaseItem {
  id: string;
  layerId: string;
  layerName: string;
  x: number;
  y: number;
  isDragging: boolean;
  isEditing: boolean;
}

export interface TextItem extends BaseItem {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isUnderline: boolean;
  isCrossedOut: boolean;
}

export interface ImageItem extends BaseItem {
  type: "image";
  imageUrl: string;
  width: number;
  height: number;
}

type DrawableItem = TextItem | ImageItem;

interface Layer {
  id: string;
  name: string;
  locked: boolean;
  order: number;
  visible: boolean;
}

// --------------------- Sortable Layer Item Component ---------------------
interface LayerItemProps {
  layer: Layer;
  active: boolean;
  onToggleLock: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onRename: (layerId: string, newName: string) => void;
  onDelete: (layerId: string) => void;
  onSelect: (layerId: string) => void;
  flashLocked?: boolean;
}

const SortableLayerItem: React.FC<LayerItemProps> = ({
  layer,
  active,
  onToggleLock,
  onToggleVisibility,
  onRename,
  onDelete,
  onSelect,
  flashLocked,
}) => {
  const { listeners, setNodeRef, transform, transition } = useSortable({ id: layer.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    border: `2px solid ${active ? "#4A90E2" : "transparent"}`,
    backgroundColor: active ? "#2D3748" : "transparent",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(layer.name);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const finishEditing = () => {
    setIsEditing(false);
    if (tempName.trim() && tempName !== layer.name) {
      onRename(layer.id, tempName.trim());
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-2 rounded-md mb-1 bg-gray-800 bg-opacity-75 text-white select-none"
      onClick={() => onSelect(layer.id)}
    >
      <div {...listeners} className="mr-2">
        <FiMove className="text-gray-300 text-sm" />
      </div>
      {isEditing ? (
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={(e) => e.key === "Enter" && finishEditing()}
          className="flex-grow bg-transparent border-b border-white text-white placeholder-gray-400 focus:outline-none text-sm"
          autoFocus
        />
      ) : (
        <div onDoubleClick={handleDoubleClick} className="flex-grow truncate text-sm font-medium">
          {layer.name}
        </div>
      )}
      {!isEditing && (
        <>
          <button onClick={() => onToggleVisibility(layer.id)} className="ml-1 p-1 hover:text-gray-300">
            {layer.visible ? <FiEye className="text-sm" /> : <FiEyeOff className="text-sm" />}
          </button>
          <button onClick={() => onToggleLock(layer.id)} className="ml-1 p-1 hover:text-gray-300">
            {layer.locked ? (
              <FiLock className={`text-sm ${flashLocked ? "text-red-500" : "text-white"}`} />
            ) : (
              <FiUnlock className="text-sm" />
            )}
          </button>
          {layer.id !== "default" && (
            <button onClick={() => onDelete(layer.id)} className="ml-1 p-1 hover:text-red-400">
              <FiTrash2 className="text-sm" />
            </button>
          )}
          <button onClick={handleDoubleClick} className="ml-1 p-1 hover:text-gray-300">
            <FiEdit2 className="text-sm" />
          </button>
        </>
      )}
    </div>
  );
};

// --------------------- Main Component ---------------------
const Desinote: React.FC = () => {
  // Refs and States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasBgColor, setCanvasBgColor] = useState("#121212");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRefs = useRef<{ [id: string]: HTMLInputElement | null }>({});
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const newItemIdsRef = useRef<Set<string>>(new Set());
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef<boolean>(false);

  const [items, setItems] = useState<{ [id: string]: DrawableItem }>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [inputWidths, setInputWidths] = useState<{ [id: string]: number }>({});
  const [inputPositions, setInputPositions] = useState<{ [id: string]: { top: number; left: number } }>({});
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
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>("default");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const togglePanel = () => setIsPanelCollapsed(prev => !prev);
  const [flashLockedLayers, setFlashLockedLayers] = useState<{ [layerId: string]: boolean }>({});
  const [flashPanelToggle, setFlashPanelToggle] = useState(false);

  const [savedStates, setSavedStates] = useState<
    { id: string; fileName: string; timestamp: number; data: any }[]
  >([]);

  const CLICK_THRESHOLD = 5;

  const isItemVisible = (item: DrawableItem) => {
    const layer = layers.find((l) => l.id === item.layerId);
    return layer ? layer.visible : true;
  };

  // --------------------- Helper Functions ---------------------
  const getWorldCoordinates = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | MouseEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event as MouseEvent).clientX - rect.left) / scale + viewportOffset.x,
        y: ((event as MouseEvent).clientY - rect.top) / scale + viewportOffset.y,
      };
    },
    [scale, viewportOffset]
  );

  const drawGrid = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
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

  const drawText = (ctx: CanvasRenderingContext2D, item: TextItem, selected: boolean) => {
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
      ctx.lineWidth = 2 / scale;
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
      const baseLineWidth = 2,
        baseDashLength = 6,
        basePadding = 4;
      const adjustedLineWidth = baseLineWidth / scale;
      const adjustedDash = [baseDashLength / scale];
      const adjustedPadding = basePadding / scale;
      ctx.strokeStyle = "rgba(0, 123, 255, 0.8)";
      ctx.lineWidth = adjustedLineWidth;
      ctx.setLineDash(adjustedDash);
      ctx.strokeRect(
        x - adjustedPadding,
        y - adjustedPadding,
        textWidth + 2 * adjustedPadding,
        item.fontSize + 2 * adjustedPadding
      );
      ctx.setLineDash([]);
    }
  };

  const drawImageItem = (ctx: CanvasRenderingContext2D, item: ImageItem, selected: boolean) => {
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
      const baseLineWidth = 2, baseDashLength = 6, basePadding = 4, baseHandleSize = 14;
      const adjustedLineWidth = baseLineWidth / scale;
      const adjustedDash = [baseDashLength / scale];
      const adjustedPadding = basePadding / scale;
      const adjustedHandleSize = baseHandleSize / scale;
      ctx.strokeStyle = "rgba(0, 123, 255, 0.8)";
      ctx.lineWidth = adjustedLineWidth;
      ctx.setLineDash(adjustedDash);
      ctx.strokeRect(x - adjustedPadding, y - adjustedPadding, item.width + 2 * adjustedPadding, item.height + 2 * adjustedPadding);
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

  // --------------------- Alignment Guides --------------------- 

  const drawAlignmentGuides = (ctx: CanvasRenderingContext2D) => {
    const threshold = 5;
    const maxVerticalRange = 100;
    const maxHorizontalRange = 100;

    Object.values(items).forEach(selectedItem => {
      if (!selectedNotes.has(selectedItem.id)) return;

      let selLeft, selTop, selRight, selBottom, selCenterX, selCenterY;
      if (selectedItem.type === "text") {
        ctx.font = `${selectedItem.isBold ? "bold " : ""}${selectedItem.fontSize}px ${selectedItem.fontFamily}`;
        const textWidth = ctx.measureText(selectedItem.text).width;
        selLeft = selectedItem.x;
        selTop = selectedItem.y;
        selRight = selectedItem.x + textWidth;
        selBottom = selectedItem.y + selectedItem.fontSize;
      } else {
        selLeft = selectedItem.x;
        selTop = selectedItem.y;
        selRight = selectedItem.x + selectedItem.width;
        selBottom = selectedItem.y + selectedItem.height;
      }
      selCenterX = selectedItem.x + (selRight - selectedItem.x) / 2;
      selCenterY = selectedItem.y + (selBottom - selectedItem.y) / 2;

      const selectedPoints = [
        { x: selLeft, y: selTop },
        { x: selRight, y: selTop },
        { x: selLeft, y: selBottom },
        { x: selRight, y: selBottom },
        { x: selCenterX, y: selCenterY },
      ];

      Object.values(items).forEach(candidate => {
        if (selectedNotes.has(candidate.id)) return;
        const candidateLayer = layers.find(l => l.id === candidate.layerId);
        if (candidateLayer && !candidateLayer.visible) return;

        let candLeft, candTop, candRight, candBottom, candCenterX, candCenterY;
        if (candidate.type === "text") {
          ctx.font = `${candidate.isBold ? "bold " : ""}${candidate.fontSize}px ${candidate.fontFamily}`;
          const textWidth = ctx.measureText(candidate.text).width;
          candLeft = candidate.x;
          candTop = candidate.y;
          candRight = candidate.x + textWidth;
          candBottom = candidate.y + candidate.fontSize;
        } else {
          candLeft = candidate.x;
          candTop = candidate.y;
          candRight = candidate.x + candidate.width;
          candBottom = candidate.y + candidate.height;
        }
        candCenterX = candidate.x + (candRight - candidate.x) / 2;
        candCenterY = candidate.y + (candBottom - candidate.y) / 2;

        const candidatePoints = [
          { x: candLeft, y: candTop },
          { x: candRight, y: candTop },
          { x: candLeft, y: candBottom },
          { x: candRight, y: candBottom },
          { x: candCenterX, y: candCenterY },
        ];

        ctx.lineWidth = 1 / scale;
        ctx.strokeStyle = "red";
        ctx.setLineDash([5 / scale]);

        selectedPoints.forEach(selPoint => {
          candidatePoints.forEach(candPoint => {
            if (
              Math.abs(selPoint.x - candPoint.x) < threshold &&
              Math.abs(selCenterY - candCenterY) < maxVerticalRange
            ) {
              const xLine = candPoint.x - viewportOffset.x;
              ctx.beginPath();
              ctx.moveTo(xLine, 0);
              ctx.lineTo(xLine, canvasSize.height / scale);
              ctx.stroke();
            }
            if (
              Math.abs(selPoint.y - candPoint.y) < threshold &&
              Math.abs(selCenterX - candCenterX) < maxHorizontalRange
            ) {
              const yLine = candPoint.y - viewportOffset.y;
              ctx.beginPath();
              ctx.moveTo(0, yLine);
              ctx.lineTo(canvasSize.width / scale, yLine);
              ctx.stroke();
            }
          });
        });
        ctx.setLineDash([]);
      });
    });
  };

const measureTextWidth = (note: TextItem): number => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = `${note.isBold ? "bold " : ""}${note.fontSize}px ${note.fontFamily}`;
  return ctx.measureText(note.text).width;
};

const getItemPoints = (note: DrawableItem, posX: number, posY: number): { x: number; y: number }[] => {
  if (note.type === "text") {
    const textWidth = measureTextWidth(note);
    return [
      { x: posX, y: posY },
      { x: posX + textWidth, y: posY },
      { x: posX, y: posY + note.fontSize },
      { x: posX + textWidth, y: posY + note.fontSize },
      { x: posX + textWidth / 2, y: posY + note.fontSize / 2 },
    ];
  } else {
    return [
      { x: posX, y: posY },
      { x: posX + note.width, y: posY },
      { x: posX, y: posY + note.height },
      { x: posX + note.width, y: posY + note.height },
      { x: posX + note.width / 2, y: posY + note.height / 2 },
    ];
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

    const visibleLayerIds = new Set(layers.filter(l => l.visible).map(l => l.id));
    const itemsToDraw = Object.values(items).filter(item => visibleLayerIds.has(item.layerId));
    const sortedLayers = layers.filter(l => l.visible).sort((a, b) => b.order - a.order);
    sortedLayers.forEach(layer => {
      const layerItems = itemsToDraw.filter(item => item.layerId === layer.id);
      if (layer.id === activeLayerId) {
        const images = layerItems.filter(item => item.type === "image") as ImageItem[];
        const texts = layerItems.filter(item => item.type === "text") as TextItem[];
        images.forEach(item => drawImageItem(ctx, item, selectedNotes.has(item.id)));
        texts.forEach(item => drawText(ctx, item, selectedNotes.has(item.id)));
      } else {
        const images = layerItems.filter(item => item.type === "image") as ImageItem[];
        const texts = layerItems.filter(item => item.type === "text") as TextItem[];
        images.forEach(item => drawImageItem(ctx, item, selectedNotes.has(item.id)));
        texts.forEach(item => drawText(ctx, item, selectedNotes.has(item.id)));
      }
    });
    ctx.restore();

    // If dragging and Shift is held, draw alignment guides.
    if (dragStart && isShiftPressed) {
      const ctxGuides = canvas.getContext("2d");
      if (ctxGuides) {
        ctxGuides.save();
        ctxGuides.scale(scale, scale);
        drawAlignmentGuides(ctxGuides);
        ctxGuides.restore();
      }
    }

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
    layers,
    activeLayerId,
    dragStart,
    isShiftPressed
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
      const activeEl = document.activeElement;
      if (e.code === "Space" && !(activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement)) {
        if (currentTool === "pan") return;
        e.preventDefault();
        setIsSpacePressed(true);
      }
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        setIsShiftPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (currentTool === "pan") return;
        e.preventDefault();
        setIsSpacePressed(false);
      }
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        setIsShiftPressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [currentTool]);

  // --------------------- Arrow Key Nudging ---------------------
  useEffect(() => {
    const handleArrowKey = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
      if (selectedNotes.size > 0) {
        let deltaX = 0, deltaY = 0;
        if (e.key === "ArrowUp") deltaY = -1;
        if (e.key === "ArrowDown") deltaY = 1;
        if (e.key === "ArrowLeft") deltaX = -1;
        if (e.key === "ArrowRight") deltaX = 1;
        if (deltaX !== 0 || deltaY !== 0) {
          e.preventDefault();
          setItems(prev => {
            const updated = { ...prev };
            selectedNotes.forEach(id => {
              const it = updated[id];
              const layer = layers.find(l => l.id === it.layerId);
              if (layer && layer.locked) return;
              updated[id] = { ...it, x: it.x + deltaX, y: it.y + deltaY };
              saveLessonItem(updated[id]);
            });
            return updated;
          });
        }
      }
    };
    window.addEventListener("keydown", handleArrowKey);
    return () => window.removeEventListener("keydown", handleArrowKey);
  }, [selectedNotes, layers, items]);

  useEffect(() => {
    const handleToolShortcut = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }
      switch (e.code) {
        case "Digit1":
          setCurrentTool("pan");
          break;
        case "Digit2":
          setCurrentTool("select");
          break;
        case "Digit3":
          setCurrentTool("text");
          break;
        case "Digit4":
          setCurrentTool("image");
          break;
        case "Digit5":
          setGridEnabled((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleToolShortcut);
    return () => window.removeEventListener("keydown", handleToolShortcut);
  }, []);

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
              layerId: note.layerId || activeLayerId,
              layerName: note.layerName || layers[0]?.name || "Default",
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
              const tw = ctx.measureText(note.content || "").width;
              newWidths[id] = note.content ? (tw + 2) : 1;
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
              layerId: image.layerId || activeLayerId,
              layerName: image.layerName || layers[0]?.name || "Default",
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
              img.onerror = () => console.error(`Failed to load image at URL: ${image.imageUrl}`);
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

  const loadLessonLayers = () => {
    const layersRef = dbRef(db, "lessonLayers");
    const listener = onValue(
      layersRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loaded: Layer[] = Object.keys(data).map((id) => ({
            id,
            name: data[id].name,
            locked: !!data[id].locked,
            order: typeof data[id].order === "number" ? data[id].order : 0,
            visible: data[id].visible !== undefined ? data[id].visible : true,
          }));
          loaded.sort((a, b) => a.order - b.order);
          setLayers(loaded);
          if (!loaded.find((l) => l.id === activeLayerId)) {
            setActiveLayerId(loaded[0]?.id || "default");
          }
        } else {
          const defaultLayer: Layer = { id: "default", name: "Default", locked: false, order: 0, visible: true };
          setLayers([defaultLayer]);
          setActiveLayerId("default");
          set(dbRef(db, "lessonLayers/default"), defaultLayer);
        }
      },
      (error) => {
        console.error("Error loading lesson layers:", error);
      }
    );
    return () => off(dbRef(db, "lessonLayers"), "value", listener);
  };

  useEffect(() => {
    loadLessonNotes();
    loadLessonImages();
    loadLessonLayers();
  }, []);

  const loadLessonSettings = () => {
    const settingsRef = dbRef(db, "lessonSettings");
    const listener = onValue(
      settingsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && data.canvasColor) {
          setCanvasBgColor(data.canvasColor);
        }
      },
      (error) => {
        console.error("Error loading lesson settings:", error);
      }
    );
    return () => off(settingsRef, "value", listener);
  };

  useEffect(() => {
    loadLessonSettings();
  }, []);

  const changeCanvasBgColor = (color: string) => {
    setCanvasBgColor(color);
    const settingsRef = dbRef(db, "lessonSettings");
    set(settingsRef, { canvasColor: color }).catch((error) =>
      console.error("Error saving lesson settings:", error)
    );
  };

  // --------------------- Saving & Loading Lesson State ---------------------
  const saveLessonState = () => {
    const fileName = prompt("Enter a name to save your lesson (existing file with same name will be overridden):");
    if (!fileName?.trim()) return;
    const trimmedName = fileName.trim();
    const existingSave = savedStates.find(save => save.fileName.toLowerCase() === trimmedName.toLowerCase());
    if (existingSave) {
      const confirmOverride = window.confirm(
        `A saved lesson named "${trimmedName}" already exists. Do you want to override it?`
      );
      if (!confirmOverride) return;
    }
    const stateToSave = {
      fileName: trimmedName,
      timestamp: Date.now(),
      items,
      layers,
      canvasBgColor,
      gridEnabled,
    };
    const savesRef = dbRef(db, "lessonSaves");
    if (existingSave) {
      set(dbRef(db, `lessonSaves/${existingSave.id}`), stateToSave)
        .then(() => alert("Lesson overridden successfully!"))
        .catch((error) => console.error("Error saving lesson state:", error));
    } else {
      const newSaveRef = push(savesRef);
      set(newSaveRef, stateToSave)
        .then(() => alert("Lesson saved successfully!"))
        .catch((error) => console.error("Error saving lesson state:", error));
    }
  };

  useEffect(() => {
    const savesRef = dbRef(db, "lessonSaves");
    const listener = onValue(savesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const savesArray = Object.keys(data).map((id) => ({
          id,
          ...data[id],
        }));
        setSavedStates(savesArray);
      } else {
        setSavedStates([]);
      }
    });
    return () => off(savesRef, "value", listener);
  }, []);

  // --------------------- Mouse Event Handlers ---------------------
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getWorldCoordinates(event, canvas);
    if (currentTool === "select") {
      const baseHandleSize = 14;
      const adjustedHandleSize = baseHandleSize / scale;
      for (const id of selectedNotes) {
        const item = items[id];
        if (item && item.type === "image") {
          const layer = layers.find(l => l.id === item.layerId);
          if (layer && !layer.visible) continue;
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
      const visibleItems = Object.values(items).filter(isItemVisible);
      const orderedItems = visibleItems
        .sort((a, b) => {
          const layerAOrder = layers.find(l => l.id === a.layerId)?.order || 0;
          const layerBOrder = layers.find(l => l.id === b.layerId)?.order || 0;
          if (layerAOrder !== layerBOrder) return layerBOrder - layerAOrder;
          if (a.layerId === activeLayerId && b.layerId === activeLayerId) {
            if (a.type === "text" && b.type === "image") return -1;
            if (a.type === "image" && b.type === "text") return 1;
          }
          return 0;
        })
        .reverse();
      let clickedOnItem = false;
      let clickedItemId: string | null = null;
      let clickedItemType: "text" | "image" | null = null;
      const checkImagePromises: Promise<void>[] = [];
      for (let i = 0; i < orderedItems.length; i++) {
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
          const item = items[clickedItemId];
          const layer = layers.find((l) => l.id === item.layerId);
          if (layer && layer.locked) {
            setFlashLockedLayers((prev) => ({ ...prev, [layer.id]: true }));
            setTimeout(() => {
              setFlashLockedLayers((prev) => ({ ...prev, [layer.id]: false }));
            }, 3000);
            if (isPanelCollapsed) {
              setFlashPanelToggle(true);
              setTimeout(() => setFlashPanelToggle(false), 3000);
            }
            return;
          }
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
        const it = updated[id];
        const layer = layers.find(l => l.id === it.layerId);
        if (layer && layer.locked) return;
        const init = initialPositions[id];
        if (init) {
          let newX = init.x + deltaX / scale;
          let newY = init.y + deltaY / scale;

          if (isShiftPressed) {
            const threshold = 5;
            const maxSnapDistance = 100;
            const selectedPoints = getItemPoints(it, newX, newY);
            const selCenter = selectedPoints[selectedPoints.length - 1];
            let snapOffsetX = 0, snapOffsetY = 0;
            let foundSnapX = false, foundSnapY = false;
            Object.values(items).forEach(candidate => {
              if (selectedNotes.has(candidate.id)) return;
              const candidatePoints = getItemPoints(candidate, candidate.x, candidate.y);
              const candCenter = candidatePoints[candidatePoints.length - 1];
              if (
                Math.abs(selCenter.x - candCenter.x) > maxSnapDistance ||
                Math.abs(selCenter.y - candCenter.y) > maxSnapDistance
              ) {
                return;
              }
              selectedPoints.forEach(selPoint => {
                candidatePoints.forEach(candPoint => {
                  const diffX = candPoint.x - selPoint.x;
                  const diffY = candPoint.y - selPoint.y;
                  if (!foundSnapX && Math.abs(diffX) < threshold) {
                    snapOffsetX = diffX;
                    foundSnapX = true;
                  }
                  if (!foundSnapY && Math.abs(diffY) < threshold) {
                    snapOffsetY = diffY;
                    foundSnapY = true;
                  }
                });
              });
            });
            newX += snapOffsetX;
            newY += snapOffsetY;
          }

          updated[id] = {
            ...it,
            x: gridEnabled ? Math.round(newX / gridSize) * gridSize : newX,
            y: gridEnabled ? Math.round(newY / gridSize) * gridSize : newY,
          };
        }
      });
      setItems(updated);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getWorldCoordinates(event, canvas);
    let hovering = false;
    const hoverPromises: Promise<void>[] = [];
    for (const it of Object.values(items)) {
      if (!isItemVisible(it)) continue;
      if (it.type === "text") {
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.font = `${it.fontSize}px ${it.fontFamily}`;
        const tw = ctx.measureText(it.text).width;
        if (x >= it.x && x <= it.x + tw && y >= it.y && y <= it.y + it.fontSize) {
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
      const it = items[resizingImage.id];
      if (it) saveLessonItem(it);
      setResizingImage(null);
      return;
    }
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (dragStart) {
      selectedNotes.forEach((id) => {
        const it = items[id];
        if (it) {
          if (newItemIdsRef.current.has(id)) {
            console.log(`Skipping save for new item ID: ${id}`);
            return;
          }
          saveLessonItem(it);
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
          if (!isItemVisible(it)) continue;
          if (it.type === "text") {
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) continue;
            ctx.font = `${it.fontSize}px ${it.fontFamily}`;
            const tw = ctx.measureText(it.text).width;
            if (intersect(it.x, it.y, it.x + tw, it.y + it.fontSize))
              newSelected.add(it.id);
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
  }, [isPanning, dragStart, selectedNotes, items, isSelecting, selectionStart, selectionEnd, resizingImage, layers]);

  useEffect(() => {
    const globalMouseUp = () => handleMouseUp();
    if (isSelecting || dragStart || isPanning)
      window.addEventListener("mouseup", globalMouseUp);
    return () => window.removeEventListener("mouseup", globalMouseUp);
  }, [isSelecting, dragStart, isPanning, handleMouseUp]);

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getWorldCoordinates(event, canvas);
    let dblClickedId: string | null = null;
    let dblClickedType: "text" | "image" | null = null;
    const itemsArray = Object.values(items);
    const ordered = [
      ...itemsArray.filter((it) => it.type === "text"),
      ...itemsArray.filter((it) => it.type === "image"),
    ];
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
          if (
            x >= it.x &&
            x <= it.x + it.width &&
            y >= it.y &&
            y <= it.y + it.height
          ) {
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
            layerId: updated.layerId,
            layerName: updated.layerName,
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
              img.onerror = () =>
                console.error(`Failed to load image at URL: ${updated.imageUrl}`);
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
      const it = items[id];
      if (it && it.type === "text") {
        ctx.font = `${it.fontSize}px ${it.fontFamily}`;
        const tw = ctx.measureText(text).width;
        setInputWidths((prev) => ({ ...prev, [id]: text ? (tw + 2) : 1 }));
      }
    }
  };

  const handleInputBlur = (id: string) => {
    setItems((prev) => ({ ...prev, [id]: { ...prev[id], isEditing: false } }));
    const it = items[id];
    if (it && it.type === "text") {
      if (it.text) saveLessonItem(it);
      else deleteLessonItem(id);
    }
    setShowProperties(Array.from(selectedNotes).some((id) => items[id].type === "text"));
  };

  const handleKeyDownInput = (id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setItems((prev) => ({ ...prev, [id]: { ...prev[id], isEditing: false } }));
      const it = items[id];
      if (it && it.type === "text") {
        if (it.text) saveLessonItem(it);
        else deleteLessonItem(id);
      }
      setShowProperties(Array.from(selectedNotes).some((id) => items[id].type === "text"));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      Object.keys(inputRefs.current).forEach((id) => {
        if (
          inputRefs.current[id] &&
          !inputRefs.current[id]?.contains(e.target as Node)
        ) {
          setItems((prev) => ({ ...prev, [id]: { ...prev[id], isEditing: false } }));
          const it = items[id];
          if (it && it.type === "text") {
            if (it.text) saveLessonItem(it);
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
  const saveLessonItem = (it: DrawableItem) => {
    if (!it) return;
    if (it.type === "text") {
      if (typeof it.text !== "string" || it.text.trim() === "") {
        deleteLessonItem(it.id);
        return;
      }
      const itemRef = dbRef(db, `lessonNotes/${it.id}`);
      set(itemRef, {
        id: it.id,
        type: it.type,
        content: it.text,
        x: it.x,
        y: it.y,
        fontSize: it.fontSize,
        fontFamily: it.fontFamily,
        color: it.color,
        isBold: it.isBold,
        isUnderline: it.isUnderline,
        isCrossedOut: it.isCrossedOut,
        layerId: it.layerId,
        layerName: it.layerName,
      }).catch((error) => console.error("Error saving lesson item:", error));
    } else if (it.type === "image") {
      const itemRef = dbRef(db, `lessonImages/${it.id}`);
      set(itemRef, {
        id: it.id,
        type: it.type,
        imageUrl: it.imageUrl,
        x: it.x,
        y: it.y,
        width: it.width,
        height: it.height,
        layerId: it.layerId,
        layerName: it.layerName,
      }).catch((error) => console.error("Error saving lesson image:", error));
    }
  };

  const deleteLessonItem = (id: string) => {
    const it = items[id];
    if (!it) return;
    const refPath = it.type === "text" ? `lessonNotes/${id}` : `lessonImages/${id}`;
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
        const it = items[resizingImage.id];
        if (it) saveLessonItem(it);
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
      const activeLayer = layers.find(l => l.id === activeLayerId) || { id: "default", name: "Default", locked: false, order: 0, visible: true };
      const newNote: TextItem = {
        id: newId,
        type: "text",
        layerId: activeLayer.id,
        layerName: activeLayer.name,
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
        layerId: newNote.layerId,
        layerName: newNote.layerName,
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
      const activeLayer = layers.find(l => l.id === activeLayerId) || { id: "default", name: "Default", locked: false, order: 0, visible: true };
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
          layerId: activeLayer.id,
          layerName: activeLayer.name,
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
          layerId: newImage.layerId,
          layerName: newImage.layerName,
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

  // --------------------- Layer Management Functions ---------------------
  const updateLayerInFirebase = (layer: Layer) => {
    set(dbRef(db, `lessonLayers/${layer.id}`), layer).catch((error) =>
      console.error("Error updating layer:", error)
    );
  };

  const handleLayerRename = (layerId: string, newName: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, name: newName } : layer
      )
    );
    const updated = layers.find((l) => l.id === layerId);
    if (updated) {
      updateLayerInFirebase({ ...updated, name: newName });
    }
    const updatedItems = { ...items };
    Object.keys(updatedItems).forEach((id) => {
      if (updatedItems[id].layerId === layerId) {
        updatedItems[id] = { ...updatedItems[id], layerName: newName };
        saveLessonItem(updatedItems[id]);
      }
    });
    setItems(updatedItems);
  };

  const handleLayerToggleLock = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    );
    const updated = layers.find((l) => l.id === layerId);
    if (updated) {
      updateLayerInFirebase({ ...updated, locked: !updated.locked });
    }
  };

  const handleLayerToggleVisibility = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
    const updated = layers.find((l) => l.id === layerId);
    if (updated) {
      updateLayerInFirebase({ ...updated, visible: !updated.visible });
    }
  };

  const handleLayerDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = layers.findIndex((l) => l.id === active.id);
      const newIndex = layers.findIndex((l) => l.id === over?.id);
      const newLayers = arrayMove(layers, oldIndex, newIndex).map((layer, idx) => ({
        ...layer,
        order: idx,
      }));
      setLayers(newLayers);
      newLayers.forEach((layer) => updateLayerInFirebase(layer));
    }
  };

  const handleLayerSelect = (layerId: string) => {
    setActiveLayerId(layerId);
  };

  const addNewLayer = () => {
    const layersRef = dbRef(db, "lessonLayers");
    const newLayerRef = push(layersRef);
    const newId = newLayerRef.key;
    if (newId) {
      const newLayer: Layer = {
        id: newId,
        name: "New Layer",
        locked: false,
        order: layers.length,
        visible: true,
      };
      set(newLayerRef, newLayer)
        .then(() => {
          setActiveLayerId(newId);
        })
        .catch((error) => console.error("Error adding new layer:", error));
    }
  };

  const deleteLayer = (layerId: string) => {
    if (layerId === "default") {
      alert("Default layer cannot be deleted.");
      return;
    }
    remove(dbRef(db, `lessonLayers/${layerId}`)).catch((error) =>
      console.error("Error deleting layer:", error)
    );
    setLayers((prev) => prev.filter((layer) => layer.id !== layerId));
    const updatedItems = { ...items };
    Object.keys(updatedItems).forEach((id) => {
      if (updatedItems[id].layerId === layerId) {
        const refPath = updatedItems[id].type === "text" ? `lessonNotes/${id}` : `lessonImages/${id}`;
        remove(dbRef(db, refPath)).catch((error) =>
          console.error(`Error deleting item ${id} on layer ${layerId}:`, error)
        );
        delete updatedItems[id];
      }
    });
    setItems(updatedItems);
    if (activeLayerId === layerId) {
      setActiveLayerId("default");
    }
  };

  // --------------------- Menu & Panel Handlers ---------------------
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu((prev) => !prev);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // --------------------- Save/Load Lesson State ---------------------
  const loadSavedStates = () => {
    const savesRef = dbRef(db, "lessonSaves");
    const listener = onValue(savesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const savesArray = Object.keys(data).map((id) => ({
          id,
          ...data[id],
        }));
        setSavedStates(savesArray);
      } else {
        setSavedStates([]);
      }
    });
    return () => off(savesRef, "value", listener);
  };

  useEffect(() => {
    loadSavedStates();
  }, []);

  const loadLessonState = (saveData: any) => {
    if (
      window.confirm(
        `Load lesson "${saveData.fileName}"? This will overwrite your current work.`
      )
    ) {
      const loadedItems = saveData.items || {};
      const loadedTextItems: { [id: string]: any } = {};
      const loadedImageItems: { [id: string]: any } = {};
      Object.values(loadedItems).forEach((item: any) => {
        if (item.type === "text") {
          loadedTextItems[item.id] = {
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
            layerId: item.layerId,
            layerName: item.layerName,
          };
        } else if (item.type === "image") {
          loadedImageItems[item.id] = item;
        }
      });
      set(dbRef(db, "lessonNotes"), loadedTextItems);
      set(dbRef(db, "lessonImages"), loadedImageItems);

      const loadedLayersArray = saveData.layers || [];
      const loadedLayersObj: { [id: string]: any } = {};
      loadedLayersArray.forEach((layer: Layer) => {
        loadedLayersObj[layer.id] = layer;
      });
      set(dbRef(db, "lessonLayers"), loadedLayersObj);

      setItems(loadedItems);
      setLayers(loadedLayersArray);
      setCanvasBgColor(saveData.canvasBgColor || "#121212");
      setGridEnabled(saveData.gridEnabled || false);
      setShowLoadDialog(false);
    }
  };

  const deleteSavedState = (id: string) => {
    if (window.confirm("Delete this saved lesson?")) {
      remove(dbRef(db, `lessonSaves/${id}`))
        .then(() => {
          setSavedStates((prev) => prev.filter((save) => save.id !== id));
        })
        .catch((error) => console.error("Error deleting saved lesson:", error));
    }
  };

  const clearCanvas = () => {
    if (window.confirm("Clear canvas? This will permanently remove all items.")) {
      set(dbRef(db, "lessonNotes"), null).catch((error) =>
        console.error("Error clearing lesson notes:", error)
      );
      set(dbRef(db, "lessonImages"), null).catch((error) =>
        console.error("Error clearing lesson images:", error)
      );
      setItems({});
    }
  };

  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // --------------------- Render ---------------------
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Menu Button */}
      <div className="fixed top-4 right-4 z-20" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className="rounded bg-slate-800 p-2 shadow-lg hover:bg-slate-700 transition-all duration-300"
          title="Menu"
        >
          <FiAlignJustify size={24} color="#FFFFFF" />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-40 bg-slate-800 bg-opacity-95 rounded-lg shadow-lg p-2 transition-all duration-300">
            {/* File Category */}
            <div className="mb-2 border-b border-slate-600 pb-1">
              <h4 className="text-xs text-slate-300 font-semibold mb-1">File</h4>
              <button
                onClick={saveLessonState}
                className="w-full flex items-center px-4 py-1 mb-1 hover:bg-slate-700 rounded"
              >
                <FiSave className="mr-2" /> <span className="text-sm">Save</span>
              </button>
              <button
                onClick={() => setShowLoadDialog(true)}
                className="w-full flex items-center px-4 py-1 hover:bg-slate-700 rounded"
              >
                <FiDownload className="mr-2" /> <span className="text-sm">Load</span>
              </button>
              <button
                onClick={clearCanvas}
                className="w-full flex items-center px-4 py-1 hover:bg-slate-700 rounded"
              >
                <FiTrash2 className="mr-2" /> <span className="text-sm">Clear Canvas</span>
              </button>
            </div>
            {/* Options Category */}
            <div className="mb-2">
              <h4 className="text-xs text-slate-300 font-semibold mb-1">Options</h4>
              <button className="w-full flex items-center px-4 py-1 mb-1 hover:bg-slate-700 rounded">
                <FiSettings className="mr-2" /> <span className="text-sm">Settings</span>
              </button>
              <button className="w-full flex items-center px-4 py-1 hover:bg-slate-700 rounded">
                <FiHelpCircle className="mr-2" /> <span className="text-sm">Help</span>
              </button>
            </div>
            {/* Canvas Background Category */}
            <div className="mt-2 border-t border-slate-600 pt-2">
              <h4 className="text-xs text-slate-300 font-semibold mb-1">Background</h4>
              <div className="flex justify-evenly gap-1">
                <button
                  onClick={() => changeCanvasBgColor("#121212")}
                  className={`w-6 h-6 bg-[#121212] hover:opacity-75 rounded ${canvasBgColor === "#121212" ? "ring-2 ring-blue-500" : ""}`}
                  title="Onyx"
                ></button>
                <button
                  onClick={() => changeCanvasBgColor("#1E1E1E")}
                  className={`w-6 h-6 bg-[#1E1E1E] hover:opacity-75 rounded ${canvasBgColor === "#1E1E1E" ? "ring-2 ring-blue-500" : ""}`}
                  title="Dark Gray"
                ></button>
                <button
                  onClick={() => changeCanvasBgColor("#2C2C2C")}
                  className={`w-6 h-6 bg-[#2C2C2C] hover:opacity-75 rounded ${canvasBgColor === "#2C2C2C" ? "ring-2 ring-blue-500" : ""}`}
                  title="Charcoal"
                ></button>
                <button
                  onClick={() => changeCanvasBgColor("#FFFFFF")}
                  className={`w-6 h-6 bg-[#FFFFFF] hover:opacity-75 rounded ${canvasBgColor === "#FFFFFF" ? "ring-2 ring-blue-500" : ""}`}
                  title="White"
                ></button>
                <button
                  onClick={() => changeCanvasBgColor("#F3F4F6")}
                  className={`w-6 h-6 bg-[#F3F4F6] hover:opacity-75 rounded ${canvasBgColor === "#F3F4F6" ? "ring-2 ring-blue-500" : ""}`}
                  title="Light Gray"
                ></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Load Dialog Modal */}
      {showLoadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-primary-color rounded-lg shadow-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-semibold">Load Lesson</h3>
              <button onClick={() => setShowLoadDialog(false)} className="text-slate-300 hover:text-white">
                <FiX size={24} />
              </button>
            </div>
            {savedStates.length === 0 ? (
              <p className="text-slate-400 text-sm">No saved lessons.</p>
            ) : (
              <ul className="max-h-60 overflow-y-auto mb-4 space-y-2">
                {savedStates.map((save) => {
                  const fileSize = (new Blob([JSON.stringify(save)]).size / 1024).toFixed(2);
                  return (
                    <li
                      key={save.id}
                      className="flex items-center justify-between p-2 bg-tertiary-color rounded"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                        <span className="text-slate-200 text-sm font-medium">{save.fileName}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(save.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">Size: {fileSize} KB</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadLessonState(save)}
                          className="flex items-center space-x-1 text-green-400 hover:text-green-600 text-sm"
                          title="Load"
                        >
                          <FiDownload size={16} />
                          <span>Load</span>
                        </button>
                        <button
                          onClick={() => deleteSavedState(save.id)}
                          className="flex items-center space-x-1 text-red-400 hover:text-red-600 text-sm"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Layers Panel */}
      <div>
        <div
          className="fixed top-4 z-30 p-2 bg-opacity-75 backdrop-filter backdrop-blur-lg w-64 max-h-[80vh] transition-all duration-300"
          style={{ left: isPanelCollapsed ? "calc(-16rem + 20px)" : "4px" }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">Layers</h3>
            <button onClick={addNewLayer} title="Add Layer" className="text-white">
              <FiPlus size={20} />
            </button>
          </div>
          <div className="max-h-[calc(80vh-2rem)] overflow-auto">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleLayerDragEnd}
              modifiers={[restrictToParentElement]}
            >
              <SortableContext items={layers.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                {layers.map((layer) => (
                  <SortableLayerItem
                    key={layer.id}
                    layer={layer}
                    active={layer.id === activeLayerId}
                    onToggleLock={handleLayerToggleLock}
                    onToggleVisibility={handleLayerToggleVisibility}
                    onRename={handleLayerRename}
                    onDelete={deleteLayer}
                    onSelect={handleLayerSelect}
                    flashLocked={flashLockedLayers[layer.id]}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <button
          onClick={togglePanel}
          className="fixed top-4 z-40 p-1 bg-gray-800 bg-opacity-75 rounded-r rounded-l-none shadow-md hover:bg-gray-700 transition-all duration-300"
          style={{ left: isPanelCollapsed ? "calc(4px + 20px)" : "calc(4px + 16rem)" }}
          title="Toggle Layers Panel"
        >
          {isPanelCollapsed ? (
            <FiChevronRight className={`text-sm ${flashPanelToggle ? "text-red-500" : "text-white"}`} />
          ) : (
            <FiChevronLeft className={`text-sm ${flashPanelToggle ? "text-red-500" : "text-white"}`} />
          )}
        </button>
      </div>

      {/* Top Bar */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-4 bg-opacity-75 backdrop-filter backdrop-blur-lg p-2 rounded shadow-lg">
        <button
          onClick={() => setCurrentTool("pan")}
          className={`relative p-2 rounded ${currentTool === "pan" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Pan"
        >
          <FiMove size={24} color="#FFFFFF" />
          <span className="absolute -bottom-1 left-0 text-[0.65rem] text-white">1</span>
        </button>
        <button
          onClick={() => setCurrentTool("select")}
          className={`relative p-2 rounded ${currentTool === "select" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Select"
        >
          <FiCheckSquare size={24} color="#FFFFFF" />
          <span className="absolute -bottom-1 left-0 text-[0.65rem] text-white">2</span>
        </button>
        <button
          onClick={() => setCurrentTool("text")}
          className={`relative p-2 rounded ${currentTool === "text" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Add Text"
        >
          <FiType size={24} color="#FFFFFF" />
          <span className="absolute -bottom-1 left-0 text-[0.65rem] text-white">3</span>
        </button>
        <button
          onClick={() => setCurrentTool("image")}
          className={`relative p-2 rounded ${currentTool === "image" ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Add Image"
        >
          <FiImage size={24} color="#FFFFFF" />
          <span className="absolute -bottom-1 left-0 text-[0.65rem] text-white">4</span>
        </button>
        <button
          onClick={() => setGridEnabled((prev) => !prev)}
          className={`relative p-2 rounded ${gridEnabled ? "bg-blue-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title="Grid Lock"
        >
          {gridEnabled ? <FiGrid size={24} color="#FFFFFF" /> : <FiSquare size={24} color="#FFFFFF" />}
          <span className="absolute -bottom-1 left-0 text-[0.65rem] text-white">5</span>
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
          background: canvasBgColor,
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
              className="absolute bg-transparent border-b border-white z-10"
              style={{
                top: inputPositions[it.id]?.top || 0,
                left: inputPositions[it.id]?.left || 0,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                fontSize: `${it.fontSize}px`,
                fontFamily: it.fontFamily,
                color: it.color,
                fontWeight: it.isBold ? "bold" : "normal",
                textDecoration: it.isCrossedOut ? "line-through" : "none",
                lineHeight: `${it.fontSize + 4}px`,
                outline: "none",
                border: "none",
                caretColor: it.color,
                width: `${(inputWidths[it.id] || 10)}px`,
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