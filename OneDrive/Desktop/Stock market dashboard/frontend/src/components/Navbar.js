import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#333', color: '#fff' }}>
      <h2>StockDash</h2>
      <div>
        <Link to="/dashboard" style={{ color: '#fff', marginRight: '1rem' }}>Dashboard</Link>
        
        {/* Only show Admin link if user role is admin */}
        {user?.role === 'admin' && (
          <Link to="/admin" style={{ color: '#ffcc00', marginRight: '1rem' }}>Admin Panel</Link>
        )}

        {user ? (
          <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
        ) : (
          <Link to="/login" style={{ color: '#fff' }}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;