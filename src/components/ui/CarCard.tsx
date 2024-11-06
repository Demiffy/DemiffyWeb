import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Car {
  id: number;
  name: string;
  price: string;
  image: string;
  productionStart: number;
  productionEnd: number;
}

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-400/50 transition-all duration-300 transform hover:-translate-y-1">
      <img src={car.image} alt={car.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{car.name}</h2>
        <p className="text-cyan-400 mb-4">Price: {car.price}</p>
        <p className="text-gray-400 mb-4">Production: {car.productionStart} - {car.productionEnd}</p>
        <Link to={`/car/${car.id}`}>
          <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 flex items-center justify-center">
            View Details
            <ChevronRight className="ml-2" size={18} />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CarCard;