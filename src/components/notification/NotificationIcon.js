import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getNotificationCount } from '../../api/notificationApi';
import { useAuth } from '../../contexts/AuthContext';
import './NotificationIcon.css';

const NotificationIcon = ({ onClick }) => {
  const [count, setCount] = useState(0);
  const { user } = useAuth();
  const timerRef = useRef(null);

  const fetchNotificationCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const notificationCount = await getNotificationCount(user.id, { bypassCache: true });
      setCount(notificationCount);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    }
  }, [user?.id]);

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
    <div className="notification-icon" onClick={onClick}>
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
