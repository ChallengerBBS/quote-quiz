import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

interface RequireUserProps {
  element: React.ReactElement;
}

const RequireUser: React.FC<RequireUserProps> = ({ element }) => {
  const { userId, isAdminLoading } = useGame();

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

  return element;
};

export default RequireUser;
