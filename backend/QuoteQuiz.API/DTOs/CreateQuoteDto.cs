namespace QuoteQuiz.API.DTOs;

public record CreateQuoteDto(string Text, string Author, List<string> WrongOptions);
