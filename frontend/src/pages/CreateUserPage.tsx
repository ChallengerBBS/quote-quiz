import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { createUser } from '../services/api';
import { useGame } from '../context/GameContext';

const CreateUserPage: React.FC = () => {
  const { userId, setUserId } = useGame();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (userId !== null) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await createUser(username.trim());
      setUserId(user.id);
      navigate('/');
    } catch {
      setError('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2 className="mb-4">Create Your Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={1}
                maxLength={100}
                autoFocus
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading || !username.trim()}
            >
              {loading ? 'Creating...' : 'Start Playing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserPage;
