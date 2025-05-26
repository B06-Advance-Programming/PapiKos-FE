import React, { useState } from 'react';
import { broadcastNotification, createNotification, deleteNotification } from '../../api/notificationApi';
import { getUserIdByEmail } from '../../api/userApi';
import './AdminNotificationPanel.css';

const AdminNotificationPanel = () => {
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [deleteNotificationId, setDeleteNotificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('broadcast'); // 'broadcast', 'single', or 'delete'
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    
    if (mode === 'single' && !userEmail.trim()) {
      setError('Please enter a user email');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      if (mode === 'broadcast') {
        const result = await broadcastNotification(message);
        setSuccess(`Notification broadcast to ${result.recipientCount} users`);
      } else {
        // Convert email to user ID before sending notification
        const userId = await getUserIdByEmail(userEmail);
        await createNotification(userId, message);
        setSuccess(`Notification sent to ${userEmail} successfully`);
      }
      
      // Clear form after success
      setMessage('');
      if (mode === 'single') {
        setUserEmail('');
      }
    } catch (err) {
      console.error('Notification error:', err);
      setError(err.message || 'Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    
    if (!deleteNotificationId.trim()) {
      setError('Please enter a notification ID');
      return;
    }
    
    try {
      setDeleteLoading(true);
      setError(null);
      setSuccess(null);
      
      await deleteNotification(deleteNotificationId);
      setSuccess(`Notification ${deleteNotificationId} deleted successfully`);
      
      // Clear form after success
      setDeleteNotificationId('');
    } catch (err) {
      console.error('Delete notification error:', err);
      setError(err.message || 'Failed to delete notification. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
  return (
    <div className="admin-notification-panel">
      <h2>Manage Notifications</h2>
      
      <div className="notification-mode-selector">
        <button 
          className={`mode-button ${mode === 'broadcast' ? 'active' : ''}`}
          onClick={() => setMode('broadcast')}
        >
          Broadcast to All Users
        </button>
        <button 
          className={`mode-button ${mode === 'single' ? 'active' : ''}`}
          onClick={() => setMode('single')}
        >
          Send to Specific User
        </button>
        <button 
          className={`mode-button ${mode === 'delete' ? 'active' : ''}`}
          onClick={() => setMode('delete')}
        >
          Delete Notification
        </button>      </div>
      
      {mode === 'delete' ? (
        <form onSubmit={handleDeleteSubmit}>
          <div className="form-group">
            <label htmlFor="deleteNotificationId">Notification ID</label>
            <input
              type="text"
              id="deleteNotificationId"
              value={deleteNotificationId}
              onChange={(e) => setDeleteNotificationId(e.target.value)}
              placeholder="Enter notification ID to delete"
              disabled={deleteLoading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <button 
            type="submit" 
            className="delete-button"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Notification'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          {mode === 'single' && (
            <div className="form-group">
              <label htmlFor="userEmail">User Email</label>
              <input
                type="email"
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter user email address"
                disabled={loading}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows="4"
              disabled={loading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <button 
            type="submit" 
            className="send-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : mode === 'broadcast' ? 'Broadcast Notification' : 'Send Notification'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminNotificationPanel;
