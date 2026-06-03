import React from 'react';

interface FeedbackMessageProps {
  isCorrect: boolean;
  correctAuthor: string;
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ isCorrect, correctAuthor }) => {
  if (isCorrect) {
    return (
      <div className="alert alert-success text-center fw-semibold fs-5" role="alert">
        Correct!
      </div>
    );
  }

  return (
    <div className="alert alert-danger text-center fs-5" role="alert">
      Sorry, you are wrong! The correct answer is <strong>{correctAuthor}</strong>.
    </div>
  );
};

export default FeedbackMessage;
