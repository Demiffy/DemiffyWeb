import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Navbar from './components/ui/Navbar';
import About from './About';
import Home from './Home';
import Place from './Place';
import Tetris from './Tetris';
import Sudoku from './components/Sudoku';
import TwoThousandFortyEightGame from './components/2048Game';
import SowwyProto from './SowwyProto';
import CarDatabase from './components/CarDatabase';
import CarDetails from './components/CarDetails';
import FileConverter from './components/FileConverter';
import AllLinks from './components/AllLinks';
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
          <Route path="/games/sudoku" element={<Sudoku />} />
          <Route path="/games/2048" element={<TwoThousandFortyEightGame />} />
          <Route path="/proto/sowwy" element={<SowwyProto />} />
          <Route path="/cardatabase" element={<CarDatabase />} />
          <Route path="/car/:carId" Component={CarDetails} />
          <Route path="/ic" element={<FileConverter />} />
          <Route path="/links" element={<AllLinks />} />
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