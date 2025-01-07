'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaDollarSign, FaEuroSign } from 'react-icons/fa';
import Image from 'next/image';

// Define Types
type Variant = {
  name: string;
  price: number;
  features: string[];
};

type Region = {
  name: string;
  currency: 'USD' | 'EUR';
  symbol: string;
};

type Car = {
  name: string;
  image: string;
  variants: Variant[];
  regions: Region[];
};

// Sample Data
const cars: Car[] = [
  {
    name: 'Tesla Model S Plaid',
    image: '/images/tesla-model-s.jpg',
    variants: [
      {
        name: 'Tri Motor',
        price: 129990,
        features: ['0-60 mph in 1.99s', '390 mi range', 'Top Speed: 200 mph'],
      },
    ],
    regions: [
      { name: 'United States', currency: 'USD', symbol: '$' },
      { name: 'Europe', currency: 'EUR', symbol: '€' },
    ],
  },
  {
    name: 'Porsche 911 GT3 RS',
    image: '/images/porsche-911-gt3-rs.jpg',
    variants: [
      {
        name: 'Standard',
        price: 223800,
        features: ['0-60 mph in 3.0s', '296 hp', 'Lightweight Construction'],
      },
      {
        name: 'Weissach Package',
        price: 241800,
        features: ['Additional Aerodynamics', 'Carbon Fiber Components', 'Enhanced Suspension'],
      },
    ],
    regions: [
      { name: 'United States', currency: 'USD', symbol: '$' },
      { name: 'Europe', currency: 'EUR', symbol: '€' },
    ],
  },
  {
    name: 'Toyota Supra MK5',
    image: '/images/toyota-supra-mk5.jpg',
    variants: [
      {
        name: '2.0L Turbocharged',
        price: 43540,
        features: ['0-60 mph in 4.1s', '255 hp', '6-Speed Manual Transmission'],
      },
      {
        name: '3.0L Turbocharged',
        price: 52500,
        features: ['0-60 mph in 3.9s', '382 hp', '8-Speed Automatic Transmission'],
      },
    ],
    regions: [
      { name: 'United States', currency: 'USD', symbol: '$' },
      { name: 'Europe', currency: 'EUR', symbol: '€' },
    ],
  },
];

export default function PricingAndVariants() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region>(cars[0].regions[0]);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedRegion.currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-20 px-4 md:px-0 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-10 text-center select-none">Pricing and Variants</h2>
        
        {/* Region Selector */}
        <div className="mb-12 flex justify-center space-x-4 select-none">
          {cars[0].regions.map((region) => (
            <button
              key={region.name}
              className={`flex items-center px-4 py-2 rounded-full transition 
                ${selectedRegion.name === region.name 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}
              `}
              onClick={() => setSelectedRegion(region)}
              aria-pressed={selectedRegion.name === region.name}
            >
              {region.name === 'United States' ? <FaDollarSign className="mr-2" /> : <FaEuroSign className="mr-2" />}
              {region.name}
            </button>
          ))}
        </div>

        {/* Cars List */}
        <div className="space-y-8">
          {cars.map((car, index) => (
            <motion.div
              key={car.name}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Car Image */}
                <div className="md:w-1/3">
                  <Image
                    src={car.image}
                    alt={car.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>

                {/* Car Details */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-semibold">{car.name}</h3>
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="text-2xl focus:outline-none"
                      aria-expanded={openAccordion === index}
                      aria-controls={`accordion-content-${index}`}
                    >
                      {openAccordion === index ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {openAccordion === index && (
                      <motion.div
                        id={`accordion-content-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        {car.variants.map((variant) => (
                          <div key={variant.name} className="mb-6 border-b border-gray-700 pb-4">
                            <h4 className="text-xl font-semibold">{variant.name}</h4>
                            <p className="text-lg mt-2">{formatPrice(variant.price)}</p>
                            <ul className="mt-2 list-disc list-inside text-gray-300">
                              {variant.features.map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}