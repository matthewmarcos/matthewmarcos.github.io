import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import LightsOut from './pages/LightsOut';
import SlidingGame from './pages/SlidingGame';
import SlidingSolver from './pages/SlidingSolver';
import TicTacToe from './pages/TicTacToe';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/lights-out" element={<LightsOut />} />
        <Route path="/sliding" element={<SlidingGame />} />
        <Route path="/sliding-solver" element={<SlidingSolver />} />
        <Route path="/tic-tac-toe" element={<TicTacToe />} />
      </Routes>
    </HashRouter>
  );
}
