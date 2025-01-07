'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { FaCar, FaTenge, FaTachometerAlt, FaBolt, FaCogs, FaWeightHanging, FaBatteryFull, FaScrewdriver, FaArrowsAltH } from 'react-icons/fa';
import Image from 'next/image';
import classNames from 'classnames';

// Define Types
type Specs = {
  [key: string]: string;
};

type Variant = {
  name: string;
  specs: Specs;
};

type Car = {
  name: string;
  image: string;
  variants: Variant[];
};

// Sample Data
const cars: Car[] = [
  {
    name: 'Tesla Model S Plaid',
    image: '/images/tesla-model-s.jpg',
    variants: [
      {
        name: 'Tri Motor',
        specs: {
          powertrain: 'All-Electric',
          motors: 'Three Permanent Magnet Synchronous Motors',
          battery: '100 kWh Lithium-ion',
          horsepower: '1,020 hp',
          torque: '1,050 lb-ft',
          acceleration: '0-60 mph in 1.99 seconds',
          topSpeed: '200 mph',
          range: '396 miles (EPA est.)',
          weight: '4,766 lbs',
          transmission: 'Single-speed fixed gear',
          efficiency: '101 MPGe (combined)',
          chargingSpeed: 'Up to 250 kW (Supercharger V3)',
          driveTrain: 'All-Wheel Drive',
          suspension: 'Adaptive Air Suspension',
          brakes: 'Carbon-ceramic',
        },
      },
    ],
  },
  {
    name: 'Porsche 911 GT3 RS',
    image: '/images/porsche-911-gt3-rs.jpg',
    variants: [
      {
        name: '4.0L Naturally Aspirated',
        specs: {
          engine: '4.0L Naturally Aspirated Flat-6',
          horsepower: '518 hp @ 8,400 rpm',
          torque: '346 lb-ft @ 6,300 rpm',
          acceleration: '0-60 mph in 3.0 seconds',
          topSpeed: '184 mph',
          weight: '3,268 lbs',
          transmission: '7-speed PDK (Dual-Clutch)',
          efficiency: '15 mpg (city) / 19 mpg (highway)',
          driveTrain: 'Rear-Wheel Drive',
          suspension: 'Active Suspension Management (PASM)',
          brakes: 'Porsche Ceramic Composite Brake (PCCB)',
          aerodynamics: 'Active aerodynamics with DRS (Drag Reduction System)',
          chassis: 'Aluminum-steel composite',
          tires: 'Front: 275/35 ZR 20, Rear: 335/30 ZR 21',
        },
      },
    ],
  },
  {
    name: 'Toyota Supra MK5',
    image: '/images/toyota-supra-mk5.jpg',
    variants: [
      {
        name: '2.0L Turbocharged Inline-4',
        specs: {
          engine: '2.0L Turbocharged Inline-4',
          horsepower: '255 hp @ 5,000-6,500 rpm',
          torque: '295 lb-ft @ 1,550-4,400 rpm',
          acceleration: '0-60 mph in 5.0 seconds',
          topSpeed: '155 mph (electronically limited)',
          weight: '3,181 lbs',
          transmission: '8-speed automatic',
          efficiency: '25 mpg (city) / 32 mpg (highway)',
          driveTrain: 'Rear-Wheel Drive',
          suspension: 'Double-joint spring strut front axle; multi-link rear axle',
          brakes: 'Ventilated discs',
          chassis: 'Aluminum and steel',
          tires: 'Front: 255/40 ZR18, Rear: 275/40 ZR18',
        },
      },
      {
        name: '3.0L Turbocharged Inline-6',
        specs: {
          engine: '3.0L Turbocharged Inline-6',
          horsepower: '382 hp @ 5,800-6,500 rpm',
          torque: '368 lb-ft @ 1,800-5,000 rpm',
          acceleration: '0-60 mph in 3.9 seconds',
          topSpeed: '155 mph (electronically limited)',
          weight: '3,400 lbs',
          transmission: '8-speed automatic',
          efficiency: '22 mpg (city) / 30 mpg (highway)',
          driveTrain: 'Rear-Wheel Drive',
          suspension: 'Adaptive Variable Sport Suspension',
          brakes: 'Brembo 4-piston calipers (front)',
          chassis: 'Aluminum and steel',
          tires: 'Front: 255/35 ZR19, Rear: 275/35 ZR19',
        },
      },
    ],
  },
];

