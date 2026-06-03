import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

interface RequireUserProps {
  element: React.ReactElement;
}

const RequireUser: React.FC<RequireUserProps> = ({ element }) => {
  const { userId, isActive, isAdminLoading } = useGame();

  if (isAdminLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (userId === null) {
    return <Navigate to="/create-user" replace />;
  }

  if (!isActive) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="card text-center shadow-sm" style={{ maxWidth: '480px', width: '100%' }}>
          <div className="card-body p-5">
            <div className="mb-3">
              <i className="bi bi-lock-fill text-danger" style={{ fontSize: '3rem' }}></i>
            </div>
            <h4 className="card-title mb-3">Account Disabled</h4>
            <p className="card-text text-muted">
              Your account has been disabled. Please contact an administrator to regain access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return element;
};

export default RequireUser;
