import React from 'react';
import { useGame } from '../context/GameContext';

interface AdminRouteProps {
  element: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ element }) => {
  const { isAdmin, isAdminLoading } = useGame();

  if (isAdminLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-3">403 — Access Denied</h2>
        <p className="text-muted">You need admin privileges to view this page.</p>
      </div>
    );
  }

  return element;
};

export default AdminRoute;
