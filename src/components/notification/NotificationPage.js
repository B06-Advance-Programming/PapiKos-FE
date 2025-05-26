import React, { useState, useEffect, useCallback } from 'react';
import { getUserNotifications } from '../../api/notificationApi';
import { useAuth } from '../../contexts/AuthContext';
import { readNotificationStorage } from '../../utils/readNotificationStorage';
import NotificationItem from './NotificationItem';
import NotificationDetailModal from './NotificationDetailModal';
import './NotificationPage.css';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read immediately when clicked
    readNotificationStorage.markAsRead(notification.id);
    // Force re-render to update UI
    setNotifications(prev => [...prev]);
    
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };
  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  // Mark all visible notifications as read when page loads
  useEffect(() => {
    if (notifications.length > 0) {
      const notificationIds = notifications.map(n => n.id);
      readNotificationStorage.markMultipleAsRead(notificationIds);
    }
  }, [notifications]);

  return (
    <div className="notification-page">      <div className="notification-page-header">
        <h1>Notifikasi Anda</h1>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="notification-page-content">        {loading && !isRefreshing ? (
          <div className="notification-page-loading">
            <div className="spinner"></div>
            <p>Memuat notifikasi...</p>
          </div>
        ) : error ? (
          <div className="notification-page-error">
            <p>{error}</p>
            <button onClick={handleRefresh}>Coba Lagi</button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-page-empty">
            <i className="fas fa-bell-slash"></i>
            <p>Anda belum memiliki notifikasi</p>
          </div>) : (
          <div className="notification-list-container">
            {notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default NotificationPage;
