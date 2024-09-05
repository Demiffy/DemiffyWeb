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
    { title: "KybernaIS Made Better / UI-UX KybernaIS Redo", description: "Stuff stuff stuff, Placeholder", image: "/ksmb.png" },
    { title: "Cloud Storage (Private)", description: "Stuff stuff stuff, Placeholder", image: "/clouds.png" },
    { title: "War Thunder Tree Analyzer", description: "Stuff stuff stuff, Placeholder", image: "/wtanalyze.gif" },
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
