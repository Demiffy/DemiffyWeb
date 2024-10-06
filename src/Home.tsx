// Home.tsx
import MainIntro from './components/ui/MainIntro';
import RadarAnimation from './components/ui/RadarAnimation';
import SkillsOverview from './components/ui/SkillsOverview';
import MissionBriefing from './components/ui/MissionBriefing';
import MilestoneTimeline from './components/ui/MilestoneTimeline';
import ContactForm from './components/ui/ContactForm';
import Footer from './components/ui/Footer';

const Home = () => {
const skills = [
    { name: 'HTML & CSS', level: 80, focus: 'Web Page Structure & Styling' },
    { name: 'JavaScript', level: 60, focus: 'Frontend Scripting & Web Interactivity' },
    { name: 'React', level: 50, focus: 'Frontend Framework & UI Development' },
    { name: 'Node.js', level: 40, focus: 'Backend Development & APIs' },
    { name: 'C#', level: 45, focus: 'Object-Oriented Programming & Application Development' },
    { name: 'Python', level: 20, focus: 'Scripting, Automation & General-Purpose Programming' },
    { name: 'Unity', level: 45, focus: 'Game Development & Interactive Simulations' },
    ];      


    const projects = [
      {
        title: "KybernaIS Made Better / UI-UX KybernaIS Redo",
        description: "A UI/UX redesign of KybernaIS to enhance user experience and optimize workflow.",
        image: "/ksbmain.png",
        details: "This project focuses on redesigning the UI/UX of KybernaIS to improve its usability and performance. The new design brings a fresh, modern interface with intuitive navigation for users in the educational sector.",
        additionalImages: [
          { src: "/ksb1.png", title: "KybernaIS Main Dashboard" },
          { src: "/ksb2.png", title: "User Management Interface" },
          { src: "/ksb3.png", title: "Settings Panel" },
          { src: "/ksb4.png", title: "Reports and Analytics" }
        ],
        buttons: [
          { label: "View on Chrome Extension Store", onClick: () => window.open('https://chromewebstore.google.com/detail/kybernais-made-better/plehhebncnogcplmmgnliaipgbmoohdf', '_blank') },
          { label: "GitHub Repo", onClick: () => window.open('https://github.com/Demiffy/KybernaIS-MB', '_blank') }
        ]
      },
      {
        title: "Cloud Storage (Private)",
        description: "A private cloud storage system designed to store files securely and efficiently.",
        image: "/csd.png",
        details: "This project involves creating a cloud storage platform with a focus on privacy and security. Users can upload, manage, and retrieve files with enhanced encryption to ensure data protection.",
        additionalImages: [
          { src: "/placeholder.png", title: "Login Screen" },
          { src: "/placeholder.png", title: "File Management Interface" }
        ],
        buttons: [
          { label: "Live Demo", onClick: () => window.open('https://example.com/cloud-demo', '_blank') }
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
          { label: "Play Now", onClick: () => window.open('https://nothing.com/project-horizon-control', '_blank') },
          { label: "GitHub Repo", onClick: () => window.open('https://github.com/Demiffy/project-horizon-control', '_blank') }
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
      <MainIntro />
      <section id="skills" className="py-20">
        <h2 className="text-3xl font-bold text-center text-sky-400 mb-8">Skills Overview</h2>
        <RadarAnimation skills={skills} />
        <div className="h-8"></div>
        <SkillsOverview skills={skills} />
      </section>
      <section id="projects" className="py-20">
        <MissionBriefing projects={projects} />
      </section>
      <section id="milestones" className="py-20 bg-slate-800">
        <MilestoneTimeline milestones={milestones} />
      </section>
      <section id="contact" className="py-20 bg-slate-800">
        <ContactForm />
      </section>
      <Footer />
    </div>
  );
};

export default Home;
