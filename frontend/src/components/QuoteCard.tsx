import React from 'react';

interface QuoteCardProps {
  quoteText: string;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quoteText }) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body text-center py-5 px-4">
        <figure className="mb-0">
          <blockquote className="blockquote">
            <p className="fs-4 fst-italic text-dark">"{quoteText}"</p>
          </blockquote>
        </figure>
      </div>
    </div>
  );
};

export default QuoteCard;
