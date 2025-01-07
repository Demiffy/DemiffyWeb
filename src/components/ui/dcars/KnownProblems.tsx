'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaSearch, FaCar } from 'react-icons/fa';
import Image from 'next/image';
import classNames from 'classnames';

// Define Types
type Issue = {
  title: string;
  description: string;
  solution: string;
};

type CarProblem = {
  car: string;
  image: string;
  issues: Issue[];
};

// Sample Data
const problems: CarProblem[] = [
  {
    car: 'Tesla Model S Plaid',
    image: '/images/tesla-model-s.jpg',
    issues: [
      {
        title: 'Battery Degradation',
        description: 'Over time, the battery capacity may decrease, affecting range.',
        solution: 'Regular software updates and proper charging habits can help minimize degradation.',
      },
      {
        title: 'Touchscreen Responsiveness',
        description: 'Some users report occasional lag or unresponsiveness in the central touchscreen.',
        solution: 'Ensure your software is up to date. If problems persist, contact Tesla service.',
      },
    ],
  },
  {
    car: 'Porsche 911 GT3 RS',
    image: '/images/porsche-911-gt3-rs.jpg',
    issues: [
      {
        title: 'Brake Wear',
        description: 'High-performance carbon-ceramic brakes may wear faster under track conditions.',
        solution: 'Regular brake inspections and replacement when necessary. Consider steel brakes for heavy track use.',
      },
      {
        title: 'Tire Wear',
        description: 'Aggressive driving can lead to rapid tire wear, especially on the rear.',
        solution: 'Rotate tires regularly and monitor tread depth. Consider separate sets for track and street use.',
      },
    ],
  },
];

const IssueItem: React.FC<{
  issue: Issue;
  isOpen: boolean;
  toggle: () => void;
}> = ({ issue, isOpen, toggle }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
      <button
        className="w-full p-4 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-600"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={`issue-content-${issue.title}`}
      >
        <span className="text-lg font-semibold flex items-center">
          <FaCar className="mr-2 text-blue-400" />
          {issue.title}
        </span>
        <span className="text-xl">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`issue-content-${issue.title}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-700">
              <p className="mb-2">{issue.description}</p>
              <p className="font-semibold">Solution: {issue.solution}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function KnownProblems() {
  const [openIssues, setOpenIssues] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCar, setSelectedCar] = useState<string>('All');

  const toggleIssue = (issueKey: string) => {
    const newOpenIssues = new Set(openIssues);
    if (newOpenIssues.has(issueKey)) {
      newOpenIssues.delete(issueKey);
    } else {
      newOpenIssues.add(issueKey);
    }
    setOpenIssues(newOpenIssues);
  };

  const filteredProblems = useMemo(() => {
    return problems
      .filter((car) => selectedCar === 'All' || car.car === selectedCar)
      .map((car) => ({
        ...car,
        issues: car.issues.filter(
          (issue) =>
            issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.solution.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((car) => car.issues.length > 0);
  }, [searchTerm, selectedCar]);

  return (
    <section className="py-20 px-4 md:px-0 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-10 text-center select-none">Known Problems</h2>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-4 md:space-y-0 select-none">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Search issues"
            />
          </div>

          {/* Car Filter */}
          <div className="flex items-center space-x-4 select-none">
            <button
              className={classNames(
                'px-4 py-2 rounded-full flex items-center space-x-2 transition',
                {
                  'bg-blue-600 text-white': selectedCar === 'All',
                  'bg-gray-700 text-gray-300 hover:bg-gray-600': selectedCar !== 'All',
                }
              )}
              onClick={() => setSelectedCar('All')}
              aria-pressed={selectedCar === 'All'}
            >
              <FaCar />
              <span>All Cars</span>
            </button>
            {problems.map((car) => (
              <button
                key={car.car}
                className={classNames(
                  'px-4 py-2 rounded-full flex items-center space-x-2 transition',
                  {
                    'bg-blue-600 text-white': selectedCar === car.car,
                    'bg-gray-700 text-gray-300 hover:bg-gray-600': selectedCar !== car.car,
                  }
                )}
                onClick={() => setSelectedCar(car.car)}
                aria-pressed={selectedCar === car.car}
              >
                <FaCar />
                <span>{car.car}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-8">
          {filteredProblems.length === 0 ? (
            <p className="text-center text-gray-400">No problems found.</p>
          ) : (
            filteredProblems.map((car) => (
              <motion.div
                key={car.car}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Car Image */}
                  <div className="md:w-1/3">
                    <Image
                      src={car.image}
                      alt={car.car}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  </div>

                  {/* Car Problems */}
                  <div className="md:w-2/3 p-6">
                    <h3 className="text-2xl font-semibold mb-6">{car.car}</h3>
                    {car.issues.map((issue, index) => {
                      const issueKey = `${car.car}-${index}`;
                      return (
                        <IssueItem
                          key={issueKey}
                          issue={issue}
                          isOpen={openIssues.has(issueKey)}
                          toggle={() => toggleIssue(issueKey)}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}