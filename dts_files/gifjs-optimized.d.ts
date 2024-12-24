// src/dts_files/gifjs-optimized.d.ts

declare module 'gif.js.optimized' {
    import { EventEmitter } from 'events';
  
    interface GIFOptions {
      workers?: number;
      quality?: number;
      workerScript?: string;
      width?: number;
      height?: number;
      repeat?: number;
      transparent?: string | number;
      background?: string;
      debug?: boolean;
    }
  
    interface AddFrameOptions {
      delay?: number;
      copy?: boolean;
      dispose?: number;
    }
  
    class GIF extends EventEmitter {
      constructor(options?: GIFOptions);
      addFrame(
        image: CanvasImageSource | CanvasRenderingContext2D | HTMLCanvasElement,
        options?: AddFrameOptions
      ): void;
      render(): void;
      on(event: 'finished', listener: (blob: Blob) => void): this;
      on(event: 'progress', listener: (progress: number) => void): this;
      on(event: 'start' | 'abort' | 'finished', listener: () => void): this;
      on(event: 'error', listener: (error: ErrorEvent) => void): this;
    }
  
    export default GIF;
  }