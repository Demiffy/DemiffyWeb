import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* Code Block Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative overflow-hidden">
          <pre className="text-sm font-mono text-gray-300 z-10 relative">
            <code>
              <span className="text-green-400">// Something went terribly wrong...</span>
              {`\n\n`}
              <span className="text-blue-400">try</span> {"{"}
              {`\n  `}
              <span className="text-yellow-400">fetch</span>(<span className="text-red-500">"{window.location.origin + location.pathname}"</span>)
              {`\n    .then(`}
              <span className="text-blue-400">response</span> {"=>"} {"{"}
              {`\n      if (!response.ok) {\n`}
              {`        throw new Error(`}
              <span className="text-red-500">"404: Page not found"</span>
              {`);\n      }\n    });`}
              {`\n}`} {"catch (error) {"}
              {`\n  `}
              <span className="text-red-500">console.error</span>(<span className="text-purple-400">"Error: 404 - Page not found!"</span>);
              {`\n}`}
              {`\n\n`}
              <span className="text-green-400">// Redirect safely home</span>
              {`\nwindow.location.href = "/";`}
              <span className="text-blue-400 blink">|</span>
            </code>
          </pre>
        </div>

        {/* 404 Section */}
        <div className="text-center p-8">
          <h1 className="text-9xl font-bold text-red-600 drop-shadow-md">
            404
          </h1>
          <h2 className="text-2xl font-semibold mt-4 text-gray-200">
            Oops! Page not found.
          </h2>
          <p className="mt-2 text-gray-400">
            It seems the page you're looking for has vanished into the void.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes blink {
            0%, 50% {
              opacity: 1;
            }
            51%, 100% {
              opacity: 0;
            }
          }

          .blink {
            animation: blink 1s step-end infinite;
          }
        `}
      </style>
    </div>
  );
};

export default NotFound;