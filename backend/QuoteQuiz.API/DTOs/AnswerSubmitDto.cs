namespace QuoteQuiz.API.DTOs;

public record AnswerSubmitDto(
    int UserId,
    int QuoteId,
    string Mode,
    string? ProposedAuthor,
    string? BinaryAnswer,
    string? SelectedAuthor
);
