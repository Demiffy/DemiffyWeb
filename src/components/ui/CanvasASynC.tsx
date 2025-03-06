import React, { useRef, useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, onValue, update } from 'firebase/database';

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const pixelSize = 20;

const colors = [
  '#6d001a', '#be0039', '#ff4500', '#ffa800', '#ffd635', '#fff8b8',
  '#00a368', '#00cc78', '#7eed56', '#00756f', '#009eaa', '#00ccc0',
  '#2450a4', '#3690ea', '#51e9f4', '#493ac1', '#6a5cff', '#94b3ff',
  '#811e9f', '#b44ac0', '#e4abff', '#de107f', '#ff3881', '#ff99aa',
  '#6d482f', '#9c6926', '#ffb470', '#000000', '#515252', '#898d90',
  '#d4d7d9', '#ffffff',
];

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Pixel {
  x: number;
  y: number;
  color: string;
}

function rectContains(rect: Rect, point: Pixel): boolean {
  return (
    point.x >= rect.x &&
    point.x < rect.x + rect.width &&
    point.y >= rect.y &&
    point.y < rect.y + rect.height
  );
}

function rectIntersects(a: Rect, b: Rect): boolean {
  return !(
    b.x > a.x + a.width ||
    b.x + b.width < a.x ||
    b.y > a.y + a.height ||
    b.y + b.height < a.y
  );
}

class Quadtree {
  boundary: Rect;
  capacity: number;
  points: Pixel[];
  divided: boolean;
  northeast: Quadtree | null;
  northwest: Quadtree | null;
  southeast: Quadtree | null;
  southwest: Quadtree | null;

  constructor(boundary: Rect, capacity: number) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  }

  subdivide() {
    const { x, y, width, height } = this.boundary;
    const halfW = width / 2;
    const halfH = height / 2;
    this.northeast = new Quadtree({ x: x + halfW, y, width: halfW, height: halfH }, this.capacity);
    this.northwest = new Quadtree({ x, y, width: halfW, height: halfH }, this.capacity);
    this.southeast = new Quadtree({ x: x + halfW, y: y + halfH, width: halfW, height: halfH }, this.capacity);
    this.southwest = new Quadtree({ x, y: y + halfH, width: halfW, height: halfH }, this.capacity);
    this.divided = true;
  }

  insert(point: Pixel): boolean {
    if (!rectContains(this.boundary, point)) return false;
    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }
    if (!this.divided) this.subdivide();
    return (
      this.northeast!.insert(point) ||
      this.northwest!.insert(point) ||
      this.southeast!.insert(point) ||
      this.southwest!.insert(point)
    );
  }

  query(range: Rect, found: Pixel[] = []): Pixel[] {
    if (!rectIntersects(this.boundary, range)) return found;
    for (let p of this.points) {
      if (rectContains(range, p)) found.push(p);
    }
    if (this.divided) {
      this.northwest!.query(range, found);
      this.northeast!.query(range, found);
      this.southwest!.query(range, found);
      this.southeast!.query(range, found);
    }
    return found;
  }
}

