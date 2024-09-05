import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-sky-500/20 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sky-400">
          {/* Demiffy */}
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-white">Demiffy</h2>
            <p className="mt-2 text-sm">&copy; 2024 Demiffy. All rights reserved.</p>
            <p className="mt-1 text-xs text-gray-400">Fly safe, code strong.</p>
          </div>

          {/* Logo */}
          <div className="my-4">
            <img
              src="/DMLogoGif.gif"
              alt="Demiffy"
              className="h-20 w-20 mx-auto"
            />
          </div>

          {/* Social Media */}
          <div className="flex space-x-4">
            <a href="https://github.com/Demiffy" className="text-sky-400 hover:text-white transition-colors">
              <FaGithub className="h-6 w-6" />
            </a>
            <a href="https://www.linkedin.com/in/tom%C3%A1%C5%A1-velner-8017a8283/" className="text-sky-400 hover:text-white transition-colors">
              <FaLinkedin className="h-6 w-6" />
            </a>
            <a href="mailto:velnertomas78@gmail.com" className="text-sky-400 hover:text-white transition-colors">
              <FaEnvelope className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
