import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Navbar from './components/ui/Navbar';
import Home from './components/pages/Home';
import NotFound from './components/pages/NotFound';
import KSBCTOS from './components/pages/KSBC/KSBC-TOS';
import KSBCPP from './components/pages/KSBC/KSBC-Privacypolicy';
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
        <Helmet>
          <title>Demiffy!</title>
          <meta name="description" content="Demiffy homepage." />
        </Helmet>
        <Navbar />
        <AnimatedRoutes />
      </Router>
    </HelmetProvider>
  );
}
