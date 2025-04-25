// Home.tsx
import { Helmet } from 'react-helmet-async';
import MainIntro from './ui/homepage/MainIntro';
import RadarAnimation from './ui/homepage/RadarAnimation';
import SkillsOverview from './ui/homepage/SkillsOverview';
import Projects from './ui/homepage/Projects';
import MilestoneTimeline from './ui/homepage/MilestoneTimeline';
import NoteBoard from './ui/homepage/NoteBoard';
import Footer from './ui/Footer';
import Maintenance from './ui/homepage/Maintenance';

const MAINTENANCE_MODE = true;

const Home = () => {
  if (MAINTENANCE_MODE) {
    return <Maintenance />;
  }

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
      title: 'KybernaIS Made Better / UI-UX KybernaIS Redo',
      description:
        'A UI/UX redesign of KybernaIS to enhance user experience and optimize workflow.',
      image: '/ksbmain.png',
      details:
        'This project focuses on redesigning the UI/UX of KybernaIS to improve its usability and performance. The new design brings a fresh, modern interface with intuitive navigation for users in the educational sector. The UI/UX redesign is not publicly available; it is purely a prototype.',
      additionalImages: [
        { src: '/ksb1.png', title: 'Clear Design' },
        { src: '/ksb2.png', title: 'Theme Selection' },
        { src: '/ksb3.png', title: 'Modern Styles' },
        { src: '/ksb4.png', title: 'Built-in Grade Predictor' },
        { src: '/sbislogin.png', title: 'UI-UX Redesign – Login' },
        { src: '/sbisdashboard.png', title: 'UI-UX Redesign – Dashboard' },
        { src: '/sbisgrades.png', title: 'UI-UX Redesign – Grades' },
      ],
      buttons: [
        {
          label: 'View on Chrome Store',
          onClick: () =>
            window.open(
              'https://chromewebstore.google.com/detail/kybernais-made-better/plehhebncnogcplmmgnliaipgbmoohdf',
              '_blank',
            ),
        },
        {
          label: 'GitHub Repo',
          onClick: () => window.open('https://github.com/Demiffy/KybernaIS-MB', '_blank'),
        },
      ],
      technologies: [
        { name: 'HTML5', image: '/html5-icon.png' },
        { name: 'CSS3', image: '/css3-icon.png' },
        { name: 'JavaScript', image: '/js-icon.png' },
        { name: 'C#', image: '/c-icon.png' },
      ],
    },
    {
      title: 'ASynC – Art Synchronized Canvas',
      description:
        'A collaborative pixel-art canvas where users can chat, create, and edit their pixel-art creations in real time.',
      image: '/AsyncPlaceHeader.png',
      details:
        "ASynCPlace is a web-based platform designed for real-time collaborative pixel-art creation, powered by Firebase and React. Users share a canvas to place, edit, and remove pixels with tools such as brushes and an eraser. A rich palette, adjustable brush sizes, image blueprints, live chat, and unlockable achievements foster creativity and community.",
      additionalImages: [
        { src: '/AsyncPlace.png', title: 'Sign-In Screen' },
        { src: '/AsyncPlaceMain.png', title: 'Canvas Interface' },
        { src: '/AsyncPlaceSidebar.png', title: 'Sidebar' },
        { src: '/AsyncPlaceLookup.png', title: 'Lookup' },
        { src: '/AsyncPlaceAchievement.png', title: 'Achievements' },
      ],
      buttons: [
        { label: 'Website', onClick: () => window.open('https://demiffy.com/ASynC', '_blank') },
        { label: 'GitHub Repo', onClick: () => window.open('https://github.com/Demiffy/DemiffyWeb', '_blank') },
      ],
      technologies: [
        { name: 'React', image: '/react-icon.png' },
        { name: 'Firebase', image: '/firebase-icon.png' },
        { name: 'TypeScript', image: '/typescript-icon.png' },
      ],
    },
    {
      title: 'WarThunder Analyzer',
      description:
        'A real-time in-game event analyzer for War Thunder with a dynamic web dashboard.',
      image: '/wta-main.png',
      details:
        'WarThunderAnalyzer is a Python tool that uses OCR to analyze in-game events, track session statistics, and provide real-time updates via a web interface. It is for educational purposes and is not affiliated with or endorsed by War Thunder.',
      additionalImages: [
        { src: '/wta-1.png', title: 'Real-Time Dashboard' },
        { src: '/wta-2.png', title: 'In-Game Detection' },
      ],
      buttons: [
        {
          label: 'GitHub Repo',
          onClick: () => window.open('https://github.com/Demiffy/WarThunderAnalyzer', '_blank'),
        },
      ],
      technologies: [
        { name: 'Python', image: '/python-icon.png' },
        { name: 'Flask', image: '/flask-icon.png' },
        { name: 'Tesseract OCR', image: '/tesseract-icon.png' },
        { name: 'Bootstrap', image: '/bootstrap-icon.png' },
        { name: 'JavaScript', image: '/js-icon.png' },
      ],
    },
    {
      title: 'Horizon Control – WIP',
      description:
        'A strategic airport-management game where players oversee flight operations, reroute planes, and balance airport capacity.',
      image: '/phcmain.png',
      details:
        'In Horizon Control, players manage airports by directing flights, responding to disruptions, and keeping congestion low. Balancing passenger satisfaction and operational efficiency is key.',
      additionalImages: [
        { src: 'ph2.png', title: 'Main Menu' },
        { src: 'projecthorizon.png', title: 'Europe Map' },
        { src: 'placeholder.png', title: 'Event Management' },
        { src: 'placeholder.png', title: 'Passenger Dashboard' },
        { src: 'placeholder.png', title: 'Emergency Panel' },
        { src: 'placeholder.png', title: 'Schedule Overview' },
        { src: 'placeholder.png', title: 'Expansion Options' },
        { src: 'placeholder.png', title: 'Staff Management' },
      ],
      buttons: [
        {
          label: 'GitHub Repo (Private)',
          onClick: () => window.open('https://github.com/Demiffy/project-horizon-control', '_blank'),
        },
      ],
      technologies: [
        { name: 'Unity', image: '/unity-icon.png' },
        { name: 'C#', image: '/c-icon.png' },
      ],
    },
    {
      title: 'RMC – Remote Mouse Control PC',
      description: 'Control your PC’s mouse remotely from a mobile device.',
      image: '/rmc1.png',
      details: 'RMC lets you control your PC’s mouse from your phone.',
      additionalImages: [{ src: 'rmc1.png', title: 'Console Debug' }],
      buttons: [],
      technologies: [
        { name: 'Python', image: '/python-icon.png' },
        { name: 'React', image: '/react-icon.png' },
        { name: 'C#', image: '/c-icon.png' },
      ],
    },
  ];

  const milestones = [
    {
      date: '2027',
      title: 'Start at Brno UNOB',
      description:
        'Began studies at the University of Defence, focusing on aviation and military technology.',
      image: '/UNOBLogo.png',
    },
    {
      date: 'Present',
      title: 'Studying IT – Programming',
      description:
        'Currently honing programming skills with a focus on software development, algorithms, and IT systems.',
      image: '/Code.png',
    },
    {
      date: '2023',
      title: 'Started High School',
      description:
        'Entered high school with an IT specialization, laying the foundation for a programming career.',
      image: '/KybLogo.png',
    },
    {
      date: '2022',
      title: 'Finished Middle School',
      description:
        'Completed middle school, where an interest in technology began to take shape.',
      image: '/MHLogo.png',
    },
  ];

  return (
    <div className="min-h-screen text-white bg-primary-color">
      <Helmet>
        <title>Home – Demiffy</title>
        <meta
          name="description"
          content="Demiffy's home page, showcasing skills and projects in IT."
        />
        <meta
          name="keywords"
          content="Demiffy, IT, aviation, projects, programming, portfolio"
        />
        <link rel="canonical" href="https://demiffy.com" />

        {/* Open Graph / Discord */}
        <meta property="og:title" content="Demiffy!" />
        <meta property="og:description" content="What a dumbass who coded this" />
        <meta property="og:url" content="https://demiffy.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://demiffy.com/plane.png" />
      </Helmet>

      <MainIntro />

      <section id="skills" className="py-20">
        <h2 className="mb-8 text-3xl font-bold text-center select-none text-accent-color">
          Skills Overview
        </h2>
        <RadarAnimation skills={skills} />
        <div className="h-8" />
        <SkillsOverview skills={skills} />
      </section>

      <section id="projects" className="py-20">
        <Projects projects={projects} />
      </section>

      <section
        id="milestones"
        className="py-20"
        style={{ background: 'linear-gradient(to bottom, #0d0c0b, #141312)' }}
      >
        <MilestoneTimeline milestones={milestones} />
      </section>

      <section id="contact" className="py-20 bg-secondary-color">
        <NoteBoard />
      </section>

      <Footer />
    </div>
  );
};

export default Home;