import { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-sky-500/20 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Demiffy */}
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-bold text-sky-400 tracking-wide uppercase">Demiffy</span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex space-x-8">
          <ScrollLink
            to="about"
            smooth={true}
            duration={500}
            className="relative group text-white cursor-pointer transition-colors ease-in-out py-2"
          >
            About
            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-transparent group-hover:bg-sky-400 transition-all duration-300"></div>
          </ScrollLink>
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
            Contact
            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-transparent group-hover:bg-sky-400 transition-all duration-300"></div>
          </ScrollLink>
        </nav>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="focus:outline-none p-3 bg-slate-800 rounded-full hover:bg-sky-700 transition-colors"
            style={{ marginBottom: '10px' }}
          >
            <div className={`hamburger ${isOpen ? 'open' : ''}`}>
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-slate-900 transition-transform duration-500 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } z-40 flex flex-col items-center justify-center text-white`}
      >
        <nav className="flex space-x-8 text-center text-xl">
          <ScrollLink
            to="about"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="hover:text-sky-400 transition-colors"
          >
            Flight Log
          </ScrollLink>
          <ScrollLink
            to="skills"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="hover:text-sky-400 transition-colors"
          >
            Arsenal
          </ScrollLink>
          <ScrollLink
            to="projects"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="hover:text-sky-400 transition-colors"
          >
            Missions
          </ScrollLink>
          <ScrollLink
            to="contact"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="hover:text-sky-400 transition-colors"
          >
            Comms
          </ScrollLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
