// src/components/VetteBase.tsx

import { useState, useEffect } from 'react';
import Footer from './ui/Footer';
import { Filter } from 'lucide-react';

interface CarData {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  location: string;
  listingUrl: string;
}

export default function VetteBase () {
  const [searchTerm] = useState('');
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [locationFilter, setLocationFilter] = useState<string>('');

  const STORAGE_KEY = 'carListings';

  useEffect(() => {
    const loadAndFetchCars = async () => {
      // Load cars from localStorage
      const storedData = localStorage.getItem(STORAGE_KEY);
      let storedCars: CarData[] = [];
      if (storedData) {
        try {
          storedCars = JSON.parse(storedData);
          setCars(storedCars);
        } catch (e) {
          console.error("Failed to parse stored car data:", e);
        }
      }

      setLoading(false);

      // Fetch fresh data from the server
      try {
        const response = await fetch("http://109.80.40.13:8000/listings");
        if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);

        const result = await response.json();
        const fetchedCars: CarData[] = result.map((listing: any, index: number) => ({
          id: index + 1,
          name: cleanName(listing.Name),
          description: listing.Details,
          price: parsePrice(listing.Price),
          image: listing.ImageUrl,
          location: listing.Location || "N/A",
          listingUrl: listing.ListingUrl || "#",
        }));

        // Compare fetched data with stored data
        if (JSON.stringify(fetchedCars) !== JSON.stringify(storedCars)) {
          setCars(fetchedCars);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedCars));
        }
      } catch (err) {
        if (storedCars.length === 0) {
          setError(err instanceof Error ? err.message : "Unknown error");
        } else {
          console.error("Failed to fetch data:", err);
        }
      }
    };

    loadAndFetchCars();
  }, []);

  const cleanName = (name: string): string => {
    let cleaned = name.trim();
    const prefixes = ["Nové", "Jiný"];
    prefixes.forEach(prefix => {
      if (cleaned.startsWith(prefix)) {
        cleaned = cleaned.substring(prefix.length).trim();
      }
    });
    return cleaned;
  };

  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/[\d\s,]+/);
    if (match) {
      const numericStr = match[0].replace(/\s/g, '').replace(/,/g, '');
      return parseInt(numericStr, 10);
    }
    return 0;
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMin = minPrice === '' || car.price >= minPrice;
    const matchesMax = maxPrice === '' || car.price <= maxPrice;
    const matchesLocation = locationFilter === '' || car.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesMin && matchesMax && matchesLocation;
  });

  return (
    <div className="min-h-screen flex flex-col text-white pt-16">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdvancedSearchBar
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-700 h-16 w-16"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">Error: {error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredCars.length > 0 ? (
              filteredCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400">No cars found.</div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function AdvancedSearchBar({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  locationFilter,
  setLocationFilter,
}: {
  minPrice: number | '';
  setMinPrice: (value: number | '') => void;
  maxPrice: number | '';
  setMaxPrice: (value: number | '') => void;
  locationFilter: string;
  setLocationFilter: (value: string) => void;
}) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">FILTERS</h2>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1">
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-300 mb-1">
              Minimum Price (€)
            </label>
            <input
              type="number"
              id="minPrice"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="e.g., 10000"
              min="0"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-300 mb-1">
              Maximum Price (€)
            </label>
            <input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="e.g., 50000"
              min="0"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="e.g., Klötze"
          />
        </div>
      </div>
    </div>
  );
}

function CarCard({ car }: { car: CarData }) {
  return (
    <a href={car.listingUrl} target="_blank" rel="noopener noreferrer" className="block">
      <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg bg-gray-900 hover:shadow-2xl transition-shadow">
        <div className="relative">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-56 object-cover"
            loading="lazy"
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          <div className="absolute top-2 right-2 bg-cyan-600 text-white text-xs px-2 py-1 rounded">
            € {car.price.toLocaleString()}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2 text-cyan-400">{car.name}</h3>
          <p className="text-gray-300 mb-3">{car.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm flex items-center">
              <Filter className="mr-1 text-cyan-400" size={16} />
              {car.location}
            </span>
            <span className="text-cyan-400 font-medium hover:underline">
              View Listing →
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}