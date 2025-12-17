import { motion } from "framer-motion";
import { Rocket, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const projects = [
  {
    title: "API Website",
    description: "An API for lightweight utilities and small projects",
    icon: <Rocket className="h-6 w-6 text-accent" />,
  },
  {
    title: "WIP",
    description: "Lorem Ipsum",
    icon: <Shield className="h-6 w-6 text-accent" />,
  },
  {
    title: "KybernaIS",
    description: "A Chrome extension for a student information system",
    icon: <Sparkles className="h-6 w-6 text-accent" />,
  },
];

const logEntries = [
  {
    title: "Plane Gallery",
    description: "WIP",
    image: "/gripen.webp",
    href: "/gallery/planes",
  },
  {
    title: "Car Gallery",
    description: "WIP",
    image: "/GR86.png",
    href: "/gallery/cars",
  },
];

const Home = () => (
  <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center gap-16 px-4 py-16 min-h-screen">
    <section className="relative flex w-full flex-col items-center gap-6 text-center">
      <div
        className="absolute -inset-10 rounded-[3rem] bg-gradient-to-br from-accent/30 via-transparent to-indigo-500/30 blur-3xl opacity-70"
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center gap-6 rounded-3xl bg-white/5 p-10 shadow-2xl backdrop-blur-md ring-1 ring-white/10 sm:flex-row sm:items-center sm:gap-10 sm:text-left"
      >
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-accent/40 blur-xl opacity-70" aria-hidden="true" />
          <img
            src="/DM.png"
            alt="Portrait of Demi"
            className="relative h-48 w-48 rounded-full border-4 border-white/60 object-cover shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-accent/80">
            Silly
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Demi</h1>
          <p className="max-w-xl text-base text-gray-300">
            Studying software development and training to slowly become a commercial pilot - WEBSITE IS STILL VERY MUCH A WIP
          </p>
        </div>
      </motion.div>
    </section>

    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-full space-y-6"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-accent/70">
          Projects
        </span>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">What I'm working with</h2>
        <p className="max-w-2xl text-sm text-gray-400 sm:text-base">
          A small showcase of some of my projects i am working or worked on
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.title}
            className="group flex h-full flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-6 shadow-lg transition hover:border-accent/40 hover:bg-white/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
              {project.icon}
            </div>
            <div className="flex flex-col gap-2 text-left">
              <h3 className="text-lg font-semibold text-white">{project.title}</h3>
              <p className="text-sm text-gray-300">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>

    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="w-full space-y-6"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-accent/70">
          Gallery
        </span>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">WIP - To be done</h2>
        <p className="max-w-xl text-sm text-gray-400 sm:text-base">
          WIP - To be done
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        {logEntries.map((entry, index) => (
          <motion.div
            key={entry.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
          >
            <Link
              to={entry.href}
              className="group relative block h-[22rem] overflow-hidden rounded-3xl shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/70 sm:h-[26rem]"
              aria-label={entry.title}
            >
              <img
                src={entry.image}
                alt={entry.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20 transition duration-500 group-hover:from-black/60 group-hover:via-black/25 group-hover:to-black/10" />
              <div className="relative z-10 flex h-full flex-col justify-end gap-3 p-8 text-white">
                <h3 className="text-3xl font-semibold">{entry.title}</h3>
                <p className="text-sm text-gray-200 sm:text-base">{entry.description}</p>
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent sm:text-sm">
                  Open
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  </main>
);

export default Home;
