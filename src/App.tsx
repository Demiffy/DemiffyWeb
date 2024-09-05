import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue } from "framer-motion"
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import MilestoneTimeline from "./components/ui/MilestoneTimeline";
import FlightSimulatorDashboard from './components/ui/FlightSimulatorDashboard';
import "./App.css"

interface Project {
  title: string;
  description: string;
  image: string;
}


const milestones = [
  { date: "2024", title: "Start at Brno UNOB", description: "Beginning studies at the University of Defence with a focus on aviation and military technology." },
  { date: "Present", title: "Česká armáda Involvement", description: "Active involvement in the Czech Army, honing both technical and aviation skills." },
  { date: "2023", title: "Key IT Projects", description: "Completed various IT projects, focusing on systems that align with aviation technology and military needs." },
  { date: "2022", title: "Flight Experience", description: "Completed first solo flight, logged hours toward a private pilot's license." },
];

const RadarAnimation = ({ skills }: { skills: string[] }) => {
  const radarLine = useAnimation();
  const duration = 4;

  const positions = skills.map((_, index) => {
    const angle = (index / skills.length) * 360;
    const top = `${50 + 40 * Math.sin((angle * Math.PI) / 180)}%`;
    const left = `${50 + 40 * Math.cos((angle * Math.PI) / 180)}%`;
    return { top, left, angle };
  });

  useEffect(() => {
    radarLine.start({
      rotate: 360,
      transition: { duration, repeat: Infinity, ease: "linear" },
    });
  }, [radarLine]);

  return (
    <div className="relative w-80 h-80 mx-auto">
      <div className="absolute inset-0 rounded-full border-2 border-sky-500 opacity-20"></div>
      <div className="absolute inset-8 rounded-full border-2 border-sky-500 opacity-40"></div>
      <div className="absolute inset-16 rounded-full border-2 border-sky-500 opacity-60"></div>
      <motion.div
        className="absolute top-1/2 left-1/2 w-0.5 h-40 bg-sky-500 origin-bottom"
        animate={radarLine}
        style={{
          transformOrigin: 'center bottom',
          transform: 'translate(-50%, 0)',
          marginTop: '-50%',
        }}
      />
      {skills.map((skill, index) => (
        <motion.div
          key={skill}
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: (positions[index].angle / 360) * duration + 1,
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: duration - 1.5,
          }}
          style={{
            top: positions[index].top,
            left: positions[index].left,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Badge className="bg-sky-700 text-white">{skill}</Badge>
        </motion.div>
      ))}
    </div>
  );
};



