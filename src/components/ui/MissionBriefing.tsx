import { useState } from 'react';
import { Button } from './button';

interface Project {
  title: string;
  description: string;
  image: string;
}

const MissionBriefing = ({ projects }: { projects: Project[] }) => {
  const [activeProject, setActiveProject] = useState(0);

  return (
    <div className="bg-slate-900 p-6 rounded-lg">
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-bold text-sky-400">Projects</h3>
        <div className="space-x-2">
        {projects.map((project, index) => (
        <Button
            key={index}
            variant={activeProject === index ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveProject(index)}
        >
            {project.title}
        </Button>
        ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
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
          <Button className="bg-sky-600 text-white hover:bg-sky-700">View Mission Details</Button>
        </div>
      </div>
    </div>
  );
};

export default MissionBriefing;
