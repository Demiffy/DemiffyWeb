import React, { useState } from 'react';
import { PuzzlePieceIcon, FilmIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'; 
import ImageResizer from './ImageResizer';
import GifMaker from './GifMaker';
import FileConverter from './FileConverter';
import Footer from './ui/Footer';

enum Tab {
  RESIZER = 'Resizer',
  GIFMAKER = 'GIF Maker',
  CONVERTER = 'Image Converter',
}

const tabIcons: Record<Tab, React.ReactNode> = {
  [Tab.RESIZER]: <ArrowsPointingOutIcon className="h-6 w-6 mr-2" />,
  [Tab.GIFMAKER]: <FilmIcon className="h-6 w-6 mr-2" />,
  [Tab.CONVERTER]: <PuzzlePieceIcon className="h-6 w-6 mr-2" />,
};

const tabs = Object.values(Tab);

const ImageEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  const renderActiveTab = () => {
    if (!activeTab) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <p className="text-lg max-w-2xl">
            Please choose an option above to start editing your images. Whether you need to resize, create a GIF, or convert image formats, we've got you covered.
          </p>
          <p className="text-lg font-bold text-accent-color">
            Select a tool from the navigation bar to begin
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case Tab.RESIZER:
        return <ImageResizer />;
      case Tab.GIFMAKER:
        return <GifMaker />;
      case Tab.CONVERTER:
        return <FileConverter />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      <header className="p-6">
        <h1 className="text-6xl font-extrabold text-center mb-6 drop-shadow-lg font-roboto select-none">
          IMAGE EDITOR
        </h1>
        <nav className="flex justify-center space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`
                flex items-center relative px-6 py-2 font-semibold rounded-md transition-all duration-300 select-none
                ${activeTab === tab 
                    ? 'text-blue-600 border-b-4 border-blue-600' 
                    : 'text-gray-300 hover:text-white'}
              `}
            >
              {tabIcons[tab as Tab]}
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-grow p-6">
        {renderActiveTab()}
      </main>

      <Footer />
    </div>
  );
};

export default ImageEditor;