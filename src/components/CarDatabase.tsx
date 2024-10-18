import { useState, useEffect } from 'react';
import { carData, CarData } from '../data/carData';
import CarCard from '../components/ui/CarCard';
import SearchBar from '../components/ui/SearchBar';
import { Menu, X } from 'lucide-react';

export default function CarDatabase() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedCars, setSavedCars] = useState<number[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedCars') || '[]');
    setSavedCars(saved);
  }, []);

  const filteredCars = carData.filter((car: CarData) => {
    const term = searchTerm.toLowerCase();

    if (term.startsWith('filter:saved')) {
      return savedCars.includes(car.id);
    }

    if (term.startsWith('filter:')) {
      const manufacturer = term.split('filter:')[1];
      return car.name.toLowerCase().includes(manufacturer);
    }

    return car.name.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-16">
      {/* Navigation */}
      <header className="bg-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Car List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map((car: CarData) => {
            const firstModelYearKey = Math.min(...Object.keys(car.modelYears).map(year => parseInt(year)));
            const lastModelYearKey = Math.max(...Object.keys(car.modelYears).map(year => parseInt(year)));

            return (
              <CarCard
                key={car.id}
                car={{
                  id: car.id,
                  name: car.name,
                  price: car.price,
                  image: car.images[0],
                  productionStart: firstModelYearKey,
                  productionEnd: lastModelYearKey,
                }}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}