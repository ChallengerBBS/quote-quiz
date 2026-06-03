import React from 'react';
import { useGame } from '../context/GameContext';
import { GameMode } from '../types';

const SettingsPage: React.FC = () => {
  const { mode, setMode } = useGame();

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
  };

  return (
    <div className="container py-5" style={{ maxWidth: '560px' }}>
      <h1 className="text-center mb-4 fw-bold">Settings</h1>

      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h5 className="card-title mb-4">Game Settings</h5>

          <div className="mb-3">
            <label className="form-label fw-semibold">Current Mode</label>
            <p className="text-muted">
              <span className="badge bg-primary fs-6">
                {mode === 'binary' ? 'Binary' : 'Multiple Choice'}
              </span>
            </p>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold d-block">Select Game Mode</label>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="gameMode"
                id="modeBinary"
                value="binary"
                checked={mode === 'binary'}
                onChange={() => handleModeChange('binary')}
              />
              <label className="form-check-label" htmlFor="modeBinary">
                <strong>Binary</strong>
                <span className="text-muted ms-2">
                  — A quote and an author are shown; answer Yes or No.
                </span>
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="gameMode"
                id="modeMultiple"
                value="multiple-choice"
                checked={mode === 'multiple-choice'}
                onChange={() => handleModeChange('multiple-choice')}
              />
              <label className="form-check-label" htmlFor="modeMultiple">
                <strong>Multiple Choice</strong>
                <span className="text-muted ms-2">
                  — A quote is shown; pick the correct author from three options.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
