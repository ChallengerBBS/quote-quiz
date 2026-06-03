namespace QuoteQuiz.API.Models;

public class Quote
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<QuoteOption> WrongOptions { get; set; } = new List<QuoteOption>();
    public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
}
