import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Heart, ChevronRight, AlertTriangle, ShoppingCart, ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { carData, CarData } from '../data/carData';
import Footer from './ui/Footer';

export default function CarDetails() {
  const { carId } = useParams<{ carId: string }>();
  const [car, setCar] = useState<CarData | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [shareText, setShareText] = useState<string>('Share');


  useEffect(() => {
    const selectedCar = carData.find((c) => c.id === parseInt(carId || '0'));
    if (selectedCar) {
      setCar(selectedCar);
      setActiveTab(Math.min(...Object.keys(selectedCar.modelYears).map(Number)));
    }
  }, [carId]);

  useEffect(() => {
    if (car) {
      const savedCars = JSON.parse(localStorage.getItem('savedCars') || '[]');
      if (savedCars.includes(car.id)) {
        setIsSaved(true);
      }
    }
  }, [car]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareText('Link copied!');
    setTimeout(() => setShareText('Share'), 2000);
  };

  const handleSave = () => {
    let savedCars = JSON.parse(localStorage.getItem('savedCars') || '[]');
    if (isSaved) {
      savedCars = savedCars.filter((savedCarId: number) => savedCarId !== car?.id);
      setIsSaved(false);
    } else {
      savedCars.push(car?.id);
      setIsSaved(true);
    }
    localStorage.setItem('savedCars', JSON.stringify(savedCars));
  };

  if (!car) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white pt-16 pb-8">
      {/* Back to Cars Link */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/cardatabase" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center">
          <ArrowLeft className="inline-block mr-2" />
          Back to Cars
        </Link>
      </div>
  
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Carousel */}
          <div>
            <div className="relative">
              <img
                src={car.images[activeImage]}
                alt={`${car.name} - Image ${activeImage + 1}`}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <button
                onClick={() => setActiveImage((prev) => (prev === 0 ? car.images.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setActiveImage((prev) => (prev === car.images.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="mt-4 flex justify-center space-x-2">
              {car.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-3 h-3 rounded-full ${activeImage === index ? 'bg-cyan-400' : 'bg-gray-600'}`}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleShare}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 flex items-center"
              >
                <Share2 className="mr-2" size={18} />
                {shareText}
              </button>
              <button
                onClick={handleSave}
                className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 flex items-center`}
              >
                <Heart className={`mr-2 ${isSaved ? 'text-red-500' : 'text-white'}`} size={18} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
  
          {/* Car Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{car.name}</h1>
            <p className="text-cyan-400 text-xl mb-4">{car.price}</p>
            <p className="mb-6">{car.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(car.modelYears).map((year) => (
                <button
                  key={year}
                  onClick={() => setActiveTab(parseInt(year))}
                  className={`px-4 py-2 rounded-full flex-shrink-0 ${
                    activeTab === parseInt(year) ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Power</p>
                <p className="text-lg font-semibold">{car.modelYears[activeTab].power}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Torque</p>
                <p className="text-lg font-semibold">{car.modelYears[activeTab].torque}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">0-100 km/h</p>
                <p className="text-lg font-semibold">{car.modelYears[activeTab].acceleration}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Top Speed</p>
                <p className="text-lg font-semibold">{car.modelYears[activeTab].topSpeed}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Fuel Economy</p>
                <p className="text-lg font-semibold">{car.modelYears[activeTab].fuelEconomy}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Weight</p>
                <p className="text-lg font-semibold">{car.modelYears[activeTab].weight}</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* Key Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {car.features[activeTab].map((feature, index) => (
              <li key={index} className="bg-gray-800 p-4 rounded-lg flex items-center">
                <ChevronRight className="text-cyan-400 mr-2" size={18} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
  
        {/* Common Issues */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Common Issues</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <ul className="space-y-2">
              {car.commonIssues[activeTab].map((issue, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="text-yellow-500 mr-2 flex-shrink-0 mt-1" size={18} />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
  
        {/* Purchase Links */}
        <div className="mt-12 pb-12">
          <h2 className="text-2xl font-bold mb-4">Available for Purchase</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {car.purchaseLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-4 rounded-lg flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                <span>{link.name}</span>
                <ShoppingCart className="text-cyan-400" size={18} />
              </a>
            ))}
          </div>
        </div>
      </main>
  
      {/* Footer */}
      <Footer />
    </div>
  );
}  