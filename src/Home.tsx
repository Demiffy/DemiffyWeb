// src/Home.tsx
import MainIntro from './components/ui/MainIntro';
import RadarAnimation from './components/ui/RadarAnimation';
import SkillsOverview from './components/ui/SkillsOverview';
import MissionBriefing from './components/ui/MissionBriefing';
import MilestoneTimeline from './components/ui/MilestoneTimeline';
import ContactForm from './components/ui/ContactForm';
import Footer from './components/ui/Footer';

const Home = () => {
  const skills = [
    { name: 'React', level: 90, focus: 'Frontend Development' },
    { name: 'Node.js', level: 75, focus: 'Backend API & Services' },
    { name: 'TypeScript', level: 85, focus: 'Typed JavaScript & Code Quality' },
    { name: 'AWS', level: 70, focus: 'Cloud Infrastructure & Deployment' },
    { name: 'Python', level: 95, focus: 'Automation & Data Science' },
  ];

  const projects = [
    { title: "KybernaIS Made Better / UI-UX KybernaIS Redo", description: "A mission to create the most responsive UI known to mankind.", image: "/img.png" },
    { title: "Cloud Storage (Private)", description: "Covert operation to optimize database queries and API responses.", image: "/img2.png" },
    { title: "War Thunder Tree Analyzer", description: "Engaging multiple technologies in an all-out development brawl.", image: "/img3.gif" },
  ];

  const milestones = [
    { date: "2024", title: "Start at Brno UNOB", description: "Beginning studies at the University of Defence with a focus on aviation and military technology.", image: "/hero.png" },
    { date: "Present", title: "Česká armáda Involvement", description: "Active involvement in the Czech Army, honing both technical and aviation skills." },
    { date: "2023", title: "Key IT Projects", description: "Completed various IT projects, focusing on systems that align with aviation technology and military needs.", image: "/img3.gif" },
    { date: "2022", title: "Flight Experience", description: "Completed first solo flight, logged hours toward a private pilot's license." },
    { date: "2021", title: "High School Graduation", description: "Graduated from high school with a focus on mathematics and physics." },
  ];

  return (
    <div>
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
