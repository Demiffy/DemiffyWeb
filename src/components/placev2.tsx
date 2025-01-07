// PlaceV2.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, update, remove, onDisconnect } from 'firebase/database';
import SidePanel from './ui/SidePanel';
import SidePanelLookUp from './ui/SidePanelLookUp';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "demiffycom.firebaseapp.com",
  databaseURL: "https://demiffycom-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "demiffycom",
  storageBucket: "demiffycom.firebasestorage.app",
  messagingSenderId: "423608998435",
  appId: "1:423608998435:web:1ee3cc6b9408777fbdaf96",
  measurementId: "G-9DVS3F5QST",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const colors = [
  '#6d001a', '#be0039', '#ff4500', '#ffa800', '#ffd635', '#fff8b8',
  '#00a368', '#00cc78', '#7eed56', '#00756f', '#009eaa', '#00ccc0',
  '#2450a4', '#3690ea', '#51e9f4', '#493ac1', '#6a5cff', '#94b3ff',
  '#811e9f', '#b44ac0', '#e4abff', '#de107f', '#ff3881', '#ff99aa',
  '#6d482f', '#9c6926', '#ffb470', '#000000', '#515252', '#898d90',
  '#d4d7d9', '#ffffff',
];

const pixelSize = 20;

const PlaceV2: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedColor, setSelectedColor] = useState<number>(27);
  const [isEraserSelected, setIsEraserSelected] = useState(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "error" | "info" | "tip" } | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [typedInput, setTypedInput] = useState<string>("");
  const closeAdminModal = () => {setAdminModalOpen(false);setIsPreviewActive(false);};  
  const [onlinePlayers, setOnlinePlayers] = useState<number>(0);
  const lastPixelPosition = useRef<{ x: number; y: number } | null>(null);
  const [isPixelInfoEnabled, setIsPixelInfoEnabled] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [pasteCoords, setPasteCoords] = useState<{ x: number | null; y: number | null }>({x: null,y : null,});  
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);
  const [canvasData, setCanvasData] = useState<any[]>([]);
  const pixelBufferRef = useRef<{ [key: string]: any }>({});
  const [localPixels, setLocalPixels] = useState<{
    x: number;
    y: number;
    color: number;
    placedBy: string;
    timestamp: number;
  }[]>([]);  
  const [hoveredPixelInfo, setHoveredPixelInfo] = useState<{
    x: number;
    y: number;
    placedBy: string;
    color: number;
    timestamp?: number;
  } | null>(null);

  const [userData, setUserData] = useState({
    username: "",
    role: "Guest",
    timeOnPage: 0,
    pfpurl: "https://demiffy.com/defaultuser.png",
  });
  const canAccessAdminModal = userData.role === "Developer";

  // Listen for keyboard events for admin modal
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (typedInput === "fox" && canAccessAdminModal) {
          setAdminModalOpen(true);
        }
        setTypedInput("");
      } else if (event.key === "Backspace") {
        setTypedInput((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        setTypedInput((prev) => (prev + event.key).slice(0, 3)); // Limit 3 characters
      }
    };
  
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [typedInput, canAccessAdminModal]);  
  
  const fetchPixelInfo = async (x: number, y: number) => {
    const pixelRef = ref(db, `canvas/${x}_${y}`);
    const snapshot = await get(pixelRef);
    if (snapshot.exists()) {
      setHoveredPixelInfo({ x, y, ...snapshot.val() });
    } else {
      setHoveredPixelInfo(null);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        setIsPreviewActive(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };  

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const findClosestColorIndex = (r: number, g: number, b: number) => {
  let closestIndex = 0;
  let smallestDistance = Infinity;

  colors.forEach((hexColor, index) => {
    const { r: pr, g: pg, b: pb } = hexToRgb(hexColor);

    const distance = Math.sqrt(
      (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
    );

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

const pasteImageToCanvas = async () => {
  if (!uploadedImage) {
    console.error("No image uploaded!");
    customAlert("No image uploaded!", "error");
    return;
  }

  if (pasteCoords.x === null || pasteCoords.y === null) {
    console.error("Paste coordinates are not set");
    customAlert("Paste coordinates are not set", "error");
    return;
  }

  const validX = Math.max(0, pasteCoords.x);
  const validY = Math.max(0, pasteCoords.y);

  console.log(`Pasting image at valid coordinates: (${validX}, ${validY})`);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to create a temporary canvas for processing the image.");
    customAlert("Failed to process image!", "error");
    return;
  }

  canvas.width = uploadedImage.width;
  canvas.height = uploadedImage.height;
  ctx.drawImage(uploadedImage, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (a === 0) continue;

      const colorIndex = findClosestColorIndex(r, g, b);

      const pixelX = validX + x;
      const pixelY = validY + y;
      const pixelRef = ref(db, `canvas/${pixelX}_${pixelY}`);

      try {
        await set(pixelRef, { x: pixelX, y: pixelY, color: colorIndex, placedBy: userData.username });
      } catch (error) {
        console.error(`Failed to write pixel (${pixelX}, ${pixelY})`, error);
      }
    }
  }

  customAlert("Image pasted to canvas!", "success");
  setIsPreviewActive(false);
};

  // Zoom limits
  const BASE_MIN_SCALE = 0.3;
  const ADMIN_MIN_SCALE = 0.001;
  const MAX_SCALE = 5;

  // Handle sign-in from the SidePanel
  const handleSignIn = async () => {
  if (!username.trim()) {
    customAlert("Please enter a valid name!", "error");
    return;
  }

  const normalizedUsername = username.toLowerCase();
  const userRef = ref(db, `users/${normalizedUsername}`);
  const snapshot = await get(userRef);

  let newUserData = {
    role: "Guest",
    timeOnPage: 0,
    pfpurl: "https://demiffy.com/defaultuser.png",
  };

  if (!snapshot.exists()) {
    try {
      await set(userRef, newUserData);
    } catch (error) {
      console.error("Error setting user data:", error);
      customAlert("Failed to sign in. Please try again.", "error");
      return;
    }
  } else {
    newUserData = snapshot.val();
  }

  setUserData({ ...newUserData, username: normalizedUsername });

  const userOnlineRef = ref(db, `users/${normalizedUsername}/online`);
  try {
    await set(userOnlineRef, true);
    onDisconnect(userOnlineRef).set(false);
  } catch (error) {
    console.error("Error setting user online status:", error);
  }

  setIsSignedIn(true);
};

useEffect(() => {
  const handleUnload = () => {
    if (isSignedIn && userData.username) {
      const userOnlineRef = ref(db, `users/${userData.username}/online`);
      set(userOnlineRef, false);
    }
  };

  window.addEventListener("beforeunload", handleUnload);
  return () => {
    window.removeEventListener("beforeunload", handleUnload);
  };
}, [isSignedIn, userData.username]);

  const customAlert = (text: string, type: "success" | "error" | "info" | "tip") => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 7000);
  };   

  // FPS Tracking
  const [fps, setFps] = useState<number>(0);
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateFps = () => {
      frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(updateFps);
    };

    updateFps();
  }, []);

  // State for viewport size
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update viewport size on window resize
  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Initialize offset to center (0,0) at the center of the canvas
  useEffect(() => {
    const initializeCanvas = () => {
      setOffset({ x: viewport.width / 2, y: viewport.height / 2 });
      drawCanvas([]);
    };

    initializeCanvas();
  }, [viewport.width, viewport.height]);

  // Fetch and draw canvas data from Firebase
  useEffect(() => {
    const canvasReference = ref(db, 'canvas');
    const unsubscribe = onValue(canvasReference, (snapshot) => {
      const data = snapshot.val();
      const newCanvasData = data ? Object.values(data) : [];
      setCanvasData(newCanvasData);
    });
  
    return () => unsubscribe();
  }, []);  

  // Draw the canvas
  const drawCanvas = useCallback(
    (
      canvasData: any[],
      hoveredPixel?: { x: number; y: number } | null,
      localPixels: {
        x: number;
        y: number;
        color: number;
        placedBy: string;
        timestamp: number;
      }[] = []
    ) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, viewport.width, viewport.height);
  
          ctx.save();
          ctx.translate(offset.x, offset.y);
          ctx.scale(scale, scale);
  
          const adjustedPixelSize = pixelSize + (scale < 1 ? 1 / scale : 0);
  
          const startX = Math.floor((-offset.x / scale) / pixelSize) - 1;
          const endX = Math.ceil((viewport.width - offset.x) / scale / pixelSize) + 1;
          const startY = Math.floor((-offset.y / scale) / pixelSize) - 1;
          const endY = Math.ceil((viewport.height - offset.y) / scale / pixelSize) + 1;
  
          const combinedCanvasData = [...canvasData, ...localPixels];
          const pixelMap = new Map<string, any>();
          combinedCanvasData.forEach(pixel => {
            const key = `${pixel.x}_${pixel.y}`;
            pixelMap.set(key, pixel);
          });
          const visiblePixels = Array.from(pixelMap.values()).filter(pixel => (
            pixel.x >= startX &&
            pixel.x <= endX &&
            pixel.y >= startY &&
            pixel.y <= endY
          ));
  
          // Render visible pixels
          visiblePixels.forEach((pixel: any) => {
            if (pixel.color === -1) return;
  
            const x = pixel.x * pixelSize;
            const y = pixel.y * pixelSize;
            ctx.fillStyle = colors[pixel.color];
            ctx.fillRect(x, y, adjustedPixelSize, adjustedPixelSize);
          });
  
          // Highlight hovered pixel
          if (hoveredPixel) {
            const highlightX = hoveredPixel.x * pixelSize;
            const highlightY = hoveredPixel.y * pixelSize;
  
            ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
            ctx.fillRect(
              highlightX,
              highlightY,
              adjustedPixelSize,
              adjustedPixelSize
            );
  
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
            ctx.lineWidth = 2 / scale;
            ctx.strokeRect(
              highlightX + 1 / scale,
              highlightY + 1 / scale,
              adjustedPixelSize - 2 / scale,
              adjustedPixelSize - 2 / scale
            );
          }
  
          // Draw grid if zoomed in
          if (scale > 1) {
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 0.5 / scale;
  
            for (let x = startX; x <= endX; x++) {
              const posX = x * pixelSize;
              ctx.beginPath();
              ctx.moveTo(posX, startY * pixelSize);
              ctx.lineTo(posX, endY * pixelSize);
              ctx.stroke();
            }
  
            for (let y = startY; y <= endY; y++) {
              const posY = y * pixelSize;
              ctx.beginPath();
              ctx.moveTo(startX * pixelSize, posY);
              ctx.lineTo(endX * pixelSize, posY);
              ctx.stroke();
            }
          } else {
            setHoveredPixelInfo(null);
          }
  
          // Draw Preview Image if active
          if (isPreviewActive && uploadedImage && pasteCoords.x !== null && pasteCoords.y !== null) {
            ctx.globalAlpha = 0.5;
            ctx.drawImage(
              uploadedImage,
              pasteCoords.x * pixelSize,
              pasteCoords.y * pixelSize,
              uploadedImage.width * pixelSize,
              uploadedImage.height * pixelSize
            );
            ctx.globalAlpha = 1;
          }
  
          ctx.restore();
        }
      }
    },
    [
      offset,
      scale,
      viewport.height,
      viewport.width,
      pixelSize,
      isPreviewActive,
      uploadedImage,
      pasteCoords,
      colors
    ]
  );  

  const updateCursorPosition = async (pixelX: number, pixelY: number) => {
    if (!isSignedIn || !userData.username) return;
  
    const userCursorRef = ref(db, `users/${userData.username}/cursor`);
    
    try {
      await set(userCursorRef, { x: pixelX, y: pixelY });
    } catch (error) {
      console.error("Failed to update cursor position in Firebase:", error);
    }
  };  
  
  // Handle placing/removing a pixel
  const handleCanvasInteraction = (x: number, y: number) => {
    if (!userData.username) {
      customAlert(
        "Please sign in to place pixels.",
        "tip"
      );
      return;
    }
  
    const adjustedX = (x - offset.x) / scale;
    const adjustedY = (y - offset.y) / scale;
  
    const pixelX = Math.floor(adjustedX / pixelSize);
    const pixelY = Math.floor(adjustedY / pixelSize);
  
    const pixelKey = `${pixelX}_${pixelY}`;
    const timestamp = Date.now();

    pixelBufferRef.current[pixelKey] = {
      x: pixelX,
      y: pixelY,
      color: isEraserSelected ? -1 : selectedColor,
      placedBy: userData.username,
      timestamp,
    };
  
    setLocalPixels((prev) => [
      ...prev,
      {
        x: pixelX,
        y: pixelY,
        color: isEraserSelected ? -1 : selectedColor,
        placedBy: userData.username,
        timestamp,
      }
    ]);
  };  

  const flushPixelBuffer = async () => {
    const bufferedPixels = pixelBufferRef.current;
  
    if (Object.keys(bufferedPixels).length === 0) return;
  
    const updates: { [key: string]: any } = {};
    for (const [key, pixel] of Object.entries(bufferedPixels)) {
      updates[`canvas/${key}`] = pixel;
    }
  
    try {
      await update(ref(db), updates);
      console.log("Batch update successful:", updates);
    } catch (error) {
      console.error("Batch update failed:", error);
      customAlert("Failed to update pixels. Please try again.", "error");
    }
  
    pixelBufferRef.current = {};
    setLocalPixels([]);
  };  


  const jumpToCoords = (x: number, y: number) => {
    setOffset({ x: viewport.width / 2 - x * pixelSize * scale, y: viewport.height / 2 - y * pixelSize * scale });
  };

  // Event handler mouse down
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (event.button === 0 && !event.ctrlKey) {
        setIsPainting(true);
        handleCanvasInteraction(x, y);
    } else if ((event.button === 0 && event.ctrlKey) || event.button === 1) {
        event.preventDefault();
        setIsPanning(true);
        setLastMousePos({ x: event.clientX, y: event.clientY });
    }
};


