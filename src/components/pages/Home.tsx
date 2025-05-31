// Home.jsx

import { motion } from "framer-motion";
import { RocketIcon, ConstructionIcon, InfoIcon } from "lucide-react";

const features = [
  {
    icon: <RocketIcon className="w-8 h-8 text-accent-color" />,
    title: "WIP",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Quisque porta. Aliquam in lorem sit amet leo accumsan lacinia. Phasellus rhoncus. Nullam faucibus mi quis velit",
  },
  {
    icon: <ConstructionIcon className="w-8 h-8 text-yellow-400" />,
    title: "WIP",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Quisque porta. Aliquam in lorem sit amet leo accumsan lacinia. Phasellus rhoncus. Nullam faucibus mi quis velit",
  },
  {
    icon: <InfoIcon className="w-8 h-8 text-blue-400" />,
    title: "WIP",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Quisque porta. Aliquam in lorem sit amet leo accumsan lacinia. Phasellus rhoncus. Nullam faucibus mi quis velit",
  },
];

const Home = () => (
  <div className="flex flex-col items-center justify-center flex-grow px-4 py-12">
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-center drop-shadow-lg">
        Welcome to <span className="text-white">Demiffy.com</span>
      </h1>
      <p className="text-xl mb-6 text-center max-w-2xl text-gray-200">
        The page is under construction, currently serves an an API
      </p>
    </motion.div>
    <motion.div
      id="features"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
      className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
    >
      {features.map((f, idx) => (
        <div
          key={idx}
          className="bg-secondary rounded-2xl shadow-xl flex flex-col items-center p-8 transition transform hover:scale-105"
        >
          <div className="mb-4">{f.icon}</div>
          <h3 className="text-2xl font-bold mb-2">{f.title}</h3>
          <p className="text-base text-gray-300 text-center">{f.description}</p>
        </div>
      ))}
    </motion.div>
  </div>
);

export default Home;
