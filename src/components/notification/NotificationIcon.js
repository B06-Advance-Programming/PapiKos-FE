import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getNotificationCount, getUserNotifications } from '../../api/notificationApi';
import { readNotificationStorage } from '../../utils/readNotificationStorage';
import { useAuth } from '../../contexts/AuthContext';
import './NotificationIcon.css';

const NotificationIcon = ({ onClick }) => {
  const [count, setCount] = useState(0);
  const [allNotifications, setAllNotifications] = useState([]);
  const { user } = useAuth();
  const timerRef = useRef(null);

  const fetchNotificationCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Fetch all notifications to calculate unread count locally
      const notifications = await getUserNotifications(user.id, { bypassCache: true });
      setAllNotifications(notifications);
      
      // Calculate unread count using local storage
      const unreadCount = readNotificationStorage.getUnreadCount(notifications);
      setCount(unreadCount);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      // Fallback to backend count if there's an error
      try {
        const backendCount = await getNotificationCount(user.id, { bypassCache: true });
        setCount(backendCount);
      } catch (fallbackError) {
        console.error('Failed to fetch fallback count:', fallbackError);
      }
    }
  }, [user?.id]);
  const handleClick = () => {
    // Mark all current notifications as read when clicking to view
    if (allNotifications.length > 0) {
      const notificationIds = allNotifications.map(n => n.id);
      readNotificationStorage.markMultipleAsRead(notificationIds);
      setCount(0); // Immediately update count
    }
    
    if (onClick) {
      onClick();
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotificationCount();
      timerRef.current = setInterval(fetchNotificationCount, 30000);
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [fetchNotificationCount, user?.id]);
  return (
    <div className="notification-icon" onClick={handleClick}>
      <i className="fas fa-bell"></i>
      {count > 0 && (
        <span className="notification-badge">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};

export default NotificationIcon;
