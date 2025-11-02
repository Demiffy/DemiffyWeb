// components/ui/Footer.tsx

import { Github } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-secondary/80 backdrop-blur-md">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <div
          className="absolute inset-x-12 -top-0.5 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          aria-hidden="true"
        />

        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-accent/80">
              Demiffy
            </span>
            <p className="text-sm text-gray-300 md:text-base">
              Bla bla something something for now
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 md:justify-end">
            <Link to="/privacy-policy" className="text-sm text-gray-300 transition hover:text-accent">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-gray-300 transition hover:text-accent">
              Terms of Service
            </Link>
            <a
              href="https://github.com/Demiffy"
              className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 shadow-lg transition hover:border-accent hover:text-accent"
              aria-label="Demi on GitHub"
            >
              <Github className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-center text-xs text-gray-400 md:flex-row md:justify-between md:text-left">
          <p>Copyright {year} Demiffy.com. All rights reserved.</p>
          <p className="text-[11px] text-gray-500">
            This is stupid
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
