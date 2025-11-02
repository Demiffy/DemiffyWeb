import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-secondary text-white px-6">
    <div
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),transparent_65%)] opacity-70"
      aria-hidden="true"
    />
    <div className="relative flex flex-col items-center">
      <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl">404</h1>
      <p className="mt-3 text-base text-gray-300 sm:text-lg">This page went missing.</p>
      <Link
        to="/"
        className="mt-8 rounded-full border border-white/10 px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-gray-200 transition hover:border-accent hover:text-white"
      >
        Return Home
      </Link>
    </div>
  </div>
);

export default NotFound;
