import React from 'react';
import './NotificationItem.css';

const NotificationItem = ({ notification }) => {
  // Format the timestamp manually
  const timeAgo = formatTimeAgo(notification.createdAt);
  
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
      const date = past.toLocaleDateString();
      return `on ${date}`;
    } else if (diffDays > 0) {
      return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'just now';
    }
  }

  return (
    <div className="notification-item">
      <div className="notification-content">
        <p>{notification.message}</p>
        <span className="notification-time">{timeAgo}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