function hexToRGB(hex: any): [number, number, number] {
  if (typeof hex !== 'string') hex = String(hex);
  if (hex.startsWith('#')) hex = hex.slice(1);
  if (hex.length === 3) hex = hex.split('').map((c: string) => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 a_vertex;
in vec2 a_offset;
in vec3 a_color;
uniform vec2 u_offset;
uniform float u_scale;
uniform vec2 u_resolution;
uniform float u_pixelSize;
out vec3 v_color;
void main() {
  vec2 worldPos = a_offset + a_vertex * u_pixelSize;
  vec2 canvasPos = u_offset + u_scale * worldPos;
  vec2 clipPos = (canvasPos / u_resolution) * 2.0 - 1.0;
  clipPos.y = -clipPos.y;
  gl_Position = vec4(clipPos, 0.0, 1.0);
  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
in vec3 v_color;
out vec4 outColor;
void main() {
  outColor = vec4(v_color, 1.0);
}
`;

function compileShader(gl: WebGL2RenderingContext, source: string, type: number): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compile error: " + err);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
  const vs = compileShader(gl, vsSource, gl.VERTEX_SHADER);
  const fs = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const err = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link error: " + err);
  }
  return program;
}

function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): T {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  } as T;
}

const CanvasASynC: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
  const instanceBufferRef = useRef<WebGLBuffer | null>(null);
  const colorBufferRef = useRef<WebGLBuffer | null>(null);
  const vertexBufferRef = useRef<WebGLBuffer | null>(null);
  const instanceBufferSizeRef = useRef<number>(0);
  const colorBufferSizeRef = useRef<number>(0);
  const updateQueueRef = useRef<Record<string, any>>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pixelDebounceRef = useRef<Record<string, number>>({});
  const debounceTime = 50;
  const maxQueueSize = 100;

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isPanning, setIsPanning] = useState(false);
  const [mouseWorld, setMouseWorld] = useState({ x: 0, y: 0 });
  const [fps, setFps] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [isEraserSelected, setIsEraserSelected] = useState<boolean>(false);
  const [, setPixels] = useState<Record<string, any>>({});
  const quadtreeRef = useRef<Quadtree | null>(null);
  const visiblePixelsRef = useRef<Pixel[]>([]);

  useEffect(() => {
    const canvasDBRef = dbRef(db, 'canvas');
    const unsubscribe = onValue(canvasDBRef, (snapshot) => {
      const newPixels = snapshot.exists() ? snapshot.val() : {};
      setPixels(newPixels);

      if (!quadtreeRef.current) {
        const pixelArray: Pixel[] = [];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        Object.entries(newPixels).forEach(([key, pixelData]) => {
          const parts = key.split('_');
          if (parts.length !== 2) return;
          const x = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10);
          const colorIndex = parseInt((pixelData as { color: string }).color, 10);
          const colorHex = colors[colorIndex] || '#000000';
          if (colorHex.toLowerCase() === '#ffffff') return;
          pixelArray.push({ x, y, color: colorHex });
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        });
        if (minX === Infinity) {
          minX = -1000; minY = -1000; maxX = 1000; maxY = 1000;
        }
        const boundary: Rect = { 
          x: minX, 
          y: minY, 
          width: maxX - minX + pixelSize, 
          height: maxY - minY + pixelSize 
        };
        const qt = new Quadtree(boundary, 16);
        pixelArray.forEach((p) => qt.insert(p));
        quadtreeRef.current = qt;
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let lastUpdate = performance.now();
    const updateLoop = () => {
      const now = performance.now();
      if (now - lastUpdate > 1) {
        if (quadtreeRef.current) {
          const effectiveViewportTopLeft = { 
            x: (0 - offset.x) / scale, 
            y: (0 - offset.y) / scale 
          };
          const effectiveViewportBottomRight = { 
            x: (viewport.width - offset.x) / scale, 
            y: (viewport.height - offset.y) / scale 
          };
          const gridEffectiveTopLeft = { 
            x: Math.floor(effectiveViewportTopLeft.x / pixelSize), 
            y: Math.floor(effectiveViewportTopLeft.y / pixelSize) 
          };
          const gridEffectiveBottomRight = { 
            x: Math.floor(effectiveViewportBottomRight.x / pixelSize) + 1, 
            y: Math.floor(effectiveViewportBottomRight.y / pixelSize) + 1 
          };
          const queryRange: Rect = {
            x: gridEffectiveTopLeft.x,
            y: gridEffectiveTopLeft.y,
            width: gridEffectiveBottomRight.x - gridEffectiveTopLeft.x,
            height: gridEffectiveBottomRight.y - gridEffectiveTopLeft.y,
          };
          visiblePixelsRef.current = quadtreeRef.current.query(queryRange);
        }
        lastUpdate = now;
      }
      animationFrameId = requestAnimationFrame(updateLoop);
    };
    updateLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [offset, scale, viewport]);  

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }
    glRef.current = gl;
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    programRef.current = program;
    gl.useProgram(program);
    const vao = gl.createVertexArray();
    vaoRef.current = vao;
    gl.bindVertexArray(vao);
    const vertices = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    vertexBufferRef.current = vertexBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const a_vertex = gl.getAttribLocation(program, 'a_vertex');
    gl.enableVertexAttribArray(a_vertex);
    gl.vertexAttribPointer(a_vertex, 2, gl.FLOAT, false, 0, 0);
    const instanceBuffer = gl.createBuffer();
    instanceBufferRef.current = instanceBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
    const a_offset = gl.getAttribLocation(program, 'a_offset');
    gl.enableVertexAttribArray(a_offset);
    gl.vertexAttribPointer(a_offset, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(a_offset, 1);
    const colorBuffer = gl.createBuffer();
    colorBufferRef.current = colorBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
    const a_color = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(a_color);
    gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(a_color, 1);
    gl.bindVertexArray(null);
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;
    const tick = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpaceDown(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpaceDown(false);
        setIsPanning(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const flushUpdateQueue = () => {
    if (Object.keys(updateQueueRef.current).length > 0) {
      update(dbRef(db, 'canvas'), updateQueueRef.current);
      updateQueueRef.current = {};
    }
  };

  const handleCanvasClickInternal = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpaceDown) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - offset.x) / scale;
    const worldY = (mouseY - offset.y) / scale;
    const gridX = Math.floor(worldX / pixelSize);
    const gridY = Math.floor(worldY / pixelSize);
    const pixelKey = `${gridX}_${gridY}`;
    const newColorIndex = isEraserSelected ? colors.indexOf('#ffffff') : selectedColor;

    const now = Date.now();
    if (pixelDebounceRef.current[pixelKey] && now - pixelDebounceRef.current[pixelKey] < debounceTime) {
      return;
    }
    pixelDebounceRef.current[pixelKey] = now;

    setPixels(prev => ({ ...prev, [pixelKey]: { x: gridX, y: gridY, color: newColorIndex, placedBy: "anon" } }));

    if (quadtreeRef.current) {
      const newPixel: Pixel = { x: gridX, y: gridY, color: colors[newColorIndex] || '#000000' };
      if (rectContains(quadtreeRef.current.boundary, newPixel)) {
        quadtreeRef.current.insert(newPixel);
      }
      const effectiveViewportTopLeft = { x: (0 - offset.x) / scale, y: (0 - offset.y) / scale };
      const effectiveViewportBottomRight = { x: (viewport.width - offset.x) / scale, y: (viewport.height - offset.y) / scale };
      const gridEffectiveTopLeft = { x: Math.floor(effectiveViewportTopLeft.x / pixelSize), y: Math.floor(effectiveViewportTopLeft.y / pixelSize) };
      const gridEffectiveBottomRight = { x: Math.floor(effectiveViewportBottomRight.x / pixelSize), y: Math.floor(effectiveViewportBottomRight.y / pixelSize) };
      const queryRange: Rect = {
        x: gridEffectiveTopLeft.x,
        y: gridEffectiveTopLeft.y,
        width: gridEffectiveBottomRight.x - gridEffectiveTopLeft.x,
        height: gridEffectiveBottomRight.y - gridEffectiveTopLeft.y,
      };
      visiblePixelsRef.current = quadtreeRef.current.query(queryRange);
    }

    updateQueueRef.current[pixelKey] = { x: gridX, y: gridY, color: newColorIndex, placedBy: "anon" };

    if (Object.keys(updateQueueRef.current).length >= maxQueueSize) {
      flushUpdateQueue();
    } else if (!updateTimeoutRef.current) {
      updateTimeoutRef.current = setTimeout(() => {
        flushUpdateQueue();
        updateTimeoutRef.current = null;
      }, 100);
    }
  };

  const throttledHandleCanvasClick = useCallback(throttle(handleCanvasClickInternal, 20), [
    offset, scale, viewport, isSpaceDown, isEraserSelected, selectedColor
  ]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 && isSpaceDown) {
      setIsPanning(true);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setMouseWorld({ x: (mouseX - offset.x) / scale, y: (mouseY - offset.y) / scale });
      setIsHovering(true);
    }
    if (isPanning && lastMousePosRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      setIsPanning(false);
      lastMousePosRef.current = null;
    }
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const zoomFactor = 1.1;
    let newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    newScale = Math.max(0.3, Math.min(5, newScale));
    const scaleRatio = newScale / scale;
    setScale(newScale);
    setOffset({
      x: mouseX - scaleRatio * (mouseX - offset.x),
      y: mouseY - scaleRatio * (mouseY - offset.y)
    });
  }, [scale, offset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const lastFrameTimeRef = useRef(0);
  useEffect(() => {
    if (!overlayCanvasRef.current) return;
    const ctx = overlayCanvasRef.current.getContext('2d');
    if (!ctx) return;
    const now = performance.now();
    if (now - lastFrameTimeRef.current < 16.67) return;
    lastFrameTimeRef.current = now;
  
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    if (!isHovering) return;
  
    const gridX = Math.floor(mouseWorld.x / pixelSize);
    const gridY = Math.floor(mouseWorld.y / pixelSize);
    const x = offset.x + scale * (gridX * pixelSize);
    const y = offset.y + scale * (gridY * pixelSize);
    const size = scale * pixelSize;
  
    ctx.save();
  
    const borderColor = 'rgba(0, 120, 255, 0.8)';
    const lineWidth = 3 * scale;
    const shadowBlur = 10 * scale;
    const halfLineWidth = lineWidth / 2;
  
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = shadowBlur;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x + halfLineWidth, y + halfLineWidth, size - lineWidth, size - lineWidth);
  
    ctx.restore();
  }, [mouseWorld, offset, scale, viewport, isHovering]);
  

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;
    gl.viewport(0, 0, viewport.width, viewport.height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vaoRef.current);
    const u_offset = gl.getUniformLocation(program, 'u_offset');
    const u_scale = gl.getUniformLocation(program, 'u_scale');
    const u_resolution = gl.getUniformLocation(program, 'u_resolution');
    const u_pixelSize = gl.getUniformLocation(program, 'u_pixelSize');
    gl.uniform2f(u_offset, offset.x, offset.y);
    gl.uniform1f(u_scale, scale);
    gl.uniform2f(u_resolution, viewport.width, viewport.height);
    gl.uniform1f(u_pixelSize, pixelSize);
    const visiblePixels = visiblePixelsRef.current;
    const offsets = new Float32Array(visiblePixels.length * 2);
    const colorsArray = new Float32Array(visiblePixels.length * 3);
    visiblePixels.forEach((p, i) => {
      offsets[i * 2] = p.x * pixelSize;
      offsets[i * 2 + 1] = p.y * pixelSize;
      const [r, g, b] = hexToRGB(p.color);
      colorsArray[i * 3] = r;
      colorsArray[i * 3 + 1] = g;
      colorsArray[i * 3 + 2] = b;
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBufferRef.current);
    if (offsets.byteLength === instanceBufferSizeRef.current) {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, offsets);
    } else {
      gl.bufferData(gl.ARRAY_BUFFER, offsets, gl.DYNAMIC_DRAW);
      instanceBufferSizeRef.current = offsets.byteLength;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferRef.current);
    if (colorsArray.byteLength === colorBufferSizeRef.current) {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, colorsArray);
    } else {
      gl.bufferData(gl.ARRAY_BUFFER, colorsArray, gl.DYNAMIC_DRAW);
      colorBufferSizeRef.current = colorsArray.byteLength;
    }
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, visiblePixels.length);
    gl.bindVertexArray(null);
  }, [offset, scale, viewport]);

  useEffect(() => {
    let animationFrameId: number;
    const renderLoop = () => {
      render();
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [render]);

  return (
    <div className="relative overflow-hidden">
      <canvas
        ref={canvasRef}
        width={viewport.width}
        height={viewport.height}
        onClick={throttledHandleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={(e) => {
          setIsHovering(false);
          handleMouseUp(e);
        }}
        className={isPanning ? 'cursor-grabbing bg-white' : 'cursor-crosshair bg-white'}
      />
      <canvas
        ref={overlayCanvasRef}
        width={viewport.width}
        height={viewport.height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Coordinate and Zoom Display */}
      <div className="absolute top-12 right-6 bg-opacity-70 p-4 rounded-xl text-zinc-800 text-sm space-y-2 backdrop-blur-md">
        <p className="flex items-center">
          <span className="font-bold mr-1">Coordinates:</span>
          <span>
            X: {Math.floor(mouseWorld.x / pixelSize)}, Y: {Math.floor(mouseWorld.y / pixelSize)}
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
                : fps < 30
                ? "text-red-500"
                : "text-red-800"
            }`}
          >
            {fps}
          </span>
        </p>
      </div>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-opacity-70 p-4 rounded-xl text-white text-sm space-y-2 backdrop-blur-md max-w-full shadow-lg z-10">
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(2.5rem,_1fr))] gap-2 justify-center items-center" style={{ maxWidth: "90vw" }}>
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
                  boxShadow: index === selectedColor ? "0px 0px 10px 2px rgba(59, 130, 246, 0.8)" : "none",
                }}
                onClick={() => {
                  setSelectedColor(index);
                  setIsEraserSelected(false);
                }}
                aria-label={`Select color ${color}`}
              />
            </div>
          ))}
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
              <img src="/eraser.png" alt="Eraser" className={`w-8 h-8 transition-transform ${isEraserSelected ? "scale-110" : "hover:scale-110"}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasASynC;