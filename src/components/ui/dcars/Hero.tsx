'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowDown, FaCar } from 'react-icons/fa';

export default function Hero() {
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }
  }, []);

  const scrollToExplore = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {hasWindow && (
        <video
          src="/herovid.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="top-0 left-0 w-full h-full object-cover z-[-1]"
        >
          Your browser does not support the video tag.
        </video>
      )}

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-center px-4 select-none">
        {/* Animated Title */}
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-wide drop-shadow-lg"
        >
          Discover Your Dream Machines
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg md:text-2xl text-gray-300 mt-4 mb-8 max-w-3xl"
        >
          Experience the future of automotive engineering with luxury, style, and performance.
        </motion.p>

        {/* Call-to-Action Buttons */}
        <div className="flex space-x-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center px-6 py-3 bg-white text-black font-semibold text-lg md:text-xl rounded-full shadow-lg hover:shadow-xl hover:bg-gray-200 transition-all transform hover:scale-105"
            onClick={scrollToExplore}
            aria-label="Scroll to Explore"
          >
            Scroll to Explore <FaArrowDown className="ml-2" />
          </motion.button>

          <motion.a
            href="#learn-more"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center px-6 py-3 bg-transparent border border-white text-white font-semibold text-lg md:text-xl rounded-full shadow-lg hover:bg-white hover:text-black transition-all transform hover:scale-105"
            aria-label="Learn More"
          >
            Learn More <FaCar className="ml-2" />
          </motion.a>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        viewport={{ once: true }}
        className="absolute bottom-24 left-0 right-0 flex justify-center space-x-8 px-4 select-none"
      >
        <div className="flex flex-col items-center">
          <FaCar className="text-white text-3xl mb-2" />
          <h3 className="text-white text-lg font-semibold">Luxury Design</h3>
          <p className="text-gray-300 text-sm">Sleek and sophisticated aesthetics.</p>
        </div>
        <div className="flex flex-col items-center">
          <FaCar className="text-white text-3xl mb-2" />
          <h3 className="text-white text-lg font-semibold">Advanced Technology</h3>
          <p className="text-gray-300 text-sm">Cutting-edge automotive innovations.</p>
        </div>
        <div className="flex flex-col items-center">
          <FaCar className="text-white text-3xl mb-2" />
          <h3 className="text-white text-lg font-semibold">Unmatched Performance</h3>
          <p className="text-gray-300 text-sm">Powerful and efficient engines.</p>
        </div>
      </motion.div>

      {/* Decorative Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
    </section>
  );
}