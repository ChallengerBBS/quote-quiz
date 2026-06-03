import React from 'react';

interface MultipleChoiceAnswerProps {
  options: string[];
  onAnswer: (author: string) => void;
  disabled: boolean;
  correctAuthor: string | null;
}

const MultipleChoiceAnswer: React.FC<MultipleChoiceAnswerProps> = ({
  options,
  onAnswer,
  disabled,
  correctAuthor,
}) => {
  const [selected, setSelected] = React.useState<string | null>(null);

  const handleClick = (option: string) => {
    if (disabled) return;
    setSelected(option);
    onAnswer(option);
  };

  const getButtonClass = (option: string): string => {
    if (!disabled || selected === null || correctAuthor === null) {
      return 'btn btn-outline-primary btn-lg w-100';
    }
    if (option === correctAuthor) {
      return 'btn btn-success btn-lg w-100';
    }
    if (option === selected) {
      return 'btn btn-danger btn-lg w-100';
    }
    return 'btn btn-outline-secondary btn-lg w-100';
  };

  // Reset selection when new question arrives (options change)
  React.useEffect(() => {
    setSelected(null);
  }, [options]);

  return (
    <div className="d-flex flex-column gap-3">
      {options.map((option) => (
        <button
          key={option}
          className={getButtonClass(option)}
          onClick={() => handleClick(option)}
          disabled={disabled}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default MultipleChoiceAnswer;
