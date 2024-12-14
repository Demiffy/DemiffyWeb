// Home.tsx
import { Helmet } from 'react-helmet-async';
import MainIntro from './ui/homepage/MainIntro';
import RadarAnimation from './ui/homepage/RadarAnimation';
import SkillsOverview from './ui/homepage/SkillsOverview';
import Projects from './ui/homepage/Projects';
import MilestoneTimeline from './ui/homepage/MilestoneTimeline';
import NoteBoard from './ui/homepage/NoteBoard';
import Footer from './ui/Footer';

const Home = () => {
const skills = [
    { name: 'HTML & CSS', level: 80, focus: 'Web Page Structure & Styling' },
    { name: 'JavaScript', level: 60, focus: 'Frontend Scripting & Web Interactivity' },
    { name: 'React', level: 50, focus: 'Frontend Framework & UI Development' },
    { name: 'Node.js', level: 15, focus: 'Backend Development & APIs' },
    { name: 'C#', level: 40, focus: 'Object-Oriented Programming & Application Development' },
    { name: 'Python', level: 15, focus: 'Scripting, Automation & General-Purpose Programming' },
    { name: 'Unity', level: 45, focus: 'Game Development & Interactive Simulations' },
    ];      


    const projects = [
      {
        title: "KybernaIS Made Better / UI-UX KybernaIS Redo",
        description: "A UI/UX redesign of KybernaIS to enhance user experience and optimize workflow.",
        image: "/ksbmain.png",
        details: "This project focuses on redesigning the UI/UX of KybernaIS to improve its usability and performance. The new design brings a fresh, modern interface with intuitive navigation for users in the educational sector. The UI-UX redesign is not publicly available, its purely a prototype.",
        additionalImages: [
          { src: "/ksb1.png", title: "Clear Design" },
          { src: "/ksb2.png", title: "Selection of Themes" },
          { src: "/ksb3.png", title: "More Modern Styles" },
          { src: "/ksb4.png", title: "Built-in Grade Predictor" },
          { src: "/sbislogin.png", title: "UI-IX Redesign - Login" },
          { src: "/sbisdashboard.png", title: "UI-IX Redesign - Dashboard" },
          { src: "/sbisgrades.png", title: "UI-IX Redesign - Grades" },
        ],
        buttons: [
          { label: "View on Chrome Extension Store", onClick: () => window.open('https://chromewebstore.google.com/detail/kybernais-made-better/plehhebncnogcplmmgnliaipgbmoohdf', '_blank') },
          { label: "GitHub Repo", onClick: () => window.open('https://github.com/Demiffy/KybernaIS-MB', '_blank') }
        ],
        technologies: [
          { name: "HTML5", image: "/html5-icon.png" },
          { name: "CSS3", image: "/css3-icon.png" },
          { name: "JavaScript", image: "/js-icon.png" },
          { name: "C#", image: "/c-icon.png" }
        ]
      },
      {
        title: "Horizon Control - WIP",
        description: "A strategic airport management game where players oversee flight operations, reroute planes, and handle airport capacity to maintain passenger satisfaction.",
        image: "/phcmain.png",
        details: "In Horizon Control, players manage airports by directing flights, rerouting aircraft during disruptions, and keeping airports from becoming overcrowded. With a focus on balancing passenger happiness and smooth operations, the game challenges players to respond to events and emergencies while ensuring timely departures.",
        additionalImages: [
          { src: "ph2.png", title: "Main Menu Panel" },
          { src: "projecthorizon.png", title: "Europe Map Level" },
          { src: "placeholder.png", title: "Event Management Interface" },
          { src: "placeholder.png", title: "Passenger Satisfaction Dashboard" },
          { src: "placeholder.png", title: "Emergency Response Panel" },
          { src: "placeholder.png", title: "Flight Schedule Overview" },
          { src: "placeholder.png", title: "Airport Expansion Options" },
          { src: "placeholder.png", title: "Staff Management Interface" }
        ],
        buttons: [
          { label: "GitHub Repo (Private)", onClick: () => window.open('https://github.com/Demiffy/project-horizon-control', '_blank') }
        ],
        technologies: [
          { name: "Unity", image: "/unity-icon.png" },
          { name: "C#", image: "/c-icon.png" },
        ]
      },
      {
        title: "RMC - Remote Mouse Control PC",
        description: "A remote mouse control application that allows users to control their PC from a mobile device.",
        image: "/rmc1.png",
        details: "RMC is a remote mouse control application that enables users to control their PC from a mobile device.",
        additionalImages: [
          { src: "rmc1.png", title: "Console Debug" },
        ],
        buttons: [
        ],
        technologies: [
          { name: "Python", image: "/python-icon.png" },
          { name: "React", image: "/react-icon.png" },
          { name: "C#", image: "/c-icon.png" },
        ]
      },
      {
        title: "PlaceV2",
        description: "A collaborative pixel art canvas where users can create, edit, and share their pixel art creations in real time.",
        image: "/placev2.png",
        details: "PlaceV2 allows users to interact with a shared canvas to place and remove pixels. Featuring real-time collaboration, zooming, and customizable colors, this project emphasizes user engagement and creative expression.",
        additionalImages: [
          { src: "/placev2.png", title: "Fully working Canvas" }
        ],
        buttons: [
          { label: "Website", onClick: () => window.open('https://demiffy.com/place', '_blank') },
          { label: "GitHub Repo", onClick: () => window.open('https://github.com/Demiffy/DemiffyWeb', '_blank') }
        ],
        technologies: [
          { name: "React", image: "/react-icon.png" },
          { name: "Firebase", image: "/firebase-icon.png" },
          { name: "TypeScript", image: "/typescript-icon.png" }
        ]
      }
    ];
    

  const milestones = [
    { date: "2027", title: "Start at Brno UNOB", description: "Beginning studies at the University of Defence with a focus on aviation and military technology.", image: "/UNOBLogo.png" },
    { date: "Present", title: "Studying IT - Programming", description: "Currently honing my programming skills with a focus on software development, algorithms, and IT systems", image: "/Code.png" },
    { date: "2023", title: "Started High School", description: "Started high school with a specialization in information technology, laying the foundation for my journey into the world of programming and software development", image: "/KybLogo.png" },
    { date: "2022", title: "Finished Middle School", description: "Completed middle school, where my interest in computers and technology began to take shape, inspiring my future career path", image: "/MHLogo.png" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Helmet>
        <title>Home - Demiffy</title>
        <meta name="description" content="This is Demiffy's home page, showcasing skills and projects in IT" />
        <meta name="keywords" content="Demiffy, IT, aviation, jet pilot, projects, programming, portfolio" />
        <link rel="canonical" href="https://demiffy.com" />
        {/* Discord tags */}
        <meta property="og:title" content="Demiffy!" />
        <meta property="og:description" content="What a dumbass who coded this" />
        <meta property="og:url" content="https://demiffy.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://demiffy.com/plane.png" />
      </Helmet>
      <MainIntro />
      <section id="skills" className="py-20">
        <h2 className="text-3xl font-bold text-center text-sky-400 mb-8 select-none">Skills Overview</h2>
        <RadarAnimation skills={skills} />
        <div className="h-8"></div>
        <SkillsOverview skills={skills} />
      </section>
      <section id="projects" className="py-20">
        <Projects projects={projects} />
      </section>
      <section id="milestones" className="py-20 bg-slate-800">
        <MilestoneTimeline milestones={milestones} />
      </section>
      <section id="contact" className="py-20 bg-slate-800">
        <NoteBoard />
      </section>
      <Footer />
    </div>
  );
};

export default Home;