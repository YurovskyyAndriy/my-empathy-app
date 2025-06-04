import { type FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Chat from './pages/Chat';
import Analyze from './pages/Analyze';
import Instructions from './pages/Instructions';
import Materials from './pages/Materials';

const Router: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/analyze" element={<Analyze />} />
      <Route path="/instructions" element={<Instructions />} />
      <Route path="/materials" element={<Materials />} />
    </Routes>
  );
};

export default Router; 