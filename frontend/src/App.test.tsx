import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the api module to prevent actual HTTP calls during tests
jest.mock('./services/api', () => ({
  createUser: jest.fn().mockResolvedValue({ id: 1, username: 'Guest', createdAt: '' }),
  getQuestion: jest.fn().mockResolvedValue({
    quoteId: 1,
    quoteText: 'Test quote',
    proposedAuthor: 'Test Author',
    options: null,
  }),
  submitAnswer: jest.fn().mockResolvedValue({ isCorrect: true, correctAuthor: 'Test Author' }),
  getAchievements: jest.fn().mockResolvedValue([]),
}));

describe('App smoke test', () => {
  test('renders the navbar', () => {
    render(<App />);
    expect(screen.getByText('Quiz Quiz', { exact: false }) || screen.getByText('Quiz')).toBeTruthy();
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
