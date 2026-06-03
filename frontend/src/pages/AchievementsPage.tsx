import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getAchievements } from '../services/api';
import { Achievement } from '../types';

type FilterOption = 'all' | 'correct' | 'wrong';
type SortOption = 'date' | 'correct' | 'incorrect';

const AchievementsPage: React.FC = () => {
  const { userId } = useGame();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  useEffect(() => {
    if (!userId) return;

    const fetchAchievements = async () => {
      setLoading(true);
      setError(null);
      try {
        const filterCorrect: boolean | undefined =
          filter === 'correct' ? true : filter === 'wrong' ? false : undefined;
        const data = await getAchievements(userId, sortBy, filterCorrect);
        setAchievements(data);
      } catch (err) {
        setError('Failed to load achievements. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId, filter, sortBy]);

  if (!userId) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning d-inline-block" role="alert">
          No user session found.
        </div>
      </div>
    );
  }

  const totalCount = achievements.length;
  const correctCount = achievements.filter((a) => a.isCorrect).length;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4 fw-bold">Achievements</h1>

      {/* Summary */}
      <div className="d-flex justify-content-center gap-4 mb-4">
        <div className="card text-center shadow-sm" style={{ minWidth: '140px' }}>
          <div className="card-body py-3">
            <h4 className="fw-bold mb-0">{totalCount}</h4>
            <small className="text-muted">Total Answers</small>
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
      </div>

      {/* Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        {/* Filter buttons */}
        <div className="btn-group" role="group" aria-label="Filter achievements">
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

        {/* Sort select */}
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

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-warning text-center" role="alert">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          {achievements.length === 0 ? (
            <div className="text-center text-muted py-5">
              <p className="fs-5">No achievements found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Quote Text</th>
                    <th>Your Answer</th>
                    <th>Correct Answer</th>
                    <th className="text-center">Result</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map((achievement) => (
                    <tr key={achievement.id}>
                      <td style={{ maxWidth: '300px' }}>
                        <span className="fst-italic">"{achievement.quoteText}"</span>
                      </td>
                      <td>{achievement.answeredAuthor}</td>
                      <td>{achievement.correctAuthor}</td>
                      <td className="text-center">
                        {achievement.isCorrect ? (
                          <span className="text-success fw-bold fs-5">✓</span>
                        ) : (
                          <span className="text-danger fw-bold fs-5">✗</span>
                        )}
                      </td>
                      <td className="text-nowrap">{formatDate(achievement.answeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AchievementsPage;
