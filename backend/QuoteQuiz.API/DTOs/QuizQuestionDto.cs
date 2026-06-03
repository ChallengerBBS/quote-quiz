namespace QuoteQuiz.API.DTOs;

public record QuizQuestionDto(
    int QuoteId,
    string QuoteText,
    string? ProposedAuthor,
    List<string>? Options
);
