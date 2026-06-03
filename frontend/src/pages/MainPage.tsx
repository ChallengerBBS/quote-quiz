import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { getQuestion, submitAnswer } from '../services/api';
import { QuizQuestion, AnswerResult } from '../types';
import QuoteCard from '../components/QuoteCard';
import BinaryAnswer from '../components/BinaryAnswer';
import MultipleChoiceAnswer from '../components/MultipleChoiceAnswer';
import FeedbackMessage from '../components/FeedbackMessage';

const MainPage: React.FC = () => {
  const { mode, userId } = useGame();
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [answered, setAnswered] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setAnswered(false);
    try {
      const q = await getQuestion(mode);
      setQuestion(q);
    } catch (err) {
      setError('Failed to load question. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleBinaryAnswer = async (answer: 'yes' | 'no') => {
    if (!question || !userId || answered) return;
    setAnswered(true);
    try {
      const result = await submitAnswer({
        userId,
        quoteId: question.quoteId,
        mode: 'binary',
        proposedAuthor: question.proposedAuthor,
        binaryAnswer: answer,
        selectedAuthor: null,
      });
      setFeedback(result);
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      setAnswered(false);
    }
  };

  const handleMultipleChoiceAnswer = async (author: string) => {
    if (!question || !userId || answered) return;
    setAnswered(true);
    try {
      const result = await submitAnswer({
        userId,
        quoteId: question.quoteId,
        mode: 'multiple-choice',
        proposedAuthor: null,
        binaryAnswer: null,
        selectedAuthor: author,
      });
      setFeedback(result);
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      setAnswered(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '680px' }}>
      <h1 className="text-center mb-4 fw-bold">Quote Quiz</h1>
      <p className="text-center text-muted mb-4">
        Mode: <span className="badge bg-secondary text-capitalize">
          {mode === 'binary' ? 'Binary' : 'Multiple Choice'}
        </span>
      </p>

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
          <button className="btn btn-sm btn-outline-secondary ms-3" onClick={loadQuestion}>
            Retry
          </button>
        </div>
      )}

      {!loading && question && (
        <>
          <QuoteCard quoteText={question.quoteText} />

          <div className="mb-4">
            {mode === 'binary' && question.proposedAuthor && (
              <BinaryAnswer
                proposedAuthor={question.proposedAuthor}
                onAnswer={handleBinaryAnswer}
                disabled={answered}
              />
            )}

            {mode === 'multiple-choice' && question.options && (
              <MultipleChoiceAnswer
                options={question.options}
                onAnswer={handleMultipleChoiceAnswer}
                disabled={answered}
                correctAuthor={feedback ? feedback.correctAuthor : null}
              />
            )}
          </div>

          {answered && feedback && (
            <div className="mb-4">
              <FeedbackMessage
                isCorrect={feedback.isCorrect}
                correctAuthor={feedback.correctAuthor}
              />
            </div>
          )}

          {answered && (
            <div className="text-center">
              <button className="btn btn-primary btn-lg px-5" onClick={loadQuestion}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MainPage;
