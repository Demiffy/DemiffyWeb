const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">404</h1>
        <h2 className="text-2xl font-semibold mt-4 ">Oops! Page not found.</h2>
        <p className="mt-2">The page you're looking for doesn't exist or has been moved.</p>
      </div>
    </div>
  );
};

export default NotFound;