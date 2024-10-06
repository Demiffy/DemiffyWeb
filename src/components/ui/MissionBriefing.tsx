import { useState } from 'react';
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

const MissionBriefing = ({ projects }: { projects: Project[] }) => {
  const [activeProject, setActiveProject] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleViewDetails = () => {
    setIsPopupOpen(true);
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
    <div className="container py-20">
      <h3 className="text-xl font-bold text-sky-400">Projects</h3>
      <div className="bg-slate-900 p-6 rounded-lg">
        <div className="flex justify-between mb-4">
          <div className="space-x-2 flex flex-wrap gap-2">
            {projects.map((project, index) => (
              <button
                key={index}
                onClick={() => setActiveProject(index)}
                className={`px-4 py-2 rounded-full transition-all text-sm ${
                  activeProject === index
                    ? 'bg-sky-600 text-white shadow-lg hover:bg-sky-700'
                    : 'bg-slate-700 text-sky-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                {project.title}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <img
              src={projects[activeProject].image}
              alt={projects[activeProject].title}
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2">{projects[activeProject].title}</h4>
            <p className="text-sm text-gray-300 mb-4">{projects[activeProject].description}</p>
            <button
              onClick={handleViewDetails}
              className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPopupOpen && (
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                {/* Left: Image Section */}
                <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-4" style={{ maxHeight: '90vh', paddingBottom: '3rem' }}>
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
                <div className="sticky top-0">
                  <h3 className="text-2xl font-bold text-sky-400 mb-4 truncate max-w-full">{projects[activeProject].title}</h3>
                  <p className="text-lg text-gray-300 mb-6">{projects[activeProject].details}</p>

                  {/* Tools and Technologies Used */}
                  {projects[activeProject].technologies && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-sky-400 mb-2">Technologies Used:</h4>
                      <ul className="list-disc list-inside text-gray-300">
                        {projects[activeProject].technologies.map((tech, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            {tech.image && (
                              <img src={tech.image} alt={tech.name} className="w-6 h-6" />
                            )}
                            <span>{tech.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {projects[activeProject].buttons && (
                    <div className="flex space-x-4">
                      {projects[activeProject].buttons.map((button, index) => (
                        <button
                          key={index}
                          onClick={button.onClick}
                          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
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

export default MissionBriefing;