useEffect(() => {
  drawCanvas(canvasData, hoveredPixel, localPixels);
}, [canvasData, hoveredPixel, localPixels, drawCanvas]);

// Event handler mouse move
const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const canvasX = (x - offset.x) / scale;
  const canvasY = (y - offset.y) / scale;

  const pixelX = Math.floor(canvasX / pixelSize);
  const pixelY = Math.floor(canvasY / pixelSize);

  setMouseCoords({ x: canvasX, y: canvasY });
  setHoveredPixel({ x: pixelX, y: pixelY });

  if (isPixelInfoEnabled) {
    fetchPixelInfo(pixelX, pixelY);
  }

  if (
    lastPixelPosition.current?.x !== pixelX ||
    lastPixelPosition.current?.y !== pixelY
  ) {
    lastPixelPosition.current = { x: pixelX, y: pixelY };
    updateCursorPosition(pixelX, pixelY);
  }

  if (isPainting) {
    handleCanvasInteraction(x, y);
  }

  if (isPanning && lastMousePos) {
    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;
    setOffset((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }
};

const handleMouseLeave = () => {
  setHoveredPixel(null);
  setHoveredPixelInfo(null);
};

// Event handler mouse up
const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
  if ((event.button === 0 && isPanning) || event.button === 1) {
      setIsPanning(false);
      setLastMousePos(null);
  }

  if (event.button === 0) {
      setIsPainting(false);
      flushPixelBuffer();
  }
};

  // Handle zooming
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
  
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      const zoomFactor = 1.1;
      let newScale = scale;
  
      const currentMinScale = adminModalOpen ? ADMIN_MIN_SCALE : BASE_MIN_SCALE;
  
      if (e.deltaY < 0) {
        // Zoom in
        newScale = scale * zoomFactor;
      } else {
        // Zoom out
        newScale = scale / zoomFactor;
      }
  
      newScale = Math.max(currentMinScale, Math.min(MAX_SCALE, newScale));
  
      const scaleRatio = newScale / scale;
  
      const newOffsetX = mouseX - scaleRatio * (mouseX - offset.x);
      const newOffsetY = mouseY - scaleRatio * (mouseY - offset.y);
  
      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    },
    [adminModalOpen, offset.x, offset.y, scale]
  );

  // Attach wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Prevent default context menu on middle click
  useEffect(() => {
    const preventDefault = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('contextmenu', preventDefault);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('contextmenu', preventDefault);
      }
    };
  }, []);

  // Function to handle username updates from SidePanel
  const handleUpdateUsername = async (newUsername: string) => {
    const normalizedNewUsername = newUsername.trim().toLowerCase();
  
    if (!normalizedNewUsername) {
      customAlert("Please enter a valid username!", "error");
      return;
    }
  
    if (normalizedNewUsername === userData.username.toLowerCase()) {
      customAlert("This is already your username!", "info");
      return;
    }
  
    try {
      const currentUserRef = ref(db, `users/${userData.username}`);
      const newUserRef = ref(db, `users/${normalizedNewUsername}`);
  
      const newUserSnapshot = await get(newUserRef);
      if (newUserSnapshot.exists()) {
        customAlert("This username is already taken. Please choose another.", "error");
        return;
      }
  
      const currentUserSnapshot = await get(currentUserRef);
      if (!currentUserSnapshot.exists()) {
        customAlert("No user data found to update!", "error");
        return;
      }
  
      const oldOnlineRef = ref(db, `users/${userData.username}/online`);
      await onDisconnect(oldOnlineRef).cancel();
  
      const { username, ...currentUserData } = currentUserSnapshot.val();
  
      await update(newUserRef, currentUserData);
      await remove(currentUserRef);
  
      const newOnlineRef = ref(db, `users/${normalizedNewUsername}/online`);
      await set(newOnlineRef, true);
      onDisconnect(newOnlineRef).set(false);
  
      setUserData((prev) => ({
        ...prev,
        username: normalizedNewUsername,
      }));
      customAlert("Username updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update username:", error);
      customAlert("An error occurred while updating your username. Please try again.", "error");
    }
  };

  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      if (users) {
        const onlineCount = Object.values(users).filter(
          (user: any) => user.online === true
        ).length;
        setOnlinePlayers(onlineCount);
      } else {
        setOnlinePlayers(0);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }; 
  
  const exportCanvasAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      customAlert("Canvas not available!", "error");
      return;
    }
  
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      customAlert("Failed to access canvas context!", "error");
      return;
    }
  
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    const data = imageData.data;
  
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const a = data[index + 3];
  
        if (a !== 0) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
  
    if (minX > maxX || minY > maxY) {
      customAlert("Canvas is empty!", "info");
      return;
    }
  
    const croppedWidth = maxX - minX + 1;
    const croppedHeight = maxY - minY + 1;
    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");
  
    if (!croppedCtx) {
      customAlert("Failed to create cropped canvas!", "error");
      return;
    }
  
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
  
    croppedCtx.putImageData(
      ctx.getImageData(minX, minY, croppedWidth, croppedHeight),
      0,
      0
    );
  
    const dataUrl = croppedCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "DemiffyPlaceCanvas.png";
    link.href = dataUrl;
    link.click();
  
    customAlert("Canvas exported as PNG!", "success");
  };

  const exportCanvasAsSVG = () => {
    const SVG_NS = "http://www.w3.org/2000/svg";
  
    const visibleStartX = Math.floor(-offset.x / (pixelSize * scale));
    const visibleEndX = Math.ceil(
      (viewport.width - offset.x) / (pixelSize * scale)
    );
    const visibleStartY = Math.floor(-offset.y / (pixelSize * scale));
    const visibleEndY = Math.ceil(
      (viewport.height - offset.y) / (pixelSize * scale)
    );
  
    const visiblePixels = canvasData.filter((pixel) => {
      return (
        pixel.x >= visibleStartX &&
        pixel.x <= visibleEndX &&
        pixel.y >= visibleStartY &&
        pixel.y <= visibleEndY &&
        pixel.color !== -1 // Ignore empty pixels
      );
    });
  
    if (visiblePixels.length === 0) {
      customAlert("No pixels in the viewport to export!", "error");
      return;
    }
  
    const minX = Math.min(...visiblePixels.map((p) => p.x));
    const maxX = Math.max(...visiblePixels.map((p) => p.x));
    const minY = Math.min(...visiblePixels.map((p) => p.y));
    const maxY = Math.max(...visiblePixels.map((p) => p.y));
  
    const exportWidth = (maxX - minX + 1) * pixelSize;
    const exportHeight = (maxY - minY + 1) * pixelSize;
  
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("width", `${exportWidth}`);
    svg.setAttribute("height", `${exportHeight}`);
    svg.setAttribute("viewBox", `0 0 ${exportWidth} ${exportHeight}`);
    svg.setAttribute("style", "background-color: white;");
  
    visiblePixels.forEach((pixel) => {
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", `${(pixel.x - minX) * pixelSize}`);
      rect.setAttribute("y", `${(pixel.y - minY) * pixelSize}`);
      rect.setAttribute("width", `${pixelSize}`);
      rect.setAttribute("height", `${pixelSize}`);
      rect.setAttribute("fill", colors[pixel.color]);
      svg.appendChild(rect);
    });
  
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
  
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = "DemiffyPlaceCanvas.svg";
    link.click();
  
    URL.revokeObjectURL(url);
  
    customAlert("Canvas exported as SVG!", "success");
  };  

