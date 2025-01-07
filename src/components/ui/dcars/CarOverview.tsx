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
  year: string;
  tagline: string;
  image: string;
  specs: Specs;
  interestingFact: string;
}

const cars: Car[] = [
  {
    name: 'Corvette C5',
    year: "1997 - 2004",
    tagline: 'The Birth of a New Era',
    image: '/carImages/corvetteC5/c5front.png',
    specs: {
      engine: '5.7L LS1 V8',
      power: '345 hp - 350 hp',
      acceleration: '0-100 km/h in 4.5 seconds',
      topSpeed: '277 km/h',
      transmission: '4-speed automatic / 6-speed manual',
      weight: '1,472 kg (approx.)',
    },
    interestingFact:
      'The Corvette C5 was the first to use the LS1 engine, which became a legend in automotive performance circles. It also introduced a transaxle design for better weight distribution.',
  },
  {
    name: 'Toyota Supra MK5',
    year: "2019 - Present",
    tagline: 'The Legend Returns',
    image: '/toyota-supra-mk5.jpg',
    specs: {
      engines: '2.0L Turbo I4 / 3.0L Turbo I6',
      power: '255 hp (2.0L) / 382 hp (3.0L)',
      acceleration: '0-100 km/h in 5.0 seconds (2.0L) / 3.9 seconds (3.0L)',
      topSpeed: '250 km/h (electronically limited)',
      transmission: '8-speed automatic',
      weight: '1,443 kg (2.0L) / 1,542 kg (3.0L)',
    },
    interestingFact:
      'The Toyota Supra MK5 was co-developed with BMW and shares its platform with the BMW Z4. It marked the return of the Supra after a 17-year hiatus, reigniting its status as an icon.',
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
    <section className="py-20 px-4 md:px-0 bg-secondary-color">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
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