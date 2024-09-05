import { useState, useEffect } from 'react'
import { motion, useAnimation } from "framer-motion"
import { Button } from "./components/ui/button"
import { Badge } from "./components/ui/badge"
import Navbar from "./components/ui/Navbar"
import Footer from './components/ui/Footer'
import MainIntro from './components/ui/MainIntro'
import MilestoneTimeline from "./components/ui/MilestoneTimeline";
import FlightSimulatorDashboard from './components/ui/FlightSimulatorDashboard';
import SkillsOverview from './components/ui/SkillsOverview';
import ContactForm from './components/ui/ContactForm';
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

export default function App() {
  const [arrowVisible, setArrowVisible] = useState(true);
  const skills = [
    { name: 'React', level: 90, focus: 'Frontend Development' },
    { name: 'Node.js', level: 75, focus: 'Backend API & Services' },
    { name: 'TypeScript', level: 85, focus: 'Typed JavaScript & Code Quality' },
    { name: 'AWS', level: 70, focus: 'Cloud Infrastructure & Deployment' },
    { name: 'Python', level: 95, focus: 'Automation & Data Science' },
  ];
  const radarskills = [ 'React', 'Node.js', 'TypeScript', 'AWS', 'Python' ];
  const projects = [
    { title: "Operation Frontend Assault", description: "A mission to create the most responsive UI known to mankind.", image: "/img.png" },
    { title: "Backend Stealth Mission", description: "Covert operation to optimize database queries and API responses.", image: "/img2.png" },
    { title: "Full Stack Dogfight", description: "Engaging multiple technologies in an all-out development brawl.", image: "/img3.gif" },
  ];
  const jetNames = [
    "F-22 Raptor",
    "MiG-29 Fulcrum",
    "F-35 Lightning II",
    "Eurofighter Typhoon",
    "Su-57 Felon",
    "Dassault Rafale",
    "JAS 39 Gripen",
    "F-16 Falcon",
    "F-15 Eagle",
    "F-14 Tomcat",
    "Su-27 Flanker",
    "MiG-31 Foxhound",
    "F-117 Nighthawk",
    "F-4 Phantom II",
    "MiG-21 Fishbed",
    "F-104 Starfighter",
    "Su-25 Frogfoot",
    "Mirage 2000",
    "Harrier Jump Jet",
    "J-20 Mighty Dragon",
    "F-2 Viper Zero",
    "J-10 Firebird",
    "T-50 Golden Eagle",
    "Su-35 Flanker-E",
    "MiG-23 Flogger",
    "F-111 Aardvark",
    "MiG-19 Farmer",
    "Su-24 Fencer",
    "Kfir",
    "HAL Tejas",
    "F-5 Tiger II",
    "Su-30 Flanker-C",
    "MiG-25 Foxbat",
    "F-8 Crusader",
    "Tornado ADV",
    "Saab 105",
    "Su-34 Fullback",
    "Yak-38 Forger",
    "Lavi",
    "J-8 Finback",
    "T-38 Talon",
    "A-7 Corsair II",
    "Su-15 Flagon",
    "Mirage F1",
    "Gnat",
    "Su-17 Fitter",
    "MiG-15 Fagot",
    "F-20 Tigershark",
    "J-7 Airguard",
    "F-102 Delta Dagger",
    "F-106 Delta Dart",
    "Su-47 Berkut",
    "Yak-141 Freestyle",
    "Dassault Etendard",
    "Saab Draken",
    "Saab Viggen",
    "MiG-27",
    "Super Étendard",
    "F-84 Thunderjet",
    "F-105 Thunderchief",
    "F-100 Super Sabre",
    "IAR 93",
    "AIDC F-CK-1 Ching-Kuo",
    "Shenyang J-6",
    "IAR 99",
    "FMA IA 58 Pucará",
    "Nanchang Q-5",
    "F-86 Sabre",
    "MiG-17 Fresco",
    "Aermacchi MB-326",
    "BAC Strikemaster",
    "A-4 Skyhawk",
    "T-33 Shooting Star",
    "L-39 Albatros",
    "Hawker Hunter",
    "Gulfstream G550 CAEW",
    "Beriev A-50",
    "Northrop YF-23",
    "Mikoyan Project 1.44",
    "Lockheed XF-90",
    "Vought XF8U-3 Crusader III",
    "Northrop F-89 Scorpion",
    "Fairey Delta 2",
    "Hawker P.1127",
    "Mikoyan-Gurevich MiG-110",
    "Mitsubishi F-1",
    "Chengdu J-9",
    "Shenyang J-31"
  ];

  // Scroll event handler
  const handleScroll = () => {
    if (window.scrollY > 100) {
      setArrowVisible(false);
    } else {
      setArrowVisible(true);
    }
  };
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  useEffect(() => {
    const getRandomJetName = () => {
      const randomIndex = Math.floor(Math.random() * jetNames.length);
      return jetNames[randomIndex];
    };
    const titleInterval = setInterval(() => {
      const randomJet = getRandomJetName();
      document.title = `Demiffy - ${randomJet}`;
    }, 3000);

    return () => clearInterval(titleInterval);
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      {/* New Navbar */}
      <Navbar />



      <main className="flex-1">
      <MainIntro />

        <section id="skills" className="py-20">
        <h2 className="text-3xl font-bold text-center text-sky-400 mb-8">Skills Overview</h2>
        <RadarAnimation skills={radarskills} />
        <div className="h-8"></div>
        <SkillsOverview skills={skills} />
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
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
