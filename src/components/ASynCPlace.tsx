// ASynC.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, update, remove, onDisconnect } from 'firebase/database';
import SidePanel from './ui/SidePanel';
import SidePanelLookUp from './ui/SidePanelLookUp';
import ChatBox from './ui/ChatBox';

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

const ASynCPlace: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
  const drawingStartTimeRef = useRef<number | null>(null);
  const drawingTimerRef = useRef<NodeJS.Timeout | null>(null);
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
  const [brushSize, setBrushSize] = useState<number>(1);
  const [showBrushMenu, setShowBrushMenu] = useState<boolean>(false);
  const [brushMenuPosition, setBrushMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [showAchievements, setShowAchievements] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const achievementsList = [
    // **Beginner Achievements**
    { id: 'first_pixel', name: 'Pixel Pioneer', description: 'Placed your very first pixel. Welcome aboard!', imgSrc: '/achievements/first_pixel.png' },
    { id: 'five_pixels', name: 'Getting the Hang of It', description: 'Placed 5 pixels. A great start!', imgSrc: '/achievements/five_pixels.png' },
    { id: 'ten_pixels', name: 'Double Digits', description: 'Placed 10 pixels. Keep it going!', imgSrc: '/achievements/ten_pixels.png' },

    // **Engagement-Based Achievements**
    { id: 'canvas_regular', name: 'Canvas Regular', description: 'Logged in and interacted 10 times!', imgSrc: '/achievements/canvas_regular.png' },
    { id: 'dedicated_artist', name: 'Canvas Keeper', description: 'Spent 1 hour creating art on the canvas.', imgSrc: '/achievements/dedicated_artist.png' },
    { id: 'persistent_painter', name: 'Persistent Painter', description: 'Stayed active for 30 minutes in one session.', imgSrc: '/achievements/persistent_painter.png' },
    { id: 'legendary_creator', name: 'Legendary Creator', description: 'Placed an astonishing 10,000 pixels!', imgSrc: '/achievements/legendary_creator.png' },

    // **Color & Creativity Achievements**
    { id: 'color_virtuoso', name: 'Color Virtuoso', description: 'Used every color in the palette at least once!', imgSrc: '/achievements/color_virtuoso.png' },
    { id: 'harmony_creator', name: 'Harmony Creator', description: 'Placed a pixel with each color in order of the rainbow.', imgSrc: '/achievements/harmony_creator.png' },
    { id: 'precision_madness', name: 'Precision Madness', description: 'Placed 20 pixels in a perfect line.', imgSrc: '/achievements/precision_madness.png' },

    // **Time & Event Achievements**
    { id: 'night_owl', name: 'Moonlit Artist', description: 'Placed pixels between 12 AM and 4 AM.', imgSrc: '/achievements/night_owl.png' },
    { id: 'early_bird', name: 'Dawn Creator', description: 'Placed pixels before 8 AM.', imgSrc: '/achievements/early_bird.png' },
    { id: 'weekender', name: 'Weekend Warrior', description: 'Logged in and placed pixels on a weekend.', imgSrc: '/achievements/weekender.png' },
    { id: 'long_runner', name: 'Marathon Artist', description: 'Stayed active for 3 hours straight!', imgSrc: '/achievements/long_runner.png' },
    { id: 'time_traveler', name: 'Time Traveler', description: 'Logged in at least once every day for a week.', imgSrc: '/achievements/time_traveler.png' },

    // **Interaction-Based Achievements**
    { id: 'community_builder', name: 'Friendly Neighbor', description: 'Sent 10 messages in the chat.', imgSrc: '/achievements/community_builder.png' },
    { id: 'chatterbox', name: 'Chatterbox', description: 'Sent 50 messages in chat. Talkative much?', imgSrc: '/achievements/chatterbox.png' },

    // **Tool Usage Achievements**
    { id: 'eraser_wizard', name: 'Eraser Wizard', description: 'Erased 100 pixels. Cleaning up nicely!', imgSrc: '/achievements/eraser_wizard.png' },
    { id: 'brush_master', name: 'Brush Master', description: 'Used every brush size in a single session.', imgSrc: '/achievements/brush_master.png' },

    // **Streak Achievements**
    { id: 'streak_keeper', name: 'Daily Devotee', description: 'Logged in for 7 consecutive days.', imgSrc: '/achievements/streak_keeper.png' },

    // **Challenge & Fun Achievements**
    { id: 'canvas_click', name: 'How Is That Possible', description: 'Clicked on the canvas 50 times without placing a pixel.', imgSrc: '/achievements/canvas_click.png' },
    { id: 'the_perfectionist', name: 'The Perfectionist', description: 'Replaced 50 pixels placed by a different user.', imgSrc: '/achievements/the_perfectionist.png' },
    { id: 'hidden_masterpiece', name: 'Hidden Masterpiece', description: 'Placed a pixel in a hidden or remote area of the canvas.', imgSrc: '/achievements/hidden_masterpiece.png' },

    // **Exclusive & Secret Achievements**
    { id: 'completionist', name: 'The Completionist', description: 'Unlocked all available achievements!', imgSrc: '/achievements/completionist.png' },
  ];

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

  const startCanvasMovement = () => {
    if (movementIntervalRef.current) return;

    const maxSpeed = 1.5;
    const directionChangeInterval = 10000;
    const slowDownDuration = 5000;
    const speedUpDuration = 5000;

    let velocity = { x: 0, y: 0 };
    let targetVelocity = { x: 0, y: 0 };
    let transitionProgress = 0;
    let isSlowingDown = false;

    const normalizeVelocity = (vx: number, vy: number, speed: number) => {
      const magnitude = Math.sqrt(vx * vx + vy * vy);
      if (magnitude === 0) return { x: speed, y: 0 };
      return {
        x: (vx / magnitude) * speed,
        y: (vy / magnitude) * speed,
      };
    };

    const updateDirection = () => {
      const angle = Math.random() * 2 * Math.PI;
      targetVelocity = normalizeVelocity(Math.cos(angle), Math.sin(angle), maxSpeed);
    };

    const handleDirectionChange = () => {
      isSlowingDown = true;
      transitionProgress = 0;

      const slowDownInterval = setInterval(() => {
        transitionProgress += 16.7 / slowDownDuration;
        if (transitionProgress >= 1) {
          clearInterval(slowDownInterval);
          isSlowingDown = false;
          velocity = { x: 0, y: 0 };
          updateDirection();
          handleSpeedUp();
        } else {
          velocity = {
            x: velocity.x * (1 - transitionProgress),
            y: velocity.y * (1 - transitionProgress),
          };
        }
      }, 16.7);
    };

    const handleSpeedUp = () => {
      transitionProgress = 0;

      const speedUpInterval = setInterval(() => {
        transitionProgress += 16.7 / speedUpDuration;
        if (transitionProgress >= 1) {
          clearInterval(speedUpInterval);
          velocity = { ...targetVelocity };
        } else {

          velocity = {
            x: targetVelocity.x * transitionProgress,
            y: targetVelocity.y * transitionProgress,
          };
        }
      }, 16.7);
    };

    const moveCanvas = () => {
      if (!isSlowingDown) {
        setOffset((prevOffset) => ({
          x: prevOffset.x + velocity.x,
          y: prevOffset.y + velocity.y,
        }));
      }

      movementIntervalRef.current = requestAnimationFrame(moveCanvas) as unknown as NodeJS.Timeout;
    };

    updateDirection();
    handleSpeedUp();

    const directionChangeTimer = setInterval(handleDirectionChange, directionChangeInterval);

    movementIntervalRef.current = requestAnimationFrame(moveCanvas) as unknown as NodeJS.Timeout;

    return () => clearInterval(directionChangeTimer);
  };

  const stopCanvasMovement = () => {
    if (movementIntervalRef.current) {
      cancelAnimationFrame(movementIntervalRef.current as unknown as number);
      movementIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      startCanvasMovement();
    } else {
      stopCanvasMovement();
    }

    return () => stopCanvasMovement();
  }, [isSignedIn]);

