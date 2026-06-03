namespace QuoteQuiz.API.DTOs;

public record AchievementDto(
    int Id,
    int QuoteId,
    string QuoteText,
    string AnsweredAuthor,
    string CorrectAuthor,
    bool IsCorrect,
    DateTime AnsweredAt
);
