import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './modules/home/Home';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import NotFound from './modules/NotFound'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="*" element={<NotFound />} /> {}
      </Routes>
    </Router>
  );
}

export default App;