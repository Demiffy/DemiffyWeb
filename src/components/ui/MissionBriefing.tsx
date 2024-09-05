import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  title: string;
  description: string;
  image: string;
  details: string;
  additionalImages?: string[];
  buttons?: { label: string; onClick: () => void }[];
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
              className="bg-slate-900 p-6 rounded-lg shadow-lg max-w-4xl w-full relative"
            >
              <button
                onClick={handleClosePopup}
                className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {projects[activeProject].additionalImages &&
                    projects[activeProject].additionalImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Additional image ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    ))}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-sky-400 mb-4">{projects[activeProject].title}</h3>
                  <p className="text-lg text-gray-300 mb-6">{projects[activeProject].details}</p>

                  {/* Action Buttons */}
                  {projects[activeProject].buttons && (
                    <div className="flex space-x-4">
                      {projects[activeProject].buttons.map((button, index) => (
                        <button
                          disabled={true}
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
