import React from 'react';
import './NotificationDetailModal.css';

const NotificationDetailModal = ({ notification, isOpen, onClose }) => {
  if (!isOpen || !notification) return null;
  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="notification-modal-overlay" onClick={handleOverlayClick}>
      <div className="notification-modal">        <div className="notification-modal-header">
          <h2>Detail Notifikasi</h2>
          <button className="notification-modal-close" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>        <div className="notification-modal-content">
          <div className="notification-modal-message">
            <h3>Pesan</h3>
            <p>{notification.message}</p>
          </div>

          <div className="notification-modal-metadata">
            <div className="notification-modal-date">
              <h4>Diterima</h4>
              <p>{formatFullDate(notification.createdAt)}</p>
            </div>

            {notification.kostName && (
              <div className="notification-modal-kost">
                <h4>Properti Terkait</h4>
                <p>{notification.kostName}</p>
              </div>
            )}
          </div>
        </div>        <div className="notification-modal-footer">
          <button className="notification-modal-ok" onClick={handleClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
