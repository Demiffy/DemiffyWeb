import { motion } from "framer-motion";
import { Card, CardContent } from "./card";

interface Milestone {
  date: string;
  title: string;
  description: string;
}

const MilestoneTimeline = ({ milestones }: { milestones: Milestone[] }) => {
  return (
    <div className="container py-20">
      <h2 className="text-3xl font-bold mb-10 text-center text-sky-400">
        Key Milestones
      </h2>
      <div className="relative border-l-2 border-sky-500">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.date}
            className="mb-10 ml-10 relative"
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card className="bg-slate-800 border-sky-500 overflow-hidden relative shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-sky-500 opacity-10 pointer-events-none"></div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-sky-400">{milestone.title}</h3>
                <p className="text-sky-300 text-sm">{milestone.date}</p>
                <p className="text-gray-300 mt-2">{milestone.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTimeline;
