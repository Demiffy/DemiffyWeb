// components/ui/Footer.tsx

import { Github } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-secondary py-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="flex flex-row justify-between items-center w-full px-2 text-sm text-gray-300 mb-3">
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <div className="flex gap-4">
            <a href="https://github.com/Demiffy" className="p-2 rounded-full hover:bg-white/10 transition text-gray-300" aria-label="Twitter">
              <Github size={18} />
            </a>
          </div>
          <Link to="/terms-of-service" className="hover:underline">Terms of Service</Link>
        </div>
        <div className="text-xs text-gray-400 text-center mt-2 mb-2 w-full">
          © {year} Demiffy.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
