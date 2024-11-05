import React, { useState } from 'react';

const ImageResizer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(300);
  const [height, setHeight] = useState<number>(300);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setResizedImage(imageUrl);
    }
  };

  const handleResize = () => {
    if (!selectedImage) return;

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = URL.createObjectURL(selectedImage);

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const resizedUrl = canvas.toDataURL('image/png');
        setResizedImage(resizedUrl);
      }
    };
  };

  const handleDownload = () => {
    if (!resizedImage) return;

    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = 'resized-image.png';
    link.click();
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Image Resizer</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
      {selectedImage && (
        <div className="mb-4">
          <label className="block mb-2">Width (px):</label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="border p-2 w-full mb-4"
          />

          <label className="block mb-2">Height (px):</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="border p-2 w-full mb-4"
          />

          <button
            onClick={handleResize}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition duration-200"
          >
            Resize Image
          </button>
        </div>
      )}

      {resizedImage && (
        <div className="mt-4">
          <img src={resizedImage} alt="Resized" className="mb-4 max-w-full h-auto" />
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition duration-200"
          >
            Download Resized Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageResizer;
