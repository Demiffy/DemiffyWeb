import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Navbar from './components/ui/Navbar';
import About from './components/About';
import Home from './components/Home';
import PlaceRetired from './components/Place';
import ASynCPlace from './components/ASynCPlace';
import ZoomedPlace from './components/ZoomedOutView';
import Tetris from './components/Tetris';
import Sudoku from './components/Sudoku';
import TwoThousandFortyEightGame from './components/2048Game';
import SowwyProto from './components/SowwyProto';
import CarDatabase from './components/CarDatabase';
import CarDetails from './components/CarDetails';
import FileConverter from './components/FileConverter';
import GifMaker from './components/GifMaker';
import AllLinks from './components/AllLinks';
import ImageResizer from './components/ImageResizer';
import DemiNotes from './components/DemiNotes';
import Destabilize from './components/Desinote';
import DiscordUser from './components/DiscordUser';
import CanvasTest from './components/canvastest';
import DCars from './components/DCars';
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
          <Route path="/placeretired" element={<PlaceRetired />} />
          <Route path="/ASynC" element={<ASynCPlace />} />
          <Route path="/ASynC/zoomedout" element={<ZoomedPlace />} />
          <Route path="/games/tetris" element={<Tetris />} />
          <Route path="/games/sudoku" element={<Sudoku />} />
          <Route path="/games/2048" element={<TwoThousandFortyEightGame />} />
          <Route path="/proto/sowwy" element={<SowwyProto />} />
          <Route path="/cdata" element={<CarDatabase />} />
          <Route path="/cdata/cid/:carId" Component={CarDetails} />
          <Route path="/ic" element={<FileConverter />} />
          <Route path="/gif" element={<GifMaker />} />
          <Route path="/links" element={<AllLinks />} />
          <Route path="/img" element={<ImageResizer />} />
          <Route path="/discord" element={<DiscordUser />} />
          <Route path="/deminotes" element={<DemiNotes />} />
          <Route path="/DN" element={<Destabilize />} />
          <Route path="/canvas" element={<CanvasTest />} />
          <Route path="/dcars" element={<DCars />} />
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