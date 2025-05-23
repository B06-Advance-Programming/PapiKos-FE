import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './modules/home/Home';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import NotFound from './modules/NotFound';
import WishlistPage from './components/wishlist/WishlistPage';
import NavBar from './components/NavBar';
import './App.css';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;