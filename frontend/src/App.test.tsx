import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./services/api', () => ({
  createUser: vi.fn().mockResolvedValue({ id: 1, username: 'Guest', createdAt: '' }),
  getQuestion: vi.fn().mockResolvedValue({
    quoteId: 1,
    quoteText: 'Test quote',
    proposedAuthor: 'Test Author',
    options: null,
  }),
  submitAnswer: vi.fn().mockResolvedValue({ isCorrect: true, correctAuthor: 'Test Author' }),
  getAchievements: vi.fn().mockResolvedValue([]),
}));

describe('App smoke test', () => {
  test('renders the navbar', () => {
    render(<App />);
    expect(screen.getByText('Quote Quiz', { exact: false })).toBeInTheDocument();
  });

  test('navbar contains Quiz link', () => {
    render(<App />);
    const quizLinks = screen.getAllByText('Quiz');
    expect(quizLinks.length).toBeGreaterThan(0);
  });

  test('navbar contains Achievements link', () => {
    render(<App />);
    expect(screen.getByText('Achievements')).toBeInTheDocument();
  });

  test('navbar contains Settings link', () => {
    render(<App />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
