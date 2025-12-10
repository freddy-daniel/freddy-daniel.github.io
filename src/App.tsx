import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './components/pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="experience" element={<Home />} />
          <Route path="skills" element={<Home />} />
          <Route path="projects" element={<Home />} />
          <Route path="demos" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
