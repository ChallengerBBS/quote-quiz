namespace QuoteQuiz.API.Models;

public class UserAnswer
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int QuoteId { get; set; }
    public string AnsweredAuthor { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
    public Quote Quote { get; set; } = null!;
}
