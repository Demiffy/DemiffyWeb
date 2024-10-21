// /FileConverter.tsx

import React, { useState, ChangeEvent, DragEvent, useRef } from 'react';
import { ArrowUpTrayIcon, LinkIcon } from '@heroicons/react/24/solid';
import Footer from './ui/Footer';

type SupportedFormats = 'avif' | 'webp' | 'jpeg' | 'png' | 'bmp' | 'gif' | 'svg';

interface FileData {
  file: File;
  convertedUrl: string;
  error: string;
  isConverting: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const FileConverter: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [outputFormat, setOutputFormat] = useState<SupportedFormats>('png');
  const [globalError, setGlobalError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedInputFormats: SupportedFormats[] = ['avif', 'webp', 'jpeg', 'png', 'bmp', 'gif', 'svg'];
  const supportedOutputFormats: SupportedFormats[] = ['avif', 'webp', 'jpeg', 'png', 'bmp', 'gif'];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setGlobalError('');
    const files = e.target.files;
    if (files) {
      const filesArray: FileData[] = Array.from(files).map((file) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() as SupportedFormats;
        if (!supportedInputFormats.includes(fileExtension)) {
          return {
            file,
            convertedUrl: '',
            error: 'Unsupported file format.',
            isConverting: false,
          };
        }
        if (file.size > MAX_FILE_SIZE) {
          return {
            file,
            convertedUrl: '',
            error: 'File size exceeds 5MB limit.',
            isConverting: false,
          };
        }
        return {
          file,
          convertedUrl: '',
          error: '',
          isConverting: false,
        };
      });
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleOutputFormatChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const format = e.target.value as SupportedFormats;
    setOutputFormat(format);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setGlobalError('');
    const files = e.dataTransfer.files;
    if (files) {
      const filesArray: FileData[] = Array.from(files).map((file) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() as SupportedFormats;
        if (!supportedInputFormats.includes(fileExtension)) {
          return {
            file,
            convertedUrl: '',
            error: 'Unsupported file format.',
            isConverting: false,
          };
        }
        if (file.size > MAX_FILE_SIZE) {
          return {
            file,
            convertedUrl: '',
            error: 'File size exceeds 5MB limit.',
            isConverting: false,
          };
        }
        return {
          file,
          convertedUrl: '',
          error: '',
          isConverting: false,
        };
      });
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setImageUrl(e.target.value);
    setUrlError('');
  };

  const handleAddImageFromUrl = async (): Promise<void> => {
    if (!imageUrl) {
      setUrlError('Please enter a valid image URL.');
      return;
    }

    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error('Failed to fetch the image. Please check the URL.');
      }

      const blob = await response.blob();
      const fileExtension = blob.type.split('/')[1] as SupportedFormats;
      if (!supportedInputFormats.includes(fileExtension)) {
        setUrlError('Unsupported image format.');
        return;
      }

      if (blob.size > MAX_FILE_SIZE) {
        setUrlError('Image size exceeds 5MB limit.');
        return;
      }

