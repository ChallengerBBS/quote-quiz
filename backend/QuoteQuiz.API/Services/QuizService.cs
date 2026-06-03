using Microsoft.EntityFrameworkCore;
using QuoteQuiz.API.Data;
using QuoteQuiz.API.DTOs;

namespace QuoteQuiz.API.Services;

public class QuizService : IQuizService
{
    private readonly AppDbContext _context;
    private readonly Random _random = new();

    public QuizService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<QuizQuestionDto> GetQuestionAsync(string mode)
    {
        var quotes = await _context.Quotes
            .Include(q => q.WrongOptions)
            .ToListAsync();

        if (quotes.Count == 0)
            throw new InvalidOperationException("No quotes available.");

        var quote = quotes[_random.Next(quotes.Count)];

        if (mode == "binary")
        {
            string proposedAuthor;
            // 50/50 chance: correct author or a wrong option author
            bool showCorrect = _random.Next(2) == 0;

            if (showCorrect || !quote.WrongOptions.Any())
            {
                proposedAuthor = quote.Author;
            }
            else
            {
                var wrongOption = quote.WrongOptions.ElementAt(_random.Next(quote.WrongOptions.Count));
                proposedAuthor = wrongOption.AuthorName;
            }

            return new QuizQuestionDto(
                QuoteId: quote.Id,
                QuoteText: quote.Text,
                ProposedAuthor: proposedAuthor,
                Options: null
            );
        }
        else if (mode == "multiple-choice")
        {
            // Gather up to 2 wrong options from the quote itself
            var wrongAuthors = quote.WrongOptions
                .Select(o => o.AuthorName)
                .Take(2)
                .ToList();

            // If fewer than 2 wrong options, fill from other quotes' authors
            if (wrongAuthors.Count < 2)
            {
                var otherAuthors = quotes
                    .Where(q => q.Id != quote.Id)
                    .Select(q => q.Author)
                    .Where(a => a != quote.Author && !wrongAuthors.Contains(a))
                    .Distinct()
                    .ToList();

                while (wrongAuthors.Count < 2 && otherAuthors.Count > 0)
                {
                    int idx = _random.Next(otherAuthors.Count);
                    wrongAuthors.Add(otherAuthors[idx]);
                    otherAuthors.RemoveAt(idx);
                }
            }

            // Combine correct author with wrong options and shuffle
            var options = new List<string> { quote.Author };
            options.AddRange(wrongAuthors);

            // Fisher-Yates shuffle
            for (int i = options.Count - 1; i > 0; i--)
            {
                int j = _random.Next(i + 1);
                (options[i], options[j]) = (options[j], options[i]);
            }

            return new QuizQuestionDto(
                QuoteId: quote.Id,
                QuoteText: quote.Text,
                ProposedAuthor: null,
                Options: options
            );
        }
        else
        {
            throw new ArgumentException($"Unknown mode: {mode}");
        }
    }
}
