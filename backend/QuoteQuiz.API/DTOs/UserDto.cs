namespace QuoteQuiz.API.DTOs;

public record UserDto(int Id, string Username, DateTime CreatedAt, bool IsActive, bool IsAdmin);