      const file = new File([blob], `image_from_url.${fileExtension}`, { type: blob.type });
      const newFile: FileData = {
        file,
        convertedUrl: '',
        error: '',
        isConverting: false,
      };
      setSelectedFiles((prev) => [...prev, newFile]);
      setImageUrl('');
    } catch (error: any) {
      setUrlError(error.message || 'Failed to add image from URL.');
    }
  };

  const convertImage = async (fileData: FileData, index: number): Promise<void> => {
    const { file } = fileData;

    setSelectedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isConverting: true, error: '' } : item))
    );

    const reader = new FileReader();
    reader.onload = function (event: ProgressEvent<FileReader>) {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            let mimeType: string;
            switch (outputFormat) {
              case 'avif':
                mimeType = 'image/avif';
                break;
              case 'webp':
                mimeType = 'image/webp';
                break;
              case 'jpeg':
                mimeType = 'image/jpeg';
                break;
              case 'bmp':
                mimeType = 'image/bmp';
                break;
              case 'gif':
                mimeType = 'image/gif';
                break;
              case 'png':
              default:
                mimeType = 'image/png';
                break;
            }

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  setSelectedFiles((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? { ...item, convertedUrl: url, isConverting: false }
                        : item
                    )
                  );
                } else {
                  setSelectedFiles((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? { ...item, error: 'Conversion failed.', isConverting: false }
                        : item
                    )
                  );
                }
              },
              mimeType,
              1
            );
          } else {
            setSelectedFiles((prev) =>
              prev.map((item, i) =>
                i === index
                  ? { ...item, error: 'Failed to get canvas context.', isConverting: false }
                  : item
              )
            );
          }
        };
        img.onerror = () => {
          setSelectedFiles((prev) =>
            prev.map((item, i) =>
              i === index
                ? { ...item, error: 'Failed to load the image.', isConverting: false }
                : item
            )
          );
        };
        img.src = result;
      } else {
        setSelectedFiles((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, error: 'Failed to read the file.', isConverting: false }
              : item
          )
        );
      }
    };
    reader.onerror = () => {
      setSelectedFiles((prev) =>
        prev.map((item, i) =>
          i === index
            ? { ...item, error: 'Error reading the file.', isConverting: false }
            : item
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const convertAllImages = (): void => {
    selectedFiles.forEach((fileData, index) => {
      if (!fileData.error && !fileData.convertedUrl && !fileData.isConverting) {
        convertImage(fileData, index);
      }
    });
  };

  const removeFile = (index: number): void => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAreaClick = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen text-white">
      <section className="min-h-screen flex flex-col items-center text-white p-12">
        <h2 className="text-3xl font-bold mb-6">IMG Converter</h2>
  
        <div className="flex flex-col lg:flex-row w-full max-w-5xl space-y-6 lg:space-y-0 lg:space-x-6">
          {/* Drag and Drop Area */}
          <div
            onClick={handleUploadAreaClick}
            onDragOverCapture={handleDragOver}
            onDragEnterCapture={handleDragEnter}
            onDragLeaveCapture={handleDragLeave}
            onDropCapture={handleDrop}
            role="button"
            aria-label="File Upload Area"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            className={`flex flex-col items-center justify-center w-full lg:w-1/2 h-64 p-6 border-2 border-dashed rounded transition-colors duration-200 cursor-pointer ${
              isDragging
                ? 'border-blue-400 bg-gray-600'
                : 'border-gray-500 bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <ArrowUpTrayIcon className="h-12 w-12 text-blue-400 mb-4" />
            <p className="text-center mb-4">
              {isDragging
                ? 'Release to upload your files'
                : 'Drag and drop image files here, or click to select files.'}
            </p>
            <input
              type="file"
              accept={supportedInputFormats.map((fmt) => `.${fmt}`).join(', ')}
              multiple
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
          </div>
  
          {/* Output Format Selection and Convert Button */}
          <div className="flex flex-col w-full lg:w-1/2 space-y-4">
            <div className="bg-gray-700 p-6 rounded shadow-md">
              <label htmlFor="outputFormat" className="block mb-2 text-sm font-medium">
                Select Output Format
              </label>
              <select
                id="outputFormat"
                value={outputFormat}
                onChange={handleOutputFormatChange}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white"
              >
                {supportedOutputFormats.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Add Image from URL */}
            <div className="bg-gray-700 p-6 rounded shadow-md flex flex-col">
              <label htmlFor="imageUrl" className="block mb-2 text-sm font-medium">
                Add Image from URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="Enter image URL"
                  className="flex-grow p-2 bg-gray-600 border border-gray-500 rounded-l text-white focus:outline-none"
                />
                <button
                  onClick={handleAddImageFromUrl}
                  className="py-2 px-4 bg-green-600 text-white rounded-l hover:bg-green-700 transition-colors duration-200 flex items-center"
                >
                  <LinkIcon className="h-5 w-5 mr-2" />
                  Add
                </button>
              </div>
              {urlError && <p className="text-red-400 mt-2">{urlError}</p>}
            </div>
  
            {/* Convert Button */}
            {selectedFiles.length > 0 && (
              <button
                onClick={convertAllImages}
                disabled={
                  selectedFiles.every((file) => file.error || file.convertedUrl) ||
                  selectedFiles.some((file) => file.isConverting)
                }
                className={`w-full py-2 px-4 bg-blue-600 text-white rounded ${
                  selectedFiles.every((file) => file.error || file.convertedUrl) ||
                  selectedFiles.some((file) => file.isConverting)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-700 transition-colors duration-200'
                }`}
              >
                Convert All Images
              </button>
            )}
          </div>
        </div>
  
        {/* Global Error */}
        {globalError && <p className="text-red-400 mb-4">{globalError}</p>}
  
        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="w-full max-w-5xl mt-6">
            <h3 className="text-xl font-semibold mb-2">Selected Files:</h3>
            <ul className="space-y-2">
              {selectedFiles.map((fileData, index) => (
                <li
                  key={index}
                  className="relative flex items-center justify-between bg-gray-700 p-3 rounded"
                >
                  <div>
                    <p className="font-medium">{fileData.file.name}</p>
                    {fileData.error && <p className="text-red-400 text-sm">{fileData.error}</p>}
                    {fileData.isConverting && <p className="text-yellow-400 text-sm">Converting...</p>}
                    {fileData.convertedUrl && <p className="text-green-400 text-sm">Conversion Complete</p>}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1.2 right-3 p-2 bg-transparent hover:bg-slate-700 text-white rounded-full"
                    style={{ zIndex: 50 }}
                    title="Remove File"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
  
        {/* Converted Files Display */}
        {selectedFiles.some((file) => file.convertedUrl) && (
          <div className="w-full max-w-5xl mt-6">
            <h3 className="text-2xl font-semibold mb-4">Converted Images:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedFiles.map((fileData, index) =>
                fileData.convertedUrl ? (
                  <div key={index} className="bg-gray-700 p-4 rounded shadow-md">
                    <img
                      src={fileData.convertedUrl}
                      alt={`Converted ${fileData.file.name}`}
                      className="w-full h-auto mb-2 rounded"
                      loading="lazy"
                    />
                    <a
                      href={fileData.convertedUrl}
                      download={`${fileData.file.name.substring(0, fileData.file.name.lastIndexOf('.'))}_${outputFormat}.${outputFormat}`}
                      className="inline-flex items-center py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                      style={{ color: 'white' }}
                    >
                      <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                      Download {outputFormat.toUpperCase()}
                    </a>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}  

export default FileConverter;