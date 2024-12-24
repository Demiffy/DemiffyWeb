import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Technology {
  name: string;
  image?: string;
}

interface Project {
  title: string;
  description: string;
  image: string;
  details: string;
  additionalImages?: { src: string; title: string }[];
  buttons?: { label: string; onClick: () => void }[];
  technologies?: Technology[];
}

const Projects = ({ projects }: { projects: Project[] }) => {
  const [activeProject, setActiveProject] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if the device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleViewDetails = () => {
    if (isMobile) {
      // Mobile View
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${projects[activeProject]?.title ?? 'Untitled Project'}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { 
                  background-color: #1e293b; 
                  color: #e2e8f0; 
                  font-family: 'Arial', sans-serif; 
                  padding: 20px; 
                  margin: 0; 
                }
                img {
                  display: block; 
                  max-width: 100%; 
                  height: auto; 
                  margin: 0 auto; 
                  border-radius: 8px;
                }
              </style>
            </head>
            <body class="p-4 bg-slate-900 text-slate-100">
              <div class="content-container text-center space-y-4">
                <!-- Title -->
                <h1 class="text-3xl font-bold text-sky-400 select-none">
                  ${projects[activeProject]?.title ?? 'Untitled Project'}
                </h1>
  
                <!-- Main Image -->
                <img
                  src="${projects[activeProject]?.image ?? ''}"
                  alt="${projects[activeProject]?.title ?? 'Image'}"
                  class="rounded-lg shadow-md"
                />
  
                <!-- Description -->
                <p class="text-base text-gray-300 text-justify leading-relaxed">
                  ${projects[activeProject]?.details ?? 'No details available.'}
                </p>
  
                <!-- Additional Images Section -->
                ${projects[activeProject]?.additionalImages?.length ? `
                <div class="mt-6">
                  <h2 class="text-xl font-semibold text-indigo-400 mb-4 select-none">Additional Images</h2>
                  <div class="grid grid-cols-2 gap-4">
                    ${projects[activeProject]?.additionalImages
                      ?.map(
                        (img, index) => `
                        <div>
                          <a href="${img.src}" target="_blank" class="block">
                            <img src="${img.src}" alt="Image ${index + 1}" class="rounded-md hover:opacity-90 transition-opacity" />
                          </a>
                          <p class="text-sm text-gray-400 mt-2 text-center">${img.title}</p>
                        </div>
                      `
                      )
                      .join('')}
                  </div>
                </div>` : ''}
  
                <!-- Technologies Used Section -->
                ${projects[activeProject]?.technologies?.length ? `
                <div class="mt-8 select-none">
                  <h2 class="text-xl font-semibold text-sky-400 mb-4">Technologies Used</h2>
                  <ul class="list-none flex flex-wrap justify-center gap-4">
                    ${projects[activeProject]?.technologies
                      ?.map(
                        (tech) => `
                        <li class="flex items-center space-x-2">
                          ${tech.image ? `<img src="${tech.image}" alt="${tech.name}" class="w-8 h-8" />` : ''}
                          <span class="text-gray-300">${tech.name}</span>
                        </li>
                      `
                      )
                      .join('')}
                  </ul>
                </div>` : ''}
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } else {
      setIsPopupOpen(true);
    }
  };
  
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleOutsideClick = (e: any) => {
    if (e.target.id === 'popup-background') {
      handleClosePopup();
    }
  };

  return (
    <div className="container py-20 px-4 mx-auto">
      <h3 className="text-2xl font-bold text-sky-400 mb-6 text-center md:text-left select-none">Projects</h3>
      <div className="bg-slate-900 p-6 rounded-lg">
        <div className="flex flex-wrap justify-center md:justify-start mb-6">
          <div className="space-x-2 flex flex-wrap gap-2">
            {projects.map((project, index) => (
              <button
                key={index}
                onClick={() => setActiveProject(index)}
                className={`px-4 py-2 rounded-full transition-all text-sm font-semibold shadow-md select-none ${
                  activeProject === index
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:from-sky-600 hover:to-indigo-600'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {project.title}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={projects[activeProject].image}
              alt={projects[activeProject].title}
              className="w-full h-64 object-cover rounded-md"
            />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4 text-center md:text-left">
              {projects[activeProject].title}
            </h4>
            <p className="text-base text-gray-300 mb-6">
              {projects[activeProject].description}
            </p>
            <button
              onClick={handleViewDetails}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-3 rounded-lg hover:from-sky-600 hover:to-indigo-600 transition-colors select-none"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isMobile && isPopupOpen && (
          <motion.div
            id="popup-background"
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={handleOutsideClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900 p-6 rounded-lg shadow-lg max-w-4xl w-full relative overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              {/* Exit Button */}
              <button
                onClick={handleClosePopup}
                className="absolute top-3 right-3 p-2 bg-transparent hover:bg-slate-700 text-white rounded-full z-50"
                style={{ zIndex: 50 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Left: Image Section */}
                <div
                  className="grid grid-cols-2 gap-4 overflow-y-auto pr-0 md:pr-4"
                  style={{ maxHeight: '80vh', paddingBottom: '3rem' }}
                >
                  {projects[activeProject].additionalImages &&
                    projects[activeProject].additionalImages.map((img, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <a href={img.src} target="_blank" rel="noopener noreferrer">
                          <img
                            src={img.src}
                            alt={`Additional image ${index + 1}`}
                            className="w-full h-auto object-cover rounded-md hover:opacity-90 transition-opacity"
                          />
                        </a>
                        <p className="text-center text-sm text-gray-400 mt-2">{img.title}</p>
                      </div>
                    ))}
                </div>

                {/* Right: Title, Description, and Tools */}
                <div className="md:sticky md:top-0 flex-1">
                  <h3 className="text-2xl font-bold text-sky-400 mb-4 truncate max-w-full text-center md:text-left">
                    {projects[activeProject].title}
                  </h3>
                  <p className="text-base text-gray-300 mb-6">
                    {projects[activeProject].details}
                  </p>

                  {/* Tools and Technologies Used */}
                  {projects[activeProject].technologies && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-sky-400 mb-2">
                        Technologies Used:
                      </h4>
                      <ul className="list-none flex flex-wrap gap-4">
                        {projects[activeProject].technologies.map((tech, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            {tech.image && (
                              <img src={tech.image} alt={tech.name} className="w-8 h-8" />
                            )}
                            <span className="text-gray-300">{tech.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {projects[activeProject].buttons && (
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                      {projects[activeProject].buttons.map((button, index) => (
                        <button
                          key={index}
                          onClick={button.onClick}
                          className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-sky-600 hover:to-indigo-600 transition-colors w-full md:w-auto"
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;