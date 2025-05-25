import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // adjust path
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const { user, roles, logout } = useAuth();

  const isPemilik = roles.includes('PEMILIK');
  const isPenyewa = roles.includes('PENYEWA');
  const isAdmin = roles.includes('ADMIN');

  // Determine the home/dashboard link
  let homeLink = '/';
  if (user) {
    if (isAdmin) homeLink = '/admin/dashboard';
    else if (isPenyewa) homeLink = '/penyewa/dashboard';
    else if (isPemilik) homeLink = '/pemilik/dashboard';
  }

  // Payment path per role
  let paymentLink = null;
  if (isPenyewa) paymentLink = '/penyewa/payment';
  else if (isPemilik) paymentLink = '/pemilik/payment';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={homeLink} className="navbar-logo">PapiKos</Link>
        <ul className="nav-menu">

          {/* Dynamic Home link */}
          <li className="nav-item">
            <Link
              to={homeLink}
              className={`nav-link ${location.pathname === homeLink ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>

          {/* Not logged in: show Login/Register */}
          {!user && (
            <>
              <li className="nav-item">
                <Link
                  to="/auth/login"
                  className={`nav-link ${location.pathname === '/auth/login' ? 'active' : ''}`}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/auth/register"
                  className={`nav-link ${location.pathname === '/auth/register' ? 'active' : ''}`}>
                  Register
                </Link>
              </li>
            </>
          )}

          {/* Show Payment link only if Penyewa or Pemilik */}
          {paymentLink && (
            <li className="nav-item">
              <Link
                to={paymentLink}
                className={`nav-link ${location.pathname === paymentLink ? 'active' : ''}`}>
                Payment
              </Link>
            </li>
          )}

          {/* Logged in as Penyewa: show Wishlist + Logout */}
          {isPenyewa && (
            <>
              <li className="nav-item">
                <Link
                  to="/wishlist"
                  className={`nav-link ${location.pathname === '/wishlist' ? 'active' : ''}`}>
                  Wishlist
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={logout}>Logout</button>
              </li>
            </>
          )}

          {/* Logged in as Pemilik: just show Logout (already showed Payment above) */}
          {isPemilik && !isPenyewa && (
            <>
              <li className="nav-item">
                <Link to="/kupon" className="nav-link">Kupon</Link>
              </li>
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={logout}>Logout</button>
              </li>
            </>
          )}


          {/* Logged in as Admin: just show Logout */}
          {isAdmin && !isPenyewa && !isPemilik && (
            <li className="nav-item">
              <button className="nav-link logout-btn" onClick={logout}>Logout</button>
            </li>
          )}

        </ul>
      </div>
    </nav>
  );
};

export default NavBar;