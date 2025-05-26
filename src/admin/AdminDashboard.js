import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminNotificationPanel from '../components/notification/AdminNotificationPanel';

const AdminDashboard = () => {
  const location = useLocation();
  const isNotificationsPage = location.pathname === '/admin/notifications';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {isNotificationsPage ? (
        <div>
          <h1 style={{ marginBottom: '30px', color: '#1e293b', fontWeight: '700' }}>
            Admin Notification Dashboard
          </h1>
          <p style={{ marginBottom: '30px', color: '#64748b' }}>
            Send notifications to all users or specific users in the system.
          </p>
          <AdminNotificationPanel />
        </div>
      ) : (
        <div>
          <h1>Hi, I'm admin!</h1>
          <p style={{ marginTop: '20px', color: '#64748b' }}>
            Welcome to the admin dashboard. Use the navigation to access different admin functions.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;