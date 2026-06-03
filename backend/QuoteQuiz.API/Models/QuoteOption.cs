namespace QuoteQuiz.API.Models;

public class QuoteOption
{
    public int Id { get; set; }
    public int QuoteId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public Quote Quote { get; set; } = null!;
}
