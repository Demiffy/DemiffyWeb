import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import Home from './components/pages/Home';
import NotFound from './components/pages/NotFound';
import KSBCTOS from './components/pages/KSBC/KSBC-TOS';
import KSBCPP from './components/pages/KSBC/KSBC-Privacypolicy';
import Grid from './components/pages/Grid';
import AirplanesLog from './components/pages/SpottersLog/Airplanes';
import CarsLog from './components/pages/SpottersLog/Cars';
import GR86Page from './components/pages/SpottersLog/GR86';
import MinecraftControl from './components/pages/MinecraftControl';
import './App.css';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/privacy-policy" element={<KSBCPP />} />
          <Route path="/terms-of-service" element={<KSBCTOS />} />
          <Route path="/grid" element={<Grid />} />
          <Route path="/gallery/planes" element={<AirplanesLog />} />
          <Route path="/gallery/cars" element={<CarsLog />} />
          <Route path="/gallery/cars/gr86" element={<GR86Page />} />
          <Route path="/mc" element={<MinecraftControl />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Helmet>
          <title>Demiffy!</title>
          <meta name="description" content="Demiffy homepage." />
        </Helmet>
        <Navbar />
        <div className="pt-16 min-h-screen flex flex-col">
          <div className="flex-1">
            <AnimatedRoutes />
          </div>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}
