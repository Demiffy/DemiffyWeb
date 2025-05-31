import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="w-full h-16 bg-secondary/90 flex items-center px-6 shadow-md fixed top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-accent-color tracking-wide uppercase">
        Demiffy
      </Link>
      <nav className="ml-auto">
      </nav>
    </header>
  );
};
export default Navbar;
