import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. POST ke /auth/login
      const loginRes = await fetch('https://staging-inthekost-b6afc6b23ff0.herokuapp.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!loginRes.ok) {
        const msg = await loginRes.text();
        throw new Error(msg || 'Login failed');
      }

      const { token, expiresIn } = await loginRes.json();
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('tokenExpire', Date.now() + expiresIn);

      // 2. GET /users/me dengan token
      const userRes = await fetch('https://staging-inthekost-b6afc6b23ff0.herokuapp.com/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userRes.ok) {
        throw new Error('Failed to fetch user info');
      }

      const user = await userRes.json();

      // 3. Ambil role dan redirect sesuai role
      const roleNames = user.roles.map(r => r.name);

      if (roleNames.includes('PEMILIK')) {
        navigate('/pemilik/dashboard');
      } else if (roleNames.includes('PENYEWA')) {
        navigate('/penyewa/dashboard');
      } else {
        navigate('/'); // default fallback
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary">Login</button>
        </form>
        <p className="small-text">
          Don't have an account? <Link to="/auth/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
