// FileConverter.tsx

import React, { useState, ChangeEvent, DragEvent, useRef } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import DragAndDropArea from './ui/DragAndDropArea';

type SupportedFormats =
  | 'avif'
  | 'webp'
  | 'jpeg'
  | 'jpg'
  | 'jpe'
  | 'jfif'
  | 'png'
  | 'bmp'
  | 'gif'
  | 'svg'
  | 'ico';

interface FileData {
  file: File;
  convertedUrl: string;
  error: string;
  isConverting: boolean;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const FileConverter: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [outputFormat, setOutputFormat] = useState<SupportedFormats>('png');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isConversionComplete, setIsConversionComplete] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const supportedInputFormats: SupportedFormats[] = [
    'avif',
    'webp',
    'jpeg',
    'jpg',
    'jpe',
    'jfif',
    'png',
    'bmp',
    'gif',
    'svg',
    'ico',
  ];

  const outputFormatOptions = [
    { label: 'PNG', value: 'png' },
    { label: 'JPEG', value: 'jpeg' },
    { label: 'JPG', value: 'jpg' },
    { label: 'ICO', value: 'ico' },
    { label: 'WEBP', value: 'webp' },
    { label: 'AVIF', value: 'avif' },
    { label: 'BMP', value: 'bmp' },
    { label: 'GIF', value: 'gif' },
    { label: 'SVG', value: 'svg' },
  ];

  const extensionToMimeType: { [key in SupportedFormats]: string } = {
    avif: 'image/avif',
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    jpe: 'image/jpeg',
    jfif: 'image/jpeg',
    png: 'image/png',
    bmp: 'image/bmp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
  };

  const outputExtensionMapping: { [key in SupportedFormats]: string } = {
    avif: 'avif',
    webp: 'webp',
    jpeg: 'jpeg',
    jpg: 'jpg',
    jpe: 'jpe',
    jfif: 'jfif',
    png: 'png',
    bmp: 'bmp',
    gif: 'gif',
    svg: 'svg',
    ico: 'ico',
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files) {
      const filesArray: FileData[] = Array.from(files).map((file) => {
        const fileExtension = file.name
          .split('.')
          .pop()
          ?.toLowerCase() as SupportedFormats;
        if (!fileExtension || !supportedInputFormats.includes(fileExtension)) {
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

  const handleOutputFormatChange = (
    e: ChangeEvent<HTMLSelectElement>
  ): void => {
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
    const files = e.dataTransfer.files;
    if (files) {
      const filesArray: FileData[] = Array.from(files).map((file) => {
        const fileExtension = file.name
          .split('.')
          .pop()
          ?.toLowerCase() as SupportedFormats;
        if (!fileExtension || !supportedInputFormats.includes(fileExtension)) {
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

  const convertImage = async (
    fileData: FileData,
    index: number
  ): Promise<void> => {
    const { file } = fileData;

    setSelectedFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isConverting: true, error: '' } : item
      )
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
            const mimeType =
              extensionToMimeType[outputFormat] || 'image/png';

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
                        ? {
                            ...item,
                            error: 'Conversion failed.',
                            isConverting: false,
                          }
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
                  ? {
                      ...item,
                      error: 'Failed to get canvas context.',
                      isConverting: false,
                    }
                  : item
              )
            );
          }
        };
        img.onerror = () => {
          setSelectedFiles((prev) =>
            prev.map((item, i) =>
              i === index
                ? {
                    ...item,
                    error: 'Failed to load the image.',
                    isConverting: false,
                  }
                : item
            )
          );
        };
        img.src = result;
      } else {
        setSelectedFiles((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  error: 'Failed to read the file.',
                  isConverting: false,
                }
              : item
          )
        );
      }
    };
    reader.onerror = () => {
      setSelectedFiles((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                error: 'Error reading the file.',
                isConverting: false,
              }
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
    setIsConversionComplete(true);
  };

  const removeFile = (index: number): void => {
    setSelectedFiles((prev) => {
      const updatedFiles = prev.filter((_, i) => i !== index);

      if (updatedFiles.length === 0) {
        setIsConversionComplete(false);
      }

      return updatedFiles;
    });
  };

  const handleUploadAreaClick = (): void => {
    if (!isConversionComplete) {
      fileInputRef.current?.click();
    }
  };

  const setFileInputRef = (node: HTMLInputElement | null) => {
    if (fileInputRef.current !== node) {
      fileInputRef.current = node;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-5 text-white">

      {/* Hidden Input */}
      <input
        type="file"
        ref={setFileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept=".avif,.webp,.jpeg,.jpg,.jpe,.jfif,.png,.bmp,.gif,.svg,.ico"
      />

      {selectedFiles.length === 0 ? (
        <DragAndDropArea
          isDragging={isDragging}
          supportedInputFormats={supportedInputFormats}
          fileInputRef={fileInputRef}
          onClick={handleUploadAreaClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          text="Drag and drop image files here, or click to select files"
        />
      ) : (
        <div className="w-full max-w-5xl space-y-6">
          {/* Settings Panel */}
          <div className="w-full max-w-md bg-primary-color p-6 rounded-lg shadow-md mx-auto">
            <div className="mb-4">
              <label
                htmlFor="outputFormat"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Select Output Format
              </label>
              <select
                id="outputFormat"
                value={outputFormat}
                onChange={handleOutputFormatChange}
                disabled={isConversionComplete}
                className={`w-full p-2 ${
                  isConversionComplete
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-tertiary-color border-quaternary-color text-white'
                } border rounded`}
              >
                {outputFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={convertAllImages}
                disabled={selectedFiles.some(
                  (file) => file.isConverting || file.error
                )}
                className={`py-2 px-4 bg-blue-600 text-white rounded ${
                  selectedFiles.some((file) => file.isConverting || file.error)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-500'
                }`}
              >
                Convert Images
              </button>
              <button
                onClick={handleUploadAreaClick}
                disabled={isConversionComplete}
                className={`py-2 px-4 ${
                  isConversionComplete
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-orange-700 hover:bg-orange-600 text-white'
                } rounded`}
              >
                Upload More
              </button>
            </div>
          </div>

          {/* Selected Files List */}
          <div className="w-full max-w-5xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Uploaded Images:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {selectedFiles.map((fileData, index) => (
                <li
                  key={index}
                  className="relative flex flex-col items-center bg-primary-color p-3 rounded shadow"
                >
                  <p className="font-medium text-center mb-2">
                    {fileData.convertedUrl
                      ? `${fileData.file.name.substring(
                          0,
                          fileData.file.name.lastIndexOf('.')
                        )}.${outputFormat}`
                      : fileData.file.name}
                  </p>
                  {fileData.error && (
                    <p className="text-red-400 text-sm text-center">{fileData.error}</p>
                  )}
                  {fileData.isConverting && (
                    <p className="text-yellow-400 text-sm text-center">
                      Converting...
                    </p>
                  )}
                  {fileData.convertedUrl && (
                    <p className="text-green-400 text-sm text-center">
                      Conversion Complete
                    </p>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-10 right-2 p-1 bg-transparent hover:bg-tertiary-color text-red-600 rounded-full"
                    title="Remove File"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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

          {/* Converted Files Display */}
          {selectedFiles.some((file) => file.convertedUrl) && (
            <div className="w-full max-w-5xl mx-auto mt-6">
              <h3 className="text-2xl font-semibold mb-4 text-center">
                Converted Images:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedFiles.map(
                  (fileData, index) =>
                    fileData.convertedUrl && (
                      <div
                        key={index}
                        className="p-4"
                      >
                        <div className="font-medium text-center bg-primary-color rounded-t p-2">
                          {fileData.convertedUrl
                            ? `${fileData.file.name.substring(
                                0,
                                fileData.file.name.lastIndexOf('.')
                              )}.${outputFormat}`
                            : fileData.file.name}
                        </div>
                        <img
                          src={fileData.convertedUrl}
                          alt={`Converted ${fileData.file.name}`}
                          className="w-full h-auto"
                          loading="lazy"
                        />
                        <a
                          href={fileData.convertedUrl}
                          download={`${
                            fileData.file.name.substring(
                              0,
                              fileData.file.name.lastIndexOf('.')
                            )
                          }_${outputExtensionMapping[outputFormat] || outputFormat}.${
                            outputExtensionMapping[outputFormat] || outputFormat
                          }`}
                          className="inline-flex items-center justify-center w-full py-2 px-4 bg-green-600 text-white rounded-b hover:bg-green-700 transition-colors duration-200 mb-2"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                          Download {outputFormat.toUpperCase()}
                        </a>
                      </div>
                    )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileConverter;