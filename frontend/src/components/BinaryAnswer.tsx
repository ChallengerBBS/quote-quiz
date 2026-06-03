import React from 'react';

interface BinaryAnswerProps {
  proposedAuthor: string;
  onAnswer: (answer: 'yes' | 'no') => void;
  disabled: boolean;
}

const BinaryAnswer: React.FC<BinaryAnswerProps> = ({ proposedAuthor, onAnswer, disabled }) => {
  return (
    <div className="text-center">
      <p className="fs-5 mb-3">
        Is this quote by <strong>{proposedAuthor}</strong>?
      </p>
      <div className="d-flex justify-content-center gap-3">
        <button
          className="btn btn-success btn-lg px-5"
          onClick={() => onAnswer('yes')}
          disabled={disabled}
        >
          Yes
        </button>
        <button
          className="btn btn-danger btn-lg px-5"
          onClick={() => onAnswer('no')}
          disabled={disabled}
        >
          No
        </button>
      </div>
    </div>
  );
};

export default BinaryAnswer;
