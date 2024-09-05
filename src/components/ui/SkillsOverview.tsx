const SkillsOverview = ({ skills }: { skills: { name: string, level: number, focus: string }[] }) => {
  return (
    <div className="skills-overview container mx-auto py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {skills.map((skill) => (
          <div key={skill.name} className="bg-slate-800 p-6 rounded-lg shadow-lg border border-sky-500 relative">
            <h3 className="text-xl font-bold text-sky-400 mb-2">{skill.name}</h3>
            
            <div className="mb-4">
              <p className="text-gray-300"><strong>Proficiency Level:</strong> {skill.level}%</p>
              <div className="w-full bg-gray-700 h-2 rounded-full">
                <div 
                  className="bg-sky-500 h-2 rounded-full" 
                  style={{ width: `${skill.level}%` }}>
                </div>
              </div>
            </div>

            <div>
              <p className="text-gray-300"><strong>Focus Area:</strong> {skill.focus}</p>
            </div>
            
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <svg className="w-full h-full">
                <circle cx="50%" cy="50%" r="40%" stroke="skyblue" strokeWidth="2" fill="none" />
                <circle cx="50%" cy="50%" r="30%" stroke="skyblue" strokeWidth="1" fill="none" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsOverview;