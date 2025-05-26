import React from 'react';
import { readNotificationStorage } from '../../utils/readNotificationStorage';
import './NotificationItem.css';

const NotificationItem = ({ notification, onClick }) => {
  // Format the timestamp manually
  const timeAgo = formatTimeAgo(notification.createdAt);
  const isRead = readNotificationStorage.isRead(notification.id);
    // Function to format time ago without using date-fns
  function formatTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    
    // Convert to seconds, minutes, hours, days
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 30) {
      const date = past.toLocaleDateString('id-ID');
      return `pada ${date}`;
    } else if (diffDays > 0) {
      return diffDays === 1 ? 'kemarin' : `${diffDays} hari yang lalu`;
    } else if (diffHours > 0) {
      return `${diffHours} jam yang lalu`;
    } else if (diffMins > 0) {
      return `${diffMins} menit yang lalu`;
    } else {
      return 'baru saja';
    }
  }
  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div 
      className={`notification-item ${isRead ? 'read' : 'unread'}`}
      onClick={handleClick}
    >
      <div className="notification-status-indicator">
        {!isRead && <div className="unread-dot"></div>}
      </div>
      <div className="notification-content">
        <p>{notification.message}</p>
        <span className="notification-time">{timeAgo}</span>
      </div>
      <div className="notification-arrow">
        <i className="fas fa-chevron-right"></i>
      </div>
    </div>
  );
};

export default NotificationItem;
