import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  FaGamepad,
  FaTools,
  FaBook,
  FaGlobe,
  FaBrain,
} from 'react-icons/fa';

interface LinkItem {
  to: string;
  title: string;
  description: string;
}

interface Category {
  name: string;
  icon: JSX.Element;
  links: LinkItem[];
}

const categories: Category[] = [
  {
    name: 'General',
    icon: <FaGlobe className="text-4xl text-blue-400 mb-2" />,
    links: [
      { to: '/', title: 'Home', description: 'Go back to the homepage' },
      { to: '/ASynC', title: 'ASynC', description: 'Art Synchronized Canvas - Drawing Canvas' },
    ],
  },
  {
    name: 'Games',
    icon: <FaGamepad className="text-4xl text-green-400 mb-2" />,
    links: [
      { to: '/games/tetris', title: 'Tetris Game', description: 'Play Tetris - STYLING WIP' },
      { to: '/games/sudoku', title: 'Sudoku Game', description: 'Play Sudoku - STYLING WIP' },
      { to: '/games/2048', title: '2048 Game', description: 'Play 2048' },
    ],
  },
  {
    name: 'Tools',
    icon: <FaTools className="text-4xl text-yellow-400 mb-2" />,
    links: [
      { to: '/cdata', title: 'Car Database', description: 'Check out the car database' },
      { to: '/imedit', title: 'Image Editor', description: 'Edit images easily' },
      { to: '/discord', title: 'Discord Profile Fetcher', description: 'Fetch Discord profiles' },
    ],
  },
  {
    name: 'Notes',
    icon: <FaBook className="text-4xl text-red-400 mb-2" />,
    links: [
      { to: '/deminotes', title: 'Demi Notes', description: 'Your notes organized - STYLING WIP' },
      { to: '/dn', title: 'Notes Editor', description: 'Create and edit notes' },
    ],
  },
  {
    name: 'Other',
    icon: <FaBrain className="text-4xl text-purple-400 mb-2" />,
    links: [
      { to: '/', title: 'WIP', description: 'Work In Progress' },
    ],
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
};

const AllLinks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-color to-secondary-color text-white flex flex-col py-16 px-8">
      <div className="container mx-auto">
        <motion.h1
          className="text-5xl font-extrabold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-accent-color to-accent-color-light"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          All Links
        </motion.h1>
        {categories.map((category, catIdx) => (
          <section key={category.name} className="mb-12">
            <motion.div
              className="flex items-center mb-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: catIdx * 0.1, duration: 0.5 }}
            >
              {category.icon}
              <h2 className="text-3xl font-bold border-b border-gray-700 pb-2 ml-3">
                {category.name}
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.links.map((link, linkIdx) => (
                <motion.div
                  key={link.to}
                  custom={linkIdx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    to={link.to}
                    className="relative p-6 bg-tertiary-color rounded-lg shadow-lg hover:bg-quaternary-color transition-all flex justify-between items-center transform hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="text-left">
                      <h3 className="text-2xl font-semibold mb-1">{link.title}</h3>
                      <p className="text-gray-400">{link.description}</p>
                    </div>
                    <ChevronRight className="text-gray-400" size={32} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AllLinks;