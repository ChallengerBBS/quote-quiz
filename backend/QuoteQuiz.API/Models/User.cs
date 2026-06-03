namespace QuoteQuiz.API.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public bool IsAdmin { get; set; } = false;
    public ICollection<UserAnswer> Answers { get; set; } = new List<UserAnswer>();
}
