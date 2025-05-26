import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUserNotifications } from '../../api/notificationApi';
import { useAuth } from '../../contexts/AuthContext';
import NotificationItem from './NotificationItem';
import './NotificationDropdown.css';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const dropdownRef = useRef(null);

  // Memoize fetchNotifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserNotifications(user.id, { bypassCache: true });
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, loading]);

  useEffect(() => {
    // Add click event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchNotifications();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, fetchNotifications]);

  // Only render if dropdown is open
  if (!isOpen) return null;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-header">
        <h3>Notifications</h3>
        <Link to="/notifications" onClick={onClose} className="view-all-link">
          View All
        </Link>
      </div>
      
      <div className="notification-list">
        {loading ? (
          <div className="notification-loading">Loading notifications...</div>
        ) : error ? (
          <div className="notification-error">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">You have no notifications</div>
        ) : (
          notifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
