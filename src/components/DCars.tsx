import Hero from '../components/ui/dcars/Hero';
import CarOverview from '../components/ui/dcars/CarOverview';
import SpecsAndFeatures from '../components/ui/dcars/SpecsAndFeatures';
import Gallery from '../components/ui/dcars/Gallery';
import PricingAndVariants from '../components/ui/dcars/PricingAndVariants';
import KnownProblems from '../components/ui/dcars/KnownProblems';

export default function DCars() {
  return (
    <main className="font-inter bg-gray-900 text-white min-h-screen">
      <Hero />
      <CarOverview />
      <SpecsAndFeatures />
      <Gallery />
      <PricingAndVariants />
      <KnownProblems />
    </main>
  );
}