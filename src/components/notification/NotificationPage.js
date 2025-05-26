import React, { useState, useEffect, useCallback } from 'react';
import { getUserNotifications } from '../../api/notificationApi';
import { useAuth } from '../../contexts/AuthContext';
import NotificationItem from './NotificationItem';
import './NotificationPage.css';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const data = await getUserNotifications(user.id, { 
        bypassCache: isRefresh,
        maxRetries: 3
      });
      
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle refresh
  const handleRefresh = () => {
    fetchNotifications(true);
  };

  return (
    <div className="notification-page">
      <div className="notification-page-header">
        <h1>Your Notifications</h1>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="notification-page-content">
        {loading && !isRefreshing ? (
          <div className="notification-page-loading">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="notification-page-error">
            <p>{error}</p>
            <button onClick={handleRefresh}>Try Again</button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-page-empty">
            <i className="fas fa-bell-slash"></i>
            <p>You don't have any notifications yet</p>
          </div>
        ) : (
          <div className="notification-list-container">
            {notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
