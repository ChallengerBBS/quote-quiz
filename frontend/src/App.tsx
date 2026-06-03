import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GameProvider } from './context/GameContext';
import NavBar from './components/NavBar';
import AdminRoute from './components/AdminRoute';
import RequireUser from './components/RequireUser';
import MainPage from './pages/MainPage';
import SettingsPage from './pages/SettingsPage';
import AchievementsPage from './pages/AchievementsPage';
import UsersPage from './pages/UsersPage';
import QuotesPage from './pages/QuotesPage';
import UserGamesPage from './pages/UserGamesPage';
import CreateUserPage from './pages/CreateUserPage';

const App: React.FC = () => {
  return (
    <GameProvider>
      <BrowserRouter>
        <NavBar />
        <main>
          <Routes>
            <Route path="/create-user" element={<CreateUserPage />} />
            <Route path="/" element={<RequireUser element={<MainPage />} />} />
            <Route path="/settings" element={<RequireUser element={<SettingsPage />} />} />
            <Route path="/achievements" element={<RequireUser element={<AchievementsPage />} />} />
            <Route path="/admin/users" element={<RequireUser element={<AdminRoute element={<UsersPage />} />} />} />
            <Route path="/admin/quotes" element={<RequireUser element={<AdminRoute element={<QuotesPage />} />} />} />
            <Route path="/admin/user-games" element={<RequireUser element={<AdminRoute element={<UserGamesPage />} />} />} />
          </Routes>
        </main>
      </BrowserRouter>
    </GameProvider>
  );
};

export default App;