return (
  <div className="h-screen bg-gray-900 text-white">

    {!isSignedIn && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Sign In</h3>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <button
            onClick={handleSignIn}
            className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold"
          >
            Sign In
          </button>
        </div>
      </div>
    )}

      {/* Admin Modal */}
      {adminModalOpen && (
        <div className="fixed top-4 right-4 bg-gray-800 bg-opacity-70 backdrop-blur-md p-4 rounded-xl shadow-lg text-white z-40 max-w-sm">
          <div className="relative space-y-4">
            {/* Close Button */}
            <button
              onClick={closeAdminModal}
              className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-lg"
              aria-label="Close Admin Panel"
            >
              ✖️
            </button>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <p className="text-xs text-gray-300">Hewwo! How did you get here? 🦊</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Export Canvas</h3>
              <button
                onClick={exportCanvasAsSVG}
                className="w-full py-1 px-3 rounded bg-green-600 hover:bg-green-500 text-white font-semibold text-xs"
              >
                Export as SVG
              </button>
            </div>
            <div>
              <button
                onClick={exportCanvasAsPNG}
                className="w-full py-1 px-3 rounded bg-green-600 hover:bg-green-500 text-white font-semibold text-xs"
              >
                Export as PNG
              </button>
            </div>
            {/* Image Upload */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Upload Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-3 p-2 bg-gray-700 rounded text-xs w-full"
              />
              <div className="flex space-x-2 mb-3">
                <input
                  type="number"
                  placeholder="X Coord"
                  value={pasteCoords.x ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
                    setPasteCoords((prev) => ({ ...prev, x: value }));
                    setIsPreviewActive(true);
                  }}
                  className="w-1/2 p-2 bg-gray-700 rounded text-xs"
                />
                <input
                  type="number"
                  placeholder="Y Coord"
                  value={pasteCoords.y ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
                    setPasteCoords((prev) => ({ ...prev, y: value }));
                    setIsPreviewActive(true);
                  }}
                  className="w-1/2 p-2 bg-gray-700 rounded text-xs"
                />
              </div>
              <button
                onClick={pasteImageToCanvas}
                className="w-full py-1 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
              >
                Paste Image
              </button>
            </div>
          </div>
        </div>
      )}

    {/* Alert Popup */}
    {alertMessage && (
      <div
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 max-w-lg text-center rounded-lg shadow-lg z-50 ${
          alertMessage.type === "success"
            ? "bg-green-500 text-white"
            : alertMessage.type === "error"
            ? "bg-red-500 text-white"
            : "bg-blue-500 text-white"
        }`}
        style={{
          animation: "fadeIn 0.5s, fadeOut 0.5s 6.5s",
        }}
      >
        <p>{alertMessage.text}</p>
      </div>
    )}

    {/* Side Panel */}
    <SidePanel
      userData={userData}
      onSignIn={handleSignIn}
      isSignedIn={isSignedIn}
      onUpdateUsername={handleUpdateUsername}
      onTogglePixelInfo={() => setIsPixelInfoEnabled((prev) => !prev)}
      isPixelInfoEnabled={isPixelInfoEnabled}
    />
    <SidePanelLookUp
      onJumpToCoords={jumpToCoords}
    />

    {/* Main Canvas Area */}
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={viewport.width}
        height={viewport.height}
        className={`absolute top-0 left-0 w-full h-full ${
          isPanning ? "cursor-grabbing" : "cursor-crosshair"
        }`}
        style={{
          backgroundColor: colors[31],
          imageRendering: "pixelated",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* Pixel Info Tooltip */}
      {scale >= 1 && hoveredPixelInfo && (
      <div
        className="absolute bg-secondary-color/90 text-white p-4 rounded-lg shadow-lg z-50 text-sm backdrop-blur-md select-none"
        style={{
          left: `${
            hoveredPixel 
              ? (hoveredPixel.x + 0.5) * pixelSize * scale + offset.x 
              : 0
          }px`,          
          top: `${
            hoveredPixel 
              ? (hoveredPixel.y + 0.5) * pixelSize * scale + offset.y 
              : 0
          }px`,          
          transform: "translate(-50%, -140%)",
          maxWidth: "260px",
        }}
      >
        <h4 className="text-base font-bold mb-2">Pixel Info</h4>
        <p className="mb-1">
          <strong>Placed By:</strong> {hoveredPixelInfo.placedBy}
        </p>
        <p className="mb-1 flex items-center">
          <strong>Color:</strong>
          <span
            className="inline-block ml-2 w-4 h-4 rounded"
            style={{
              backgroundColor: hoveredPixelInfo.color === -1 ? '#ffffff' : colors[hoveredPixelInfo.color],
            }}
          ></span>
        </p>
        <p>
          <strong>Coordinates:</strong> ({hoveredPixelInfo.x}, {hoveredPixelInfo.y})
        </p>
        {hoveredPixelInfo.timestamp && (
          <p className="mt-2 text-xs text-gray-400">
            Placed on {formatTimestamp(hoveredPixelInfo.timestamp)}
          </p>
        )}
      </div>
    )}

      {/* Overlay Color Palette */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-opacity-70 p-4 rounded-xl text-white text-sm space-y-2 backdrop-blur-md max-w-full shadow-lg">
        <div
          className="grid grid-cols-[repeat(auto-fit,_minmax(2.5rem,_1fr))] gap-2 justify-center items-center"
          style={{
            maxWidth: "90vw",
          }}
        >
          {colors.map((color, index) => (
            <div key={index} className="flex justify-center items-center">
              <div
                className={`color-square w-11 h-10 rounded border transition-all ${
                  index === selectedColor && !isEraserSelected
                    ? "border-blue-500 border-4 shadow-lg shadow-blue-300 scale-110"
                    : "border-gray-300 hover:border-gray-400 hover:scale-110 hover:shadow-md hover:shadow-gray-500 cursor-pointer"
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow:
                    index === selectedColor
                      ? "0px 0px 10px 2px rgba(59, 130, 246, 0.8)"
                      : "none",
                }}
                onClick={() => {
                  setSelectedColor(index);
                  setIsEraserSelected(false);
                }}
                aria-label={`Select color ${color}`}
              />
            </div>
          ))}

          {/* Eraser Icon */}
          <div className="flex justify-center items-center select-none">
            <div
              className={`color-square border-red-500 w-11 h-11 rounded border transition-all ${
                isEraserSelected
                  ? "border-red-500 border-4 shadow-lg shadow-red-300 scale-110"
                  : "border-gray-300 hover:border-red-400 hover:scale-110 hover:shadow-md hover:shadow-gray-500 cursor-pointer"
              }`}
              style={{
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setIsEraserSelected(true)}
              aria-label="Eraser"
            >
              <img
                src="/eraser.png"
                alt="Eraser"
                className={`w-8 h-8 transition-transform ${
                  isEraserSelected ? "scale-110" : "hover:scale-110"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Online Players Display */}
      <div className="absolute bottom-10 right-6 bg-opacity-70 p-2 rounded-lg text-zinc-800 text-xs backdrop-blur-md">
        <p className="flex items-center">
          <span className="font-bold mr-1">Online:</span>
          <span className='text-gray-500'>{onlinePlayers}</span>
        </p>
      </div>

      {/* Coordinate and Zoom Display */}
      <div className="absolute top-12 right-6 bg-opacity-70 p-4 rounded-xl text-zinc-800 text-sm space-y-2 backdrop-blur-md">
        <p className="flex items-center">
          <span className="font-bold mr-1">Coordinates:</span>
          <span>
            X: {Math.floor(mouseCoords.x / pixelSize)}, Y: {Math.floor(mouseCoords.y / pixelSize)}
          </span>
        </p>
        <p className="flex items-center">
          <span className="font-bold mr-1">Zoom:</span>
          <span>{scale.toFixed(2)}x</span>
        </p>
        <p className="flex items-center">
          <span className="font-bold mr-1">FPS:</span>
          <span
            className={`font-bold ${
              fps >= 100
                ? "text-green-500"
                : fps >= 50
                ? "text-orange-200"
                : "text-red-500"
            }`}
          >
            {fps}
          </span>
        </p>
      </div>
    </div>
  </div>
);
};

export default PlaceV2;