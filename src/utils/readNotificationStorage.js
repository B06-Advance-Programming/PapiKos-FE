// Local storage utility for managing read notifications
const READ_NOTIFICATIONS_KEY = 'papikos_read_notifications';

export const readNotificationStorage = {
  // Get all read notification IDs
  getReadNotifications: () => {
    try {
      const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading notification storage:', error);
      return [];
    }
  },

  // Mark a notification as read
  markAsRead: (notificationId) => {
    try {
      const readNotifications = readNotificationStorage.getReadNotifications();
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readNotifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Check if a notification is read
  isRead: (notificationId) => {
    const readNotifications = readNotificationStorage.getReadNotifications();
    return readNotifications.includes(notificationId);
  },

  // Mark multiple notifications as read
  markMultipleAsRead: (notificationIds) => {
    try {
      const readNotifications = readNotificationStorage.getReadNotifications();
      const newReadNotifications = [...new Set([...readNotifications, ...notificationIds])];
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(newReadNotifications));
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
    }
  },

  // Get count of unread notifications from a list
  getUnreadCount: (notifications) => {
    const readNotifications = readNotificationStorage.getReadNotifications();
    return notifications.filter(notification => 
      !readNotifications.includes(notification.id)
    ).length;
  },

  // Clear all read notifications (for testing/admin purposes)
  clearAll: () => {
    try {
      localStorage.removeItem(READ_NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('Error clearing notification storage:', error);
    }
  }
};
