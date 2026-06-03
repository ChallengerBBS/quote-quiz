import React, { useState, useEffect, useCallback } from 'react';
import { User, Achievement } from '../types';
import { getUsers, getAchievements } from '../services/api';

type FilterOption = 'all' | 'correct' | 'wrong';
type SortOption = 'date' | 'correct' | 'incorrect';

const UserGamesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await getUsers();
        setUsers(data);
        if (data.length > 0) setSelectedUserId(data[0].id);
      } catch {
        setError('Failed to load users.');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchAchievements = useCallback(async () => {
    if (selectedUserId === null) return;
    setLoadingAchievements(true);
    setError(null);
    try {
      const filterCorrect: boolean | undefined =
        filter === 'correct' ? true : filter === 'wrong' ? false : undefined;
      const data = await getAchievements(selectedUserId, sortBy, filterCorrect);
      setAchievements(data);
    } catch {
      setError('Failed to load game history.');
    } finally {
      setLoadingAchievements(false);
    }
  }, [selectedUserId, filter, sortBy]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const totalCount = achievements.length;
  const correctCount = achievements.filter((a) => a.isCorrect).length;
  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4">User Game History</h1>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {/* User Selector */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label htmlFor="userSelect" className="form-label fw-semibold">
            Select User
          </label>
          {loadingUsers ? (
            <div className="spinner-border spinner-border-sm text-primary ms-2" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          ) : (
            <select
              id="userSelect"
              className="form-select"
              value={selectedUserId ?? ''}
              onChange={(e) => {
                setFilter('all');
                setSortBy('date');
                setSelectedUserId(Number(e.target.value));
              }}
            >
              {users.length === 0 && <option value="">No users available</option>}
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} (ID: {u.id}){!u.isActive ? ' — Disabled' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selectedUser && !loadingAchievements && (
        <>
          {/* Summary Cards */}
          <div className="d-flex flex-wrap gap-3 mb-4">
            <div className="card text-center shadow-sm" style={{ minWidth: '140px' }}>
              <div className="card-body py-3">
                <h4 className="fw-bold mb-0">{totalCount}</h4>
                <small className="text-muted">Total Games</small>
              </div>
            </div>
            <div className="card text-center shadow-sm border-success" style={{ minWidth: '140px' }}>
              <div className="card-body py-3">
                <h4 className="fw-bold mb-0 text-success">{correctCount}</h4>
                <small className="text-muted">Correct</small>
              </div>
            </div>
            <div className="card text-center shadow-sm border-danger" style={{ minWidth: '140px' }}>
              <div className="card-body py-3">
                <h4 className="fw-bold mb-0 text-danger">{totalCount - correctCount}</h4>
                <small className="text-muted">Wrong</small>
              </div>
            </div>
            {totalCount > 0 && (
              <div className="card text-center shadow-sm border-primary" style={{ minWidth: '140px' }}>
                <div className="card-body py-3">
                  <h4 className="fw-bold mb-0 text-primary">
                    {Math.round((correctCount / totalCount) * 100)}%
                  </h4>
                  <small className="text-muted">Accuracy</small>
                </div>
              </div>
            )}
          </div>

          {/* Filter & Sort Controls */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <div className="btn-group" role="group" aria-label="Filter games">
              <button
                type="button"
                className={`btn ${filter === 'all' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn ${filter === 'correct' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setFilter('correct')}
              >
                Correct only
              </button>
              <button
                type="button"
                className={`btn ${filter === 'wrong' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => setFilter('wrong')}
              >
                Wrong only
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <label htmlFor="sortSelect" className="form-label mb-0 text-nowrap">
                Sort by:
              </label>
              <select
                id="sortSelect"
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{ minWidth: '160px' }}
              >
                <option value="date">Date (default)</option>
                <option value="correct">Correct first</option>
                <option value="incorrect">Wrong first</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Loading Achievements */}
      {loadingAchievements && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {/* Achievements Table */}
      {!loadingAchievements && selectedUser && (
        <>
          {achievements.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p className="fs-5">No game history found for this user.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Quote</th>
                    <th>Answered</th>
                    <th>Correct Answer</th>
                    <th className="text-center">Result</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map((a) => (
                    <tr key={a.id}>
                      <td style={{ maxWidth: '300px' }}>
                        <span className="fst-italic">"{a.quoteText}"</span>
                      </td>
                      <td>{a.answeredAuthor}</td>
                      <td>{a.correctAuthor}</td>
                      <td className="text-center">
                        {a.isCorrect ? (
                          <span className="text-success fw-bold fs-5">✓</span>
                        ) : (
                          <span className="text-danger fw-bold fs-5">✗</span>
                        )}
                      </td>
                      <td className="text-nowrap">{formatDate(a.answeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loadingUsers && users.length === 0 && (
        <div className="text-center text-muted py-5">
          <p className="fs-5">No users found. Create users first.</p>
        </div>
      )}
    </div>
  );
};

export default UserGamesPage;
