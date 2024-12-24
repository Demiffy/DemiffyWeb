import { motion } from "framer-motion";
import { Card, CardContent } from "./card";

interface Milestone {
  date: string;
  title: string;
  description: string;
  image?: string;
}

const MilestoneTimeline = ({ milestones }: { milestones: Milestone[] }) => {
  const highestDate = milestones[0]?.date;
  const lowestDate = milestones[milestones.length - 1]?.date;

  return (
    <div className="container py-20 relative">
      <h2 className="text-3xl font-bold mb-10 text-center text-sky-400 select-none">
        Milestones
      </h2>

      {/* Display highest and lowest dates */}
      <div className="absolute top-[8rem] select-none">
        <p className="text-sky-400 text-sm font-bold">{highestDate}</p>
      </div>
      <div className="absolute bottom-[5rem] select-none">
        <p className="text-sky-400 text-sm font-bold">{lowestDate}</p>
      </div>

      {/* Milestone Timeline */}
      <div className="relative border-l-2 border-sky-500">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.date}
            className="mb-10 ml-10"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card className="bg-slate-800 border-sky-500 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-sky-400">{milestone.title}</h3>
                    <p className="text-sky-300 text-sm">{milestone.date}</p>
                    <p className="text-gray-300 mt-2 text-lg">{milestone.description}</p>
                  </div>

                  {/* Display image if available */}
                  {milestone.image && (
                    <div className="ml-4 w-32 h-32">
                      <img
                        src={milestone.image}
                        alt={milestone.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTimeline;
