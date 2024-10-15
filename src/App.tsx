import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Navbar from './components/ui/Navbar';
import About from './About';
import Home from './Home';
import Place from './Place';
import Tetris from './Tetris';
import SowwyProto from './SowwyProto';
import './App.css';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        classNames="fade"
        timeout={300}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/place" element={<Place />} />
          <Route path="/games/tetris" element={<Tetris />} />
          <Route path="/proto/sowwy" element={<SowwyProto />} />
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