import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const AllLinks = () => {
  return (
    <div className="min-h-screen text-white flex flex-col justify-center items-center py-16 px-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold mb-12 text-accent-color text-center">
          All Links
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            to="/"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Home</h2>
              <p className="text-gray-400">Go back to the homepage</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/about"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">About</h2>
              <p className="text-gray-400">Learn about me</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/place"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Place</h2>
              <p className="text-gray-400">Small r/place replica</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/games/tetris"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Tetris Game</h2>
              <p className="text-gray-400">Play Tetris</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/games/sudoku"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Sudoku Game</h2>
              <p className="text-gray-400">Play Sudoku</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/games/2048"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">2048 Game</h2>
              <p className="text-gray-400">Play 2048</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/proto/sowwy"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Sowwy Proto</h2>
              <p className="text-gray-400">QwQ</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/cdata"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Car Database</h2>
              <p className="text-gray-400">Check out the car database</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/ic"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">File Converter</h2>
              <p className="text-gray-400">Convert your files easily</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/gif"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">GIF Maker</h2>
              <p className="text-gray-400">Create GIFs easily</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/img"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Image Resizer & Rotater</h2>
              <p className="text-gray-400">Resize and rotate images easily</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>

          <Link
            to="/discord"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Discord Profile Fetcher</h2>
              <p className="text-gray-400">Something here</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>
          <Link
            to="/deminotes"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Demi Notes</h2>
              <p className="text-gray-400">Something here</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>
          <Link
            to="/dn"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Notes Editor</h2>
              <p className="text-gray-400">Something here</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>
          <Link
            to="/dcars"
            className="relative p-6 bg-primary-color rounded-lg shadow-lg hover:bg-tertiary-color transition-all flex justify-between items-center"
          >
            <div className="text-left">
              <h2 className="text-2xl font-semibold">Dream Cars</h2>
              <p className="text-gray-400">Something here</p>
            </div>
            <ChevronRight className="text-gray-400" size={32} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AllLinks;