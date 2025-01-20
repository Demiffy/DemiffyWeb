import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import DragAndDropArea from './ui/DragAndDropArea';
import GIF from 'gif.js.optimized';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableItem } from './ui/SortableItem';

interface ImageData {
  id: string;
  file: File;
  dataUrl: string;
  error: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const GifMaker: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [globalError, setGlobalError] = useState<string>('');
  const [gifUrl, setGifUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [frameDelay, setFrameDelay] = useState<number>(500);
  const [gifWidth, setGifWidth] = useState<number>(500);
  const [gifHeight, setGifHeight] = useState<number>(500);
  const [autoSizeGif, setAutoSizeGif] = useState<boolean>(true);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [loopCount, setLoopCount] = useState<number>(0);
  const [reverseFrames, setReverseFrames] = useState<boolean>(false);
  const [gifQuality, setGifQuality] = useState<number>(10);
  const [progress, setProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supportedFormats = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];

  useEffect(() => {
    return () => {
      if (gifUrl) {
        URL.revokeObjectURL(gifUrl);
      }
    };
  }, [gifUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setGlobalError('');
    const files = e.target.files;
    if (files) {
      const filePromises = Array.from(files).map((file) => {
        return new Promise<ImageData>((resolve) => {
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          if (!fileExtension || !supportedFormats.includes(fileExtension)) {
            resolve({
              id: `${file.name}-${Date.now()}`,
              file,
              dataUrl: '',
              error: 'Unsupported file format.',
            });
            return;
          }
          if (file.size > MAX_FILE_SIZE) {
            resolve({
              id: `${file.name}-${Date.now()}`,
              file,
              dataUrl: '',
              error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
            });
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: `${file.name}-${Date.now()}`,
              file,
              dataUrl: reader.result as string,
              error: '',
            });
          };
          reader.onerror = () => {
            resolve({
              id: `${file.name}-${Date.now()}`,
              file,
              dataUrl: '',
              error: 'Failed to read file.',
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then((imagesArray) => {
        setSelectedImages((prev) => [...prev, ...imagesArray]);
      });
    }
  };

  const handleUploadAreaClick = (): void => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number): void => {
    setSelectedImages((prev) => {
      const newArray = [...prev];
      newArray.splice(index, 1);
      return newArray;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSelectedImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const generateGif = (): void => {
    if (selectedImages.length === 0) {
      setGlobalError('Please add at least one image to create a GIF.');
      return;
    }

    setIsGenerating(true);
    setGifUrl('');
    setGlobalError('');
    setProgress(0);

    let finalGifWidth = gifWidth;
    let finalGifHeight = gifHeight;

    if (autoSizeGif) {
      const dimensionsPromises = selectedImages.map((imageData) => {
        return new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = () => reject('Failed to load image');
          img.src = imageData.dataUrl;
        });
      });

      Promise.all(dimensionsPromises)
        .then((dimensions) => {
          finalGifWidth = Math.max(...dimensions.map((d) => d.width));
          finalGifHeight = Math.max(...dimensions.map((d) => d.height));
          proceedWithGifGeneration(finalGifWidth, finalGifHeight);
        })
        .catch(() => {
          setGlobalError('Failed to load one or more images.');
          setIsGenerating(false);
          setProgress(0);
        });
    } else {
      proceedWithGifGeneration(finalGifWidth, finalGifHeight);
    }
  };

  const proceedWithGifGeneration = (finalGifWidth: number, finalGifHeight: number) => {
    const gif = new GIF({
      workers: 2,
      quality: gifQuality,
      workerScript: '/gif.worker.js',
      width: finalGifWidth,
      height: finalGifHeight,
      repeat: loopCount === 0 ? 0 : loopCount - 1,
    });

    let loadedImages = 0;
    const totalImages = selectedImages.length;
    const imagesToProcess = reverseFrames ? [...selectedImages].reverse() : selectedImages;

    imagesToProcess.forEach((imageData) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageData.dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = finalGifWidth;
        canvas.height = finalGifHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          let targetWidth = finalGifWidth;
          let targetHeight = finalGifHeight;
          let offsetX = 0;
          let offsetY = 0;

          if (keepAspectRatio) {
            const aspectRatio = img.width / img.height;
            if (img.width > img.height) {
              targetWidth = finalGifWidth;
              targetHeight = finalGifWidth / aspectRatio;
              if (targetHeight > finalGifHeight) {
                targetHeight = finalGifHeight;
                targetWidth = finalGifHeight * aspectRatio;
              }
            } else {
              targetHeight = finalGifHeight;
              targetWidth = finalGifHeight * aspectRatio;
              if (targetWidth > finalGifWidth) {
                targetWidth = finalGifWidth;
                targetHeight = finalGifWidth / aspectRatio;
              }
            }
            offsetX = (finalGifWidth - targetWidth) / 2;
            offsetY = (finalGifHeight - targetHeight) / 2;
          }

          ctx.fillStyle = 'transparent';
          ctx.fillRect(0, 0, finalGifWidth, finalGifHeight);
          ctx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight);
          gif.addFrame(canvas, { delay: frameDelay, copy: true });
        }
        loadedImages++;
        setProgress(Math.round((loadedImages / totalImages) * 50));

        if (loadedImages === totalImages) {
          gif.render();
        }
      };
      img.onerror = () => {
        setGlobalError('Failed to load one or more images.');
        setIsGenerating(false);
        setProgress(0);
      };
    });

    gif.on('progress', (p: number) => {
      const renderProgress = p * 50;
      setProgress(Math.round(50 + renderProgress));
    });

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      setIsGenerating(false);
      setProgress(100);
    });

    gif.on('error', () => {
      setGlobalError('Failed to generate GIF.');
      setIsGenerating(false);
      setProgress(0);
    });
  };

  const handleFrameDelayChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFrameDelay(parseInt(e.target.value, 10));
  };

