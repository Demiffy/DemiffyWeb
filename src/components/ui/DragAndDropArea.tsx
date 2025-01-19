import React, { DragEvent, ChangeEvent, KeyboardEvent, MouseEvent, RefObject } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';

interface DragAndDropAreaProps {
  isDragging?: boolean;
  supportedInputFormats: string[];
  fileInputRef: RefObject<HTMLInputElement>;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  text: string;
}

const DragAndDropArea: React.FC<DragAndDropAreaProps> = ({
  isDragging = false,
  supportedInputFormats,
  fileInputRef,
  onClick,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onFileChange,
  onKeyDown,
  text,
}) => {
  const acceptString = supportedInputFormats.includes('image/*')
    ? 'image/*'
    : supportedInputFormats.map((fmt) => `.${fmt}`).join(', ');

  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      aria-label="File Upload Area"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={`flex flex-col items-center justify-center w-full lg:w-1/3 h-64 p-6 border-2 border-dashed rounded transition-colors duration-200 cursor-pointer ${
        isDragging
          ? 'border-blue-400 bg-black'
          : 'border-gray-500 bg-primary-color hover:bg-tertiary-color'
      }`}
    >
      <ArrowDownTrayIcon className="h-12 w-12 text-accent-color mb-4" />
      <p className="text-center mb-4">
        {isDragging ? 'Release to upload your files' : text}
      </p>
      <input
        type="file"
        accept={acceptString}
        multiple
        onChange={onFileChange}
        className="hidden"
        ref={fileInputRef}
      />
    </div>
  );
};

export default DragAndDropArea;