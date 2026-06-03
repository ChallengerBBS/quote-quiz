import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequireUser from './RequireUser';
import { useGame } from '../context/GameContext';

vi.mock('../context/GameContext', () => ({
  useGame: vi.fn(),
}));

const mockUseGame = vi.mocked(useGame);

function renderWithRouter(element: React.ReactElement) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe('RequireUser', () => {
  describe('loading state', () => {
    test('shows spinner while user data is loading', () => {
      mockUseGame.mockReturnValue({ userId: 1, isActive: true, isAdminLoading: true } as any);

      renderWithRouter(<RequireUser element={<div>Game Content</div>} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByText('Game Content')).not.toBeInTheDocument();
    });
  });

  describe('unauthenticated', () => {
    test('redirects to /create-user when userId is null', () => {
      mockUseGame.mockReturnValue({ userId: null, isActive: true, isAdminLoading: false } as any);

      renderWithRouter(<RequireUser element={<div>Game Content</div>} />);

      expect(screen.queryByText('Game Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Account Disabled')).not.toBeInTheDocument();
    });
  });

  describe('disabled user', () => {
    test('shows Account Disabled heading', () => {
      mockUseGame.mockReturnValue({ userId: 1, isActive: false, isAdminLoading: false } as any);

      renderWithRouter(<RequireUser element={<div>Game Content</div>} />);

      expect(screen.getByText('Account Disabled')).toBeInTheDocument();
    });

    test('shows contact administrator message', () => {
      mockUseGame.mockReturnValue({ userId: 1, isActive: false, isAdminLoading: false } as any);

      renderWithRouter(<RequireUser element={<div>Game Content</div>} />);

      expect(screen.getByText(/contact an administrator/i)).toBeInTheDocument();
    });

    test('does not render the protected content', () => {
      mockUseGame.mockReturnValue({ userId: 1, isActive: false, isAdminLoading: false } as any);

      renderWithRouter(<RequireUser element={<div>Game Content</div>} />);

      expect(screen.queryByText('Game Content')).not.toBeInTheDocument();
    });
  });

  describe('active user', () => {
    test('renders the protected element', () => {
      mockUseGame.mockReturnValue({ userId: 1, isActive: true, isAdminLoading: false } as any);

      renderWithRouter(<RequireUser element={<div>Game Content</div>} />);

      expect(screen.getByText('Game Content')).toBeInTheDocument();
    });

    test('does not show Account Disabled message', () => {
      mockUseGame.mockReturnValue({ userId: 1, isActive: true, isAdminLoading: false } as any);

      renderWithRouter(<RequireUser element={<div>Game Content</div>} />);

      expect(screen.queryByText('Account Disabled')).not.toBeInTheDocument();
    });
  });
});