const startDrawingTimer = () => {
  if (drawingTimerRef.current) {
    clearInterval(drawingTimerRef.current);
  }

  drawingTimerRef.current = setInterval(() => {
    console.log("Auto-flushing pixel buffer every 10 seconds of drawing.");
    flushPixelBuffer();
  }, 10000);
};

const stopDrawingTimer = () => {
  console.log("Drawing timer stopped.");
  if (drawingTimerRef.current) {
    clearInterval(drawingTimerRef.current);
    drawingTimerRef.current = null;
  }
  drawingStartTimeRef.current = null;
};

useEffect(() => {
  return () => {
    if (drawingTimerRef.current) {
      clearInterval(drawingTimerRef.current);
      drawingTimerRef.current = null;
    }
  };
}, []);

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

  const validX = pasteCoords.x ?? 0;
  const validY = pasteCoords.y ?? 0;  

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

  const updates: { [key: string]: any } = {};

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
      const pixelKey = `${pixelX}_${pixelY}`;

      updates[`canvas/${pixelKey}`] = {
        x: pixelX,
        y: pixelY,
        color: colorIndex,
        placedBy: userData.username,
        timestamp: Date.now(),
      };
    }
  }

  try {
    await update(ref(db), updates);
    console.log("Batch image paste successful.");
    customAlert("Image pasted to canvas!", "success");
  } catch (error) {
    console.error("Failed to perform batch image paste:", error);
    customAlert("Failed to paste image. Please try again.", "error");
  }

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
            if (pixel.color === 31) return;

            const x = pixel.x * pixelSize;
            const y = pixel.y * pixelSize;
            ctx.fillStyle = colors[pixel.color];
            ctx.fillRect(x, y, adjustedPixelSize, adjustedPixelSize);
          });

          if (hoveredPixel) {
            const halfBrush = Math.floor(brushSize / 2);
            const regionX = (hoveredPixel.x - halfBrush) * pixelSize;
            const regionY = (hoveredPixel.y - halfBrush) * pixelSize;
            const regionSize = brushSize * adjustedPixelSize;

            ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; 
            ctx.fillRect(regionX, regionY, regionSize, regionSize);

            ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
            ctx.lineWidth = 2 / scale;
            ctx.strokeRect(
              regionX + 1 / scale,
              regionY + 1 / scale,
              regionSize - 2 / scale,
              regionSize - 2 / scale
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
      colors,
      brushSize
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
      customAlert("Please sign in to place pixels.", "tip");
      return;
    }

    const adjustedX = (x - offset.x) / scale;
    const adjustedY = (y - offset.y) / scale;
    const pixelX = Math.floor(adjustedX / pixelSize);
    const pixelY = Math.floor(adjustedY / pixelSize);
    const timestamp = Date.now();

    for (let dy = -Math.floor(brushSize / 2); dy <= Math.floor(brushSize / 2); dy++) {
      for (let dx = -Math.floor(brushSize / 2); dx <= Math.floor(brushSize / 2); dx++) {
        const targetX = pixelX + dx;
        const targetY = pixelY + dy;
        const key = `${targetX}_${targetY}`;

        if (isEraserSelected) {
          pixelBufferRef.current[key] = null;

          setLocalPixels((prev) => [
            ...prev.filter(
              (p) => !(p.x === targetX && p.y === targetY)
            ),
            {
              x: targetX,
              y: targetY,
              color: 31,
              placedBy: userData.username,
              timestamp,
            }
          ]);
        } else {
          pixelBufferRef.current[key] = {
            x: targetX,
            y: targetY,
            color: selectedColor,
            placedBy: userData.username,
            timestamp,
          };

          setLocalPixels((prev) => [
            ...prev,
            {
              x: targetX,
              y: targetY,
              color: selectedColor,
              placedBy: userData.username,
              timestamp,
            }
          ]);
        }
      }
    }
  };

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setShowBrushMenu(true);
    setBrushMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const selectBrushSize = (size: number) => {
    setBrushSize(size);
    setShowBrushMenu(false);

    drawCanvas(canvasData, hoveredPixel, localPixels);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('contextmenu', handleContextMenu);
    return () => {
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [canvasRef]);

  const flushPixelBuffer = async () => {
    const bufferedPixels = pixelBufferRef.current;

    if (Object.keys(bufferedPixels).length === 0) return;

    const updates: { [key: string]: any } = {};
    for (const [key, pixel] of Object.entries(bufferedPixels)) {
      if (pixel === null) {
        updates[`canvas/${key}`] = null;
      } else {
        updates[`canvas/${key}`] = pixel;
      }
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
        startDrawingTimer();
        handleCanvasInteraction(x, y);
    } else if ((event.button === 0 && event.ctrlKey) || event.button === 1) {
        event.preventDefault();
        setIsPanning(true);
        setLastMousePos({ x: event.clientX, y: event.clientY });
    }

    if (showBrushMenu) {
      setShowBrushMenu(false);
    }
};


useEffect(() => {
  drawCanvas(canvasData, hoveredPixel, localPixels);
}, [canvasData, hoveredPixel, localPixels, drawCanvas]);

const MENU_CLOSE_THRESHOLD = 20;

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

  if (showBrushMenu) {
    const dx = event.clientX - brushMenuPosition.x;
    const dy = event.clientY - brushMenuPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > MENU_CLOSE_THRESHOLD) {
      setShowBrushMenu(false);
    }
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
      stopDrawingTimer();
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
        pixel.color !== -1
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

  const awardAchievement = async (achievementId: string) => {
    if (unlockedAchievements.includes(achievementId)) return;
    try {
      const achievementRef = ref(db, `users/${userData.username}/achievements/${achievementId}`);
      await set(achievementRef, true);
      setUnlockedAchievements(prev => [...prev, achievementId]);
      customAlert(`Achievement Unlocked: ${achievementId}`, "success");
    } catch (error) {
      console.error("Error awarding achievement:", error);
      customAlert("Failed to award achievement. Try again.", "error");
    }
  };

  useEffect(() => {
    if (!userData.username) return;
    const achievementsRef = ref(db, `users/${userData.username}/achievements`);
    const unsubscribe = onValue(achievementsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUnlockedAchievements(Object.keys(data).filter(key => data[key] === true));
      } else {
        setUnlockedAchievements([]);
      }
    });
    return () => unsubscribe();
  }, [db, userData.username]);

  //TODO: ADD CHECKS FOR ACHIEVEMENTS ADD ACHIV PROGRESS TO EACH USER IN DB

