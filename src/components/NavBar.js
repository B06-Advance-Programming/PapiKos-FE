import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          PapiKos
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/wishlist" className={`nav-link ${location.pathname === '/wishlist' ? 'active' : ''}`}>
              Wishlist
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/auth/login" className={`nav-link ${location.pathname === '/auth/login' ? 'active' : ''}`}>
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/auth/register" className={`nav-link ${location.pathname === '/auth/register' ? 'active' : ''}`}>
              Register
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
