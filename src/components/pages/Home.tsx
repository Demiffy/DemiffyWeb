import { motion } from "framer-motion";
import { RocketIcon, ShieldIcon, InfoIcon } from "lucide-react";

const projects = [
  {
    icon: <RocketIcon className="w-7 h-7 text-accent" />,
    title: "Project 1",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    icon: <ShieldIcon className="w-7 h-7 text-accent" />,
    title: "Project 2",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    icon: <InfoIcon className="w-7 h-7 text-accent" />,
    title: "Project 3",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

const bannerImage = "/gripen.webp";

const Home = () => (
  <div className="min-h-screen flex flex-col items-center px-2 py-0 sm:py-1">
    {/* Banner */}
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full max-w-3xl rounded-xl shadow-2xl mt-10"
    >
      <div className="relative w-full aspect-[2.2/1] min-h-[180px] flex items-center justify-center overflow-hidden rounded-xl">
        {/* Banner Image */}
        <img
          src={bannerImage}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          style={{ filter: "brightness(0.75)" }}
        />
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6 py-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-1 text-center drop-shadow-xl">
            Welcome to Demiffy.com
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-2 text-center drop-shadow">
            The page is under construction, currently serves as an API
          </p>
          <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-semibold text-lg shadow-xl transition">
            Learn More
          </button>
        </div>
      </div>
    </motion.div>

    {/* Projects Section */}
    <section className="w-full max-w-5xl flex flex-col items-center mt-10">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 w-full px-2">
        Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-2">
        {projects.map((p, idx) => (
          <div
            key={idx}
            className="bg-secondary border border-tertiary rounded-xl shadow-lg flex flex-col items-start p-6 min-h-[140px] transition hover:scale-105"
          >
            <div className="mb-3">{p.icon}</div>
            <h3 className="text-lg font-semibold mb-1 text-white">{p.title}</h3>
            <p className="text-sm text-gray-400">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
