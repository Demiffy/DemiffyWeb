import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-color py-10 select-none">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-accent-color">
          {/* Demiffy */}
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-white">Demiffy</h2>
            <p className="mt-2 text-sm">&copy; {new Date().getFullYear()} Demiffy. All rights reserved</p>
            <p className="mt-1 text-xs text-gray-400">Precision engineered, from code to the clouds</p>
          </div>

          {/* Logo */}
          <div className="my-4">
          <Link to="/">
            <img
              src="/DMLogoGif.gif"
              alt="Go Home"
              className="h-20 w-20 mx-auto"
            />
          </Link>
          </div>

          {/* Social Media */}
          <div className="flex space-x-4 text-accent-color">
            <a href="https://github.com/Demiffy" className="hover:text-white transition-colors">
              <FaGithub className="h-6 w-6" />
            </a>
            <a href="https://www.linkedin.com/in/tom%C3%A1%C5%A1-velner-8017a8283/" className="hover:text-white transition-colors">
              <FaLinkedin className="h-6 w-6" />
            </a>
            <a href="mailto:velnertomas78@gmail.com" className="hover:text-white transition-colors">
              <FaEnvelope className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;