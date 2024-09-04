import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FlightSimulatorDashboard = () => {
  const [heading, setHeading] = useState(90);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeading(prev => (prev + Math.floor(Math.random() * 10 - 5)) % 360);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="compass-container">
      <h3 className="compass-title">Heading: {Math.round(heading)}°</h3>
      <div className="compass">
        <div className="compass-directions">
          <span className="north">N</span>
          <span className="east">E</span>
          <span className="south">S</span>
          <span className="west">W</span>
        </div>
        <motion.img
          src="/plane.png"
          alt="Plane"
          className="plane"
          animate={{ rotate: heading }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <div className="compass-glow"></div>
      </div>
    </div>
  );
};

export default FlightSimulatorDashboard;
