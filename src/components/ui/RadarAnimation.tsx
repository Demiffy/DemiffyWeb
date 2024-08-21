import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Badge } from "./badge";

const RadarAnimation = ({ skills }: { skills: string[] }) => {
  const radarLine = useAnimation();

  useEffect(() => {
    radarLine.start({
      rotate: 360,
      transition: { duration: 4, repeat: Infinity, ease: "linear" },
    });
  }, [radarLine]);

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Radar circles */}
      <div className="absolute inset-0 rounded-full border-2 border-sky-500 opacity-20"></div>
      <div className="absolute inset-4 rounded-full border-2 border-sky-500 opacity-40"></div>
      <div className="absolute inset-8 rounded-full border-2 border-sky-500 opacity-60"></div>

      {/* Radar line */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-1 h-40 bg-sky-500 origin-bottom"
        animate={radarLine}
        style={{
          transformOrigin: "center bottom",
        }}
      ></motion.div>

      {/* Radar dots (skills) */}
      {skills.map((skill, index) => {
        const angle = (index / skills.length) * 360;
        const radians = (angle * Math.PI) / 180;
        const distance = 80; // Distance from center

        return (
          <motion.div
            key={skill}
            className="absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
            style={{
              top: `calc(50% + ${Math.sin(radians) * distance}px)`,
              left: `calc(50% + ${Math.cos(radians) * distance}px)`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Badge className="bg-sky-700 text-white">{skill}</Badge>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RadarAnimation;
