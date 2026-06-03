import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const NavBar: React.FC = () => {
  const { isAdmin } = useGame();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand fw-bold">Quote Quiz</span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                Quiz
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/achievements"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                Achievements
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                Settings
              </NavLink>
            </li>
            {isAdmin && (
              <>
                <li className="nav-item">
                  <span className="nav-link text-secondary px-2">|</span>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  >
                    Users
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin/quotes"
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  >
                    Quotes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin/user-games"
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  >
                    User Games
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
