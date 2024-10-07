import { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-sky-500/20 shadow-lg select-none">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <RouterLink to="/">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-sky-400 tracking-wide uppercase">
              Demiffy
            </span>
          </div>
        </RouterLink>

        {/* Desktop Links */}
        <nav className="hidden md:flex space-x-8">
          <RouterLink
            to="/about"
            className="relative group text-white cursor-pointer transition-colors ease-in-out py-2"
          >
            About
            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-transparent group-hover:bg-sky-400 transition-all duration-300"></div>
          </RouterLink>

          <ScrollLink
            to="skills"
            smooth={true}
            duration={500}
            className="relative group text-white cursor-pointer transition-colors ease-in-out py-2"
          >
            Skills
            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-transparent group-hover:bg-sky-400 transition-all duration-300"></div>
          </ScrollLink>
          <ScrollLink
            to="projects"
            smooth={true}
            duration={500}
            className="relative group text-white cursor-pointer transition-colors ease-in-out py-2"
          >
            Projects
            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-transparent group-hover:bg-sky-400 transition-all duration-300"></div>
          </ScrollLink>
          <ScrollLink
            to="contact"
            smooth={true}
            duration={500}
            className="relative group text-white cursor-pointer transition-colors ease-in-out py-2"
          >
            Notes
            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-transparent group-hover:bg-sky-400 transition-all duration-300"></div>
          </ScrollLink>
        </nav>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 bg-transparent hover:bg-slate-700 text-white rounded-full focus:outline-none"
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 transition-transform transform rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {/* Close Icon */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {/* Hamburger Icon */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <nav className="bg-slate-900/95 backdrop-blur-lg border-t border-sky-500/20 shadow-lg">
              <ul className="flex flex-col items-center space-y-4 py-6">
                <RouterLink
                  to="/about"
                  onClick={toggleMenu}
                  className="text-white text-lg hover:text-sky-400 transition-colors"
                >
                  About
                </RouterLink>
                <ScrollLink
                  to="skills"
                  smooth={true}
                  duration={500}
                  onClick={toggleMenu}
                  className="text-white text-lg hover:text-sky-400 transition-colors"
                >
                  Skills
                </ScrollLink>
                <ScrollLink
                  to="projects"
                  smooth={true}
                  duration={500}
                  onClick={toggleMenu}
                  className="text-white text-lg hover:text-sky-400 transition-colors"
                >
                  Projects
                </ScrollLink>
                <ScrollLink
                  to="contact"
                  smooth={true}
                  duration={500}
                  onClick={toggleMenu}
                  className="text-white text-lg hover:text-sky-400 transition-colors"
                >
                  Notes
                </ScrollLink>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
