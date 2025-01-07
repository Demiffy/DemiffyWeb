'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  FaBolt,
  FaTachometerAlt,
  FaBatteryFull,
  FaWeightHanging,
  FaCogs,
} from 'react-icons/fa';

// Type Definitions
interface Specs {
  [key: string]: string;
}

interface Car {
  name: string;
  year: number;
  tagline: string;
  image: string;
  specs: Specs;
  interestingFact: string;
}

// Sample Data
const cars: Car[] = [
  {
    name: 'Tesla Model S Plaid',
    year: 2023,
    tagline: 'Beyond Ludicrous',
    image: '/tesla-model-s-plaid.jpg',
    specs: {
      acceleration: '0-60 mph in 1.99 seconds',
      topSpeed: '200 mph',
      range: '396 miles (EPA est.)',
      battery: '100 kWh Lithium-ion',
      power: '1,020 hp',
      torque: '1,050 lb-ft',
    },
    interestingFact:
      'The Tesla Model S Plaid is the fastest production car in the world, achieving unparalleled acceleration and speed.',
  },
  {
    name: 'Porsche 911 GT3 RS',
    year: 2023,
    tagline: 'Born in Flacht',
    image: '/porsche-911-gt3-rs.jpg',
    specs: {
      power: '518 hp',
      torque: '346 lb-ft',
      weight: '3,268 lbs',
      engine: '4.0L Naturally Aspirated Flat-6',
      transmission: '7-speed PDK (Dual-Clutch)',
    },
    interestingFact:
      'The Porsche 911 GT3 RS features active aerodynamics that adjust in real-time to optimize performance on both street and track.',
  },
  {
    name: 'Toyota Supra MK5',
    year: 2023,
    tagline: 'The Legend Returns',
    image: '/toyota-supra-mk5.jpg',
    specs: {
      engines: '2.0L Turbo I4 / 3.0L Turbo I6',
      power: 'Up to 382 hp',
      acceleration: '0-60 mph in 3.9 seconds (3.0L)',
      weight: '3,400 lbs',
      transmission: '8-speed automatic',
    },
    interestingFact:
      'The Toyota Supra MK5 marks the return of the iconic Supra nameplate after a 17-year hiatus, blending classic design with modern performance.',
  },
];

const specIconMapping: { [key: string]: JSX.Element } = {
  acceleration: <FaBolt className="inline-block mr-2 text-blue-500" />,
  topspeed: <FaTachometerAlt className="inline-block mr-2 text-blue-500" />,
  range: <FaBatteryFull className="inline-block mr-2 text-green-500" />,
  battery: <FaBatteryFull className="inline-block mr-2 text-yellow-500" />,
  power: <FaCogs className="inline-block mr-2 text-purple-500" />,
  torque: <FaBolt className="inline-block mr-2 text-blue-500" />,
  engines: <FaCogs className="inline-block mr-2 text-purple-500" />,
  weight: <FaWeightHanging className="inline-block mr-2 text-gray-500" />,
  engine: <FaCogs className="inline-block mr-2 text-purple-500" />,
  transmission: <FaCogs className="inline-block mr-2 text-purple-500" />,
};

const SpecItem: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const key = label.toLowerCase().replace(/ /g, '');
  const Icon = specIconMapping[key] || <FaCogs className="inline-block mr-2 text-white" />;

  return (
    <div className="flex items-center mb-2">
      {Icon}
      <span className="font-semibold">{label.replace(/([A-Z])/g, ' $1').trim()}: </span>
      <span className="ml-1">{value}</span>
    </div>
  );
};

export default function CarOverview() {
  const [hoveredCar, setHoveredCar] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 md:px-0 bg-gray-800">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map((car, index) => (
            <motion.div
            key={car.name}
            className="relative overflow-hidden rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-default select-none"
            onHoverStart={() => setHoveredCar(index)}
            onHoverEnd={() => setHoveredCar(null)}
            >
            <Image
                src={car.image}
                alt={car.name}
                width={800}
                height={600}
                className="w-full h-[400px] object-cover"
                priority
            />
            {/* Overlay */}
            <motion.div
                className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-end p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredCar === index ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-3xl font-bold mb-2">{car.name}</h2>
                <p className="text-xl mb-1">{car.year}</p>
                <p className="text-lg mb-4 italic">{car.tagline}</p>
                <ul className="text-sm mb-4">
                {Object.entries(car.specs).map(([key, value]) => (
                    <li key={key} className="mb-1">
                    <SpecItem label={key} value={value} />
                    </li>
                ))}
                </ul>
                {/* Interesting Fact */}
                <div className="text-sm text-gray-300">
                <span className="font-semibold">Interesting Fact: </span>
                {car.interestingFact}
                </div>
            </motion.div>
        </motion.div>
        ))}
      </div>
    </section>
  );
}