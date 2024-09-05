import { useState } from 'react';

interface Project {
  title: string;
  description: string;
  image: string;
}

const MissionBriefing = ({ projects }: { projects: Project[] }) => {
  const [activeProject, setActiveProject] = useState(0);

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
            <button className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionBriefing;