const specIcons: { [key: string]: JSX.Element } = {
  powertrain: <FaBolt className="inline-block mr-2 text-blue-400" />,
  motors: <FaTenge className="inline-block mr-2 text-green-400" />,
  battery: <FaBatteryFull className="inline-block mr-2 text-yellow-400" />,
  horsepower: <FaTachometerAlt className="inline-block mr-2 text-red-400" />,
  torque: <FaCogs className="inline-block mr-2 text-purple-400" />,
  acceleration: <FaArrowsAltH className="inline-block mr-2 text-pink-400" />,
  topSpeed: <FaTachometerAlt className="inline-block mr-2 text-indigo-400" />,
  range: <FaBatteryFull className="inline-block mr-2 text-green-400" />,
  weight: <FaWeightHanging className="inline-block mr-2 text-gray-400" />,
  transmission: <FaScrewdriver className="inline-block mr-2 text-orange-400" />,
  efficiency: <FaCogs className="inline-block mr-2 text-teal-400" />,
  chargingSpeed: <FaBolt className="inline-block mr-2 text-blue-400" />,
  driveTrain: <FaCar className="inline-block mr-2 text-blue-600" />,
  suspension: <FaCogs className="inline-block mr-2 text-purple-600" />,
  brakes: <FaCogs className="inline-block mr-2 text-red-600" />,
  aerodynamics: <FaCogs className="inline-block mr-2 text-indigo-600" />,
  chassis: <FaCogs className="inline-block mr-2 text-gray-600" />,
  tires: <FaCogs className="inline-block mr-2 text-yellow-600" />,
};

const SpecCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const icon = specIcons[label.toLowerCase()] || <FaCogs className="inline-block mr-2 text-white" />;
  return (
    <motion.div
      className="bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
      whileHover={{ scale: 1.05 }}
    >
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        {icon}
        {label.replace(/([A-Z])/g, ' $1').trim()}
      </h3>
      <p className="text-gray-200">{value}</p>
    </motion.div>
  );
};

export default function SpecsAndFeatures() {
  const [selectedVariant, setSelectedVariant] = useState<{ [key: string]: number }>({
    'Tesla Model S Plaid': 0,
    'Porsche 911 GT3 RS': 0,
    'Toyota Supra MK5': 0,
  });


  return (
    <section className="py-20 px-4 md:px-0 bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-10 text-center select-none">Specs and Features</h2>
        <Tab.Group>
          <Tab.List className="flex flex-wrap space-x-1 rounded-xl bg-gray-700 p-1 mb-8 justify-center select-none">
            {cars.map((car) => (
              <Tab
                key={car.name}
                className={({ selected }) =>
                  classNames(
                    'w-full sm:w-auto px-4 py-2.5 text-sm font-medium leading-5 text-white rounded-lg',
                    selected
                      ? 'bg-gray-900 shadow'
                      : 'bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )
                }
              >
                {car.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {cars.map((car, carIdx) => (
              <Tab.Panel key={car.name}>
                <div className="flex flex-col lg:flex-row items-center lg:items-start">
                  {/* Car Image */}
                  <div className="w-full lg:w-1/3 mb-8 lg:mb-0 lg:pr-8">
                    <Image
                      src={car.image}
                      alt={car.name}
                      width={500}
                      height={300}
                      className="rounded-lg shadow-lg"
                      priority
                    />
                  </div>
                  {/* Variant Selection and Specs */}
                  <div className="w-full lg:w-2/3">
                    {/* Variant Selection */}
                    <div className="mb-6">
                      <label htmlFor={`variant-select-${carIdx}`} className="block text-sm font-medium text-gray-300 mb-2 select-none">
                        Select Variant:
                      </label>
                      <select
                        id={`variant-select-${carIdx}`}
                        className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 select-none"
                        value={selectedVariant[car.name]}
                        onChange={(e) =>
                          setSelectedVariant({
                            ...selectedVariant,
                            [car.name]: parseInt(e.target.value),
                          })
                        }
                        aria-label={`Select variant for ${car.name}`}
                      >
                        {car.variants.map((variant, variantIdx) => (
                          <option key={variant.name} value={variantIdx}>
                            {variant.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Specs Grid */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {Object.entries(car.variants[selectedVariant[car.name]].specs).map(([key, value]) => (
                        <SpecCard key={key} label={key} value={value} />
                      ))}
                    </motion.div>
                  </div>
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </section>
  );
}