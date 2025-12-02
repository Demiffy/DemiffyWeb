import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Airplanes", href: "/spotters-log/airplanes" },
  { label: "Cars", href: "/spotters-log/cars" },
];

const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="relative flex h-16 w-full items-center border-b border-white/10 bg-secondary/85 px-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl md:px-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.08),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex w-full max-w-6xl items-center gap-8">
          <Link
            to="/"
            className="text-2xl font-bold uppercase tracking-[0.35em] text-white transition hover:text-accent"
          >
            Demiffy
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  [
                    "group relative rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition",
                    "text-gray-200 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/60",
                    isActive ? "bg-white/15 text-white shadow-inner" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full border border-white/10 opacity-0 transition group-hover:opacity-100"
                />
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