const MissionBriefing = ({ projects }: { projects: Project[] }) => {
  const [activeProject, setActiveProject] = useState(0);

  return (
    <div className="bg-slate-900 p-6 rounded-lg">
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-bold text-sky-400">Mission Briefing</h3>
        <div className="space-x-2">
          {projects.map((_, index) => (
            <Button
              key={index}
              variant={activeProject === index ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveProject(index)}
            >
              Mission {index + 1}
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

const CockpitContactForm = () => {
  return (
    <Card className="bg-slate-800 border-sky-500 overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-slate-900 p-4 flex justify-between items-center">
          <h3 className="text-sky-400 font-bold">Communication Console</h3>
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        <form className="p-4 space-y-4">
          <div>
            <label htmlFor="callsign" className="text-sky-400 block mb-1">Callsign (Name)</label>
            <Input id="callsign" className="bg-slate-700 border-sky-500 text-white" />
          </div>
          <div>
            <label htmlFor="mission" className="text-sky-400 block mb-1">Mission Objective (Subject)</label>
            <Input id="mission" className="bg-slate-700 border-sky-500 text-white" />
          </div>
          <div>
            <label htmlFor="transmission" className="text-sky-400 block mb-1">Transmission (Message)</label>
            <Textarea id="transmission" className="bg-slate-700 border-sky-500 text-white" rows={4} />
          </div>
          <Button className="w-full bg-sky-600 hover:bg-sky-700">Send Transmission</Button>
        </form>
      </CardContent>
    </Card>
  );
};

const JetFlightPath = () => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const jet = useMotionValue(0);

  useEffect(() => {
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength();

      const animate = () => {
        const phase = (Date.now() / 2000) % 1;
        const x = phase * pathLength;
        jet.set(x);
        requestAnimationFrame(animate);
      };

      animate();
    }
  }, [jet]);

  return (
    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
      <path
        ref={pathRef}
        d="M0,100 Q250,200 500,100 T1000,100"
        fill="none"
        stroke="rgba(96, 165, 250, 0.2)"
        strokeWidth="2"
      />
      <motion.g style={{ offsetDistance: jet }}>
        <path d="M-5,0 L5,5 L0,0 L5,-5 Z" fill="#60A5FA" />
      </motion.g>
    </svg>
  );
};

export default function App() {
  const skills = ['React', 'Node.js', 'TypeScript', 'AWS', 'Python'];
  const projects = [
    { title: "Operation Frontend Assault", description: "A mission to create the most responsive UI known to mankind.", image: "/img.png" },
    { title: "Backend Stealth Mission", description: "Covert operation to optimize database queries and API responses.", image: "/img2.png" },
    { title: "Full Stack Dogfight", description: "Engaging multiple technologies in an all-out development brawl.", image: "/img3.gif" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <JetFlightPath />
      <header className="sticky top-0 z-40 w-full border-b border-sky-500/20 bg-slate-900/90 backdrop-blur">
        <div className="container h-14 flex items-center">
          <a className="flex items-center space-x-2" href="#">
            <span className="font-bold">Demiffy</span>
          </a>
          <nav className="ml-auto flex items-center space-x-4 text-sm font-medium">
            <a className="text-sky-400 hover:text-sky-300" href="#about">Flight Log</a>
            <a className="text-sky-400 hover:text-sky-300" href="#skills">Arsenal</a>
            <a className="text-sky-400 hover:text-sky-300" href="#projects">Missions</a>
            <a className="text-sky-400 hover:text-sky-300" href="#contact">Comms</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">

        <section id="hero" className="min-h-screen flex flex-col justify-center items-center">
          <div className="profile-container bg-slate-800 p-6 rounded-full shadow-lg mb-6">
            <img
              src="/hero.png"
              alt="Profile"
              className="w-40 h-40 object-cover rounded-full border-4 border-sky-500"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4">Demiffy!</h1>
          <p className="text-xl text-sky-300 mb-8">EVERYTHING IS A PLACEHOLDER FOR NOW! - Small description here</p>
          <Button className="bg-sky-600 hover:bg-sky-700 text-white">Scramble to Projects</Button>
        </section>

        <section id="skills" className="py-20 bg-slate-800">
          <div className="container">
            <h2 className="text-3xl font-bold mb-10 text-center">Combat Arsenal</h2>
            <RadarAnimation skills={skills} />
          </div>
        </section>

        <section id="projects" className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold mb-10 text-center">Mission Logs</h2>
            <MissionBriefing projects={projects} />
          </div>
        </section>

        <section id="milestones" className="py-20 bg-slate-800">
          <div className="container">
            <MilestoneTimeline milestones={milestones} />
          </div>
        </section>

        <section id="flight-simulator" className="py-20 bg-slate-800">
        <h2 className="text-3xl font-bold mb-10 text-center text-sky-400">
          Flight Simulator Dashboard
        </h2>
        <FlightSimulatorDashboard />
      </section>

        <section id="contact" className="py-20 bg-slate-800">
          <div className="container max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">Establish Comms</h2>
            <CockpitContactForm />
          </div>
        </section>
        
      </main>
      <footer className="bg-slate-900 border-t border-sky-500/20 py-6">
        <div className="container text-center text-sky-400">
          <p>&copy; 2024 Demiffy. All rights reserved. Fly safe, code strong.</p>
        </div>
      </footer>
    </div>
  );
}