return (
  <div className="h-screen bg-gray-900 text-white">

  {isSignedIn && <ChatBox currentUsername={userData.username} />}

    {!isSignedIn && (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-50">
        <h1 className="text-4xl font-extrabold text-white mb-6">
          ASynC Place
        </h1>
        <div className="bg-secondary-color p-6 rounded-lg shadow-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Sign In</h3>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded bg-quaternary-color text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <button
            onClick={handleSignIn}
            className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold"
          >
            Sign In
          </button>
        </div>
        <img
          src="/DMLogoGif.gif"
          alt="Demiffy Logo"
          className="absolute bottom-4 w-20 object-contain"
        />
      </div>
    )}

    {/* Achievement */}
    {showAchievements && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 transition-opacity duration-300">
      <div className="bg-secondary-color p-8 rounded-xl shadow-2xl text-white max-w-5xl w-full transform scale-100 transition-transform duration-300">
        <h3 className="text-3xl font-extrabold mb-6 text-center border-b pb-3 border-gray-700">
          Achievements
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto mb-6">
          {achievementsList.map(ach => (
            <li key={ach.id} className="flex flex-col items-center bg-tertiary-color p-4 rounded-lg shadow hover:shadow-xl transition-shadow space-y-3">
              <img 
                src={ach.imgSrc} 
                alt={ach.name} 
                className="w-20 h-20 object-cover rounded-lg shadow-md"
                onError={(e) => (e.currentTarget.src = '/achievements/placeholder.png')}
              />
              <div className="text-center">
                <p className="font-semibold text-xl">{ach.name}</p>
                <p className="text-sm text-gray-300">{ach.description}</p>
              </div>
              {unlockedAchievements.includes(ach.id) ? (
                <span className="text-green-400 font-bold mt-2">Completed ✓</span>
              ) : (
                userData.role === "Developer" && (
                <button 
                  onClick={() => awardAchievement(ach.id)}
                  className="mt-2 text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  Unlock
                </button>
                )
              )}
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowAchievements(false)}
          className="w-full py-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )}

      {/* Brush Size Context Menu */}
      {showBrushMenu && (
      <div
        className="absolute z-50 p-4 rounded-xl shadow-2xl backdrop-blur-md transition-transform transform-gpu motion-reduce:transition-none"
        style={{
          top: brushMenuPosition.y,
          left: brushMenuPosition.x,
          background:
            "linear-gradient(135deg, #141312 0%, #1b1a19 100%)",
        }}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Select Brush Size</h3>
          </div>
          <div className="flex space-x-4 justify-center">
            {[1, 3, 5, 7].map(size => (
              <button
                key={size}
                className="flex flex-col items-center justify-center focus:outline-none transition-transform transform hover:scale-110"
                onClick={() => selectBrushSize(size)}
              >
                <div
                  className="bg-blue-500 rounded-full mb-1 shadow-md"
                  style={{
                    width: `${size * 6}px`,
                    height: `${size * 6}px`,
                  }}
                />
                <span className="text-xs text-gray-200">{size}×{size}</span>
              </button>
            ))}
          </div>
          <button
            className="w-full py-2 mt-2 bg-red-600 text-white rounded-md text-center hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
            onClick={() => setShowBrushMenu(false)}
          >
            Cancel
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
    {isSignedIn && <SidePanel
      userData={userData}
      onSignIn={handleSignIn}
      isSignedIn={isSignedIn}
      onUpdateUsername={handleUpdateUsername}
      onTogglePixelInfo={() => setIsPixelInfoEnabled((prev) => !prev)}
      isPixelInfoEnabled={isPixelInfoEnabled}
      onAchievementsButtonClick={() => setShowAchievements(true)}
    />}
    {isSignedIn && <SidePanelLookUp
      onJumpToCoords={jumpToCoords}
    />}

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
      {isSignedIn &&
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
      }

      {/* Online Players Display */}
      {isSignedIn &&
      <div className="absolute bottom-10 right-6 bg-opacity-70 p-2 rounded-lg text-zinc-800 text-xs backdrop-blur-md">
        <p className="flex items-center">
          <span className="font-bold mr-1">Online:</span>
          <span className='text-gray-500'>{onlinePlayers}</span>
        </p>
      </div>
      }

      {/* Coordinate and Zoom Display */}
      {isSignedIn &&
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
      }
    </div>
  </div>
);
};

export default ASynCPlace;