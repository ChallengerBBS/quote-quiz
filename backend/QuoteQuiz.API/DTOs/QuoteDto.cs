namespace QuoteQuiz.API.DTOs;

public record QuoteDto(int Id, string Text, string Author, List<string> WrongOptions, DateTime CreatedAt);
