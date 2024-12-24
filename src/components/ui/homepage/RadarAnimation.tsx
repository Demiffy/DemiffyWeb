import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Badge } from "./badge";

interface Skill {
  name: string;
  level: number;
  focus: string;
}

const RadarAnimation = ({ skills }: { skills: Skill[] }) => {
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
          key={skill.name}
          className="absolute select-none"
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
          <Badge className="bg-sky-700 text-white">{skill.name}</Badge>
        </motion.div>
      ))}
    </div>
  );
};

export default RadarAnimation;