  const handleGifWidthChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setGifWidth(parseInt(e.target.value, 10));
  };

  const handleGifHeightChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setGifHeight(parseInt(e.target.value, 10));
  };

  const handleLoopCountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setLoopCount(parseInt(e.target.value, 10));
  };

  const handleReverseFramesChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setReverseFrames(e.target.checked);
  };

  const handleGifQualityChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setGifQuality(parseInt(e.target.value, 10));
  };

  const handleAutoSizeGifChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAutoSizeGif(e.target.checked);
  };

  const handleKeepAspectRatioChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setKeepAspectRatio(e.target.checked);
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-5 text-white">
      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept={supportedFormats.join(',')}
      />

      {selectedImages.length === 0 ? (
        <DragAndDropArea
          isDragging={false}
          supportedInputFormats={supportedFormats}
          fileInputRef={fileInputRef}
          onClick={handleUploadAreaClick}
          onDragOver={() => {}}
          onDragEnter={() => {}}
          onDragLeave={() => {}}
          onDrop={() => {}}
          onFileChange={handleFileChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          text="Drag and drop images here, or click to select files"
        />
      ) : (
        <div className="w-full max-w-7xl space-y-6">
          <section className="w-full bg-primary-color p-6 rounded shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Frame Delay */}
              <div>
                <label htmlFor="frameDelay" className="block mb-2 text-sm font-medium">
                  Frame Delay (ms)
                </label>
                <input
                  type="number"
                  id="frameDelay"
                  value={frameDelay}
                  onChange={handleFrameDelayChange}
                  className="w-full p-2 bg-tertiary-color border border-accent-color rounded text-white"
                  min={20}
                />
              </div>

              {/* Loop Count */}
              <div>
                <label htmlFor="loopCount" className="block mb-2 text-sm font-medium">
                  Loop Count (0 for infinite)
                </label>
                <input
                  type="number"
                  id="loopCount"
                  value={loopCount}
                  onChange={handleLoopCountChange}
                  className="w-full p-2 bg-tertiary-color border border-accent-color rounded text-white"
                  min={0}
                />
              </div>

              {/* GIF Quality */}
              <div>
                <label htmlFor="gifQuality" className="block mb-2 text-sm font-medium">
                  GIF Quality (1 best - 30 worst)
                </label>
                <input
                  type="number"
                  id="gifQuality"
                  value={gifQuality}
                  onChange={handleGifQualityChange}
                  className="w-full p-2 bg-tertiary-color border border-accent-color rounded text-white"
                  min={1}
                  max={30}
                />
              </div>

              {/* Reverse Frames */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="reverseFrames"
                  checked={reverseFrames}
                  onChange={handleReverseFramesChange}
                  className="mr-2"
                />
                <label htmlFor="reverseFrames" className="text-sm font-medium">
                  Reverse Frames
                </label>
              </div>

              {/* Auto Size GIF */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="autoSizeGif"
                  checked={autoSizeGif}
                  onChange={handleAutoSizeGifChange}
                  className="mr-2"
                />
                <label htmlFor="autoSizeGif" className="text-sm font-medium">
                  Auto Size GIF
                </label>
              </div>

              {/* Keep Aspect Ratio */}
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="keepAspectRatio"
                  checked={keepAspectRatio}
                  onChange={handleKeepAspectRatioChange}
                  className="mr-2"
                />
                <label htmlFor="keepAspectRatio" className="text-sm font-medium">
                  Keep Aspect Ratio
                </label>
              </div>

              {/* GIF Dimensions (conditional) */}
              {!autoSizeGif && (
                <>
                  <div>
                    <label htmlFor="gifWidth" className="block mb-2 text-sm font-medium">
                      GIF Width (px)
                    </label>
                    <input
                      type="number"
                      id="gifWidth"
                      value={gifWidth}
                      onChange={handleGifWidthChange}
                      className="w-full p-2 bg-tertiary-color border border-accent-color rounded text-white"
                      min={1}
                    />
                  </div>
                  <div>
                    <label htmlFor="gifHeight" className="block mb-2 text-sm font-medium">
                      GIF Height (px)
                    </label>
                    <input
                      type="number"
                      id="gifHeight"
                      value={gifHeight}
                      onChange={handleGifHeightChange}
                      className="w-full p-2 bg-tertiary-color border border-accent-color rounded text-white"
                      min={1}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Progress Indicator */}
            {isGenerating && (
              <div className="mt-6">
                <label htmlFor="progress" className="block mb-2 text-sm font-medium">
                  Generating GIF: {progress}%
                </label>
                <div className="w-full bg-gray-600 rounded h-4">
                  <div
                    className="bg-blue-500 h-4 rounded"
                    style={{ width: `${progress}%`, transition: 'width 0.3s' }}
                  ></div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            {selectedImages.length > 0 && (
              <button
                onClick={generateGif}
                disabled={isGenerating}
                className={`w-full py-2 px-4 mt-6 bg-blue-600 text-white rounded ${
                  isGenerating
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-700 transition-colors duration-200'
                }`}
              >
                {isGenerating ? 'Generating GIF...' : 'Generate GIF'}
              </button>
            )}
          </section>

          {/* Global Error */}
          {globalError && <p className="text-red-400 mt-4">{globalError}</p>}

          {/* Selected Images List */}
          {selectedImages.length > 0 && (
            <div className="w-full mt-6" style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden' }}>
              <h3 className="text-xl font-semibold mb-2">Selected Images:</h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedImages.map(image => image.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="flex flex-col space-y-4 p-2">
                    {selectedImages.map((imageData, index) => (
                      <SortableItem key={imageData.id} id={imageData.id}>
                        <li className="relative bg-primary-color p-2 rounded flex flex-col items-center">
                          <img
                            src={imageData.dataUrl}
                            alt={`Selected ${index}`}
                            className="rounded mb-2"
                            style={{ width: '500px', height: '200px', objectFit: 'contain' }}
                          />
                          {imageData.error && (
                            <p className="text-red-400 text-sm">{imageData.error}</p>
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-transparent hover:bg-slate-700 text-white rounded-full"
                            title="Remove Image"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      </SortableItem>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* GIF Preview */}
          {gifUrl && (
            <div className="w-full mt-6">
              <h3 className="text-2xl font-semibold mb-4 text-center">Generated GIF:</h3>
              <div className="bg-primary-color p-4 rounded shadow-md flex flex-col items-center">
                <img
                  src={gifUrl}
                  alt="Generated GIF"
                  className="w-full h-auto mb-4 rounded"
                  style={{ maxWidth: '500px' }}
                />
                <a
                  href={gifUrl}
                  download={`animated.gif`}
                  className="inline-flex items-center py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download GIF
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GifMaker;