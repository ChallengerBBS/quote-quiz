export type GameMode = 'binary' | 'multiple-choice';

export interface QuizQuestion {
  quoteId: number;
  quoteText: string;
  proposedAuthor: string | null;
  options: string[] | null;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAuthor: string;
}

export interface User {
  id: number;
  username: string;
  createdAt: string;
  isActive: boolean;
  isAdmin: boolean;
}

export interface Quote {
  id: number;
  text: string;
  author: string;
  wrongOptions: string[];
}

export interface Achievement {
  id: number;
  quoteId: number;
  quoteText: string;
  answeredAuthor: string;
  correctAuthor: string;
  isCorrect: boolean;
  answeredAt: string;
}
