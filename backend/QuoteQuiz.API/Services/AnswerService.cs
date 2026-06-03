using Microsoft.EntityFrameworkCore;
using QuoteQuiz.API.Data;
using QuoteQuiz.API.DTOs;
using QuoteQuiz.API.Models;

namespace QuoteQuiz.API.Services;

public class AnswerService : IAnswerService
{
    private readonly AppDbContext _context;

    public AnswerService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AnswerResultDto> SubmitAnswerAsync(AnswerSubmitDto dto)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists)
            throw new KeyNotFoundException($"User {dto.UserId} not found.");

        var quote = await _context.Quotes.FindAsync(dto.QuoteId)
            ?? throw new KeyNotFoundException($"Quote {dto.QuoteId} not found.");

        bool isCorrect;
        string answeredAuthor;

        if (dto.Mode == "binary")
        {
            var proposedAuthor = dto.ProposedAuthor ?? string.Empty;
            var binaryAnswer = dto.BinaryAnswer ?? string.Empty;

            isCorrect = (binaryAnswer == "yes" && proposedAuthor == quote.Author)
                     || (binaryAnswer == "no" && proposedAuthor != quote.Author);

            answeredAuthor = proposedAuthor;
        }
        else if (dto.Mode == "multiple-choice")
        {
            var selectedAuthor = dto.SelectedAuthor ?? string.Empty;
            isCorrect = selectedAuthor == quote.Author;
            answeredAuthor = selectedAuthor;
        }
        else
        {
            throw new ArgumentException($"Unknown mode: {dto.Mode}");
        }

        var userAnswer = new UserAnswer
        {
            UserId = dto.UserId,
            QuoteId = dto.QuoteId,
            AnsweredAuthor = answeredAuthor,
            IsCorrect = isCorrect,
            AnsweredAt = DateTime.UtcNow
        };

        _context.UserAnswers.Add(userAnswer);
        await _context.SaveChangesAsync();

        return new AnswerResultDto(isCorrect, quote.Author);
    }

    public async Task<List<AchievementDto>> GetAchievementsAsync(int userId, string? sortBy, bool? filterCorrect)
    {
        var query = _context.UserAnswers
            .Include(a => a.Quote)
            .Where(a => a.UserId == userId);

        if (filterCorrect.HasValue)
        {
            query = query.Where(a => a.IsCorrect == filterCorrect.Value);
        }

        var answers = await query.ToListAsync();

        IEnumerable<UserAnswer> sorted = sortBy switch
        {
            "correct" => answers.OrderByDescending(a => a.IsCorrect).ThenByDescending(a => a.AnsweredAt),
            "incorrect" => answers.OrderBy(a => a.IsCorrect).ThenByDescending(a => a.AnsweredAt),
            _ => answers.OrderByDescending(a => a.AnsweredAt) // default: date
        };

        return sorted.Select(a => new AchievementDto(
            a.Id,
            a.QuoteId,
            a.Quote.Text,
            a.AnsweredAuthor,
            a.Quote.Author,
            a.IsCorrect,
            a.AnsweredAt
        )).ToList();
    }
}
