import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Navbar from './components/ui/Navbar';
import About from './components/About';
import Home from './components/Home';
import WeatherApp from './components/WeatherAPI';
import LearningResources from './components/LearningResources';
import Contact from './components/Contact';
import NotFound from '../NotFound';
import './App.css';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/weather" element={<WeatherApp />} />
          <Route path="/resources" element={<LearningResources />} />
          <Route path="/404" element={<NotFound />} />

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
          <meta itemProp="name" content="Demiffy!" />
          <meta itemProp="description" content="What a dumbass, who coded this?" />
          <meta name="description" content="What a dumbass, who coded this?" />
          <meta itemProp="image" content="http://example.com/default.png" />
          <meta property="og:title" content="Demiffy!" />
          <meta property="og:description" content="What a dumbass, who coded this?" />
          <meta property="og:url" content="https://demiffy.com" />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="https://demiffy.com/plane.png" />
        </Helmet>
        <Navbar />
        <AnimatedRoutes />
      </Router>
    </HelmetProvider>
  );
}