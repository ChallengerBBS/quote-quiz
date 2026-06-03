import axios from 'axios';
import { GameMode, QuizQuestion, AnswerResult, Achievement, User, Quote } from '../types';

const apiClient = axios.create({
  baseURL: '',
});

export interface AnswerSubmitRequest {
  userId: number;
  quoteId: number;
  mode: GameMode;
  proposedAuthor: string | null;
  binaryAnswer: 'yes' | 'no' | null;
  selectedAuthor: string | null;
}

export const getQuestion = async (mode: GameMode): Promise<QuizQuestion> => {
  const response = await apiClient.get<QuizQuestion>(`/api/quiz/question?mode=${mode}`);
  return response.data;
};

export const submitAnswer = async (body: AnswerSubmitRequest): Promise<AnswerResult> => {
  const response = await apiClient.post<AnswerResult>('/api/answers', body);
  return response.data;
};

export const getAchievements = async (
  userId: number,
  sortBy?: string,
  filterCorrect?: boolean
): Promise<Achievement[]> => {
  const params = new URLSearchParams();
  params.set('userId', String(userId));
  if (sortBy) params.set('sortBy', sortBy);
  if (filterCorrect !== undefined) params.set('filterCorrect', String(filterCorrect));
  const response = await apiClient.get<Achievement[]>(`/api/achievements?${params.toString()}`);
  return response.data;
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/api/users');
  return response.data;
};

export const createUser = async (username: string): Promise<User> => {
  const response = await apiClient.post<User>('/api/users', { username });
  return response.data;
};

export const updateUser = async (id: number, username: string): Promise<User> => {
  const response = await apiClient.put<User>(`/api/users/${id}`, { username });
  return response.data;
};

export const disableUser = async (id: number): Promise<void> => {
  await apiClient.patch(`/api/users/${id}/disable`);
};

export const enableUser = async (id: number): Promise<void> => {
  await apiClient.patch(`/api/users/${id}/enable`);
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/users/${id}`);
};

export const setUserAdmin = async (id: number, isAdmin: boolean): Promise<void> => {
  await apiClient.patch(`/api/users/${id}/admin`, { isAdmin });
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await apiClient.get<User>(`/api/users/${id}`);
  return response.data;
};

// Quotes
export const getQuotes = async (): Promise<Quote[]> => {
  const response = await apiClient.get<Quote[]>('/api/quotes');
  return response.data;
};

export const createQuote = async (text: string, author: string, wrongOptions: string[]): Promise<Quote> => {
  const response = await apiClient.post<Quote>('/api/quotes', { text, author, wrongOptions });
  return response.data;
};

export const updateQuote = async (id: number, text: string, author: string, wrongOptions: string[]): Promise<Quote> => {
  const response = await apiClient.put<Quote>(`/api/quotes/${id}`, { text, author, wrongOptions });
  return response.data;
};

export const deleteQuote = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/quotes/${id}`);
};
