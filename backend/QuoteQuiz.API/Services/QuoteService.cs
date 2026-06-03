using Microsoft.EntityFrameworkCore;
using QuoteQuiz.API.Data;
using QuoteQuiz.API.DTOs;
using QuoteQuiz.API.Models;

namespace QuoteQuiz.API.Services;

public class QuoteService : IQuoteService
{
    private readonly AppDbContext _context;

    public QuoteService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<QuoteDto>> GetAllAsync()
    {
        return await _context.Quotes
            .Include(q => q.WrongOptions)
            .Select(q => new QuoteDto(
                q.Id,
                q.Text,
                q.Author,
                q.WrongOptions.Select(o => o.AuthorName).ToList(),
                q.CreatedAt))
            .ToListAsync();
    }

    public async Task<QuoteDto?> GetByIdAsync(int id)
    {
        var quote = await _context.Quotes
            .Include(q => q.WrongOptions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quote is null) return null;

        return new QuoteDto(
            quote.Id,
            quote.Text,
            quote.Author,
            quote.WrongOptions.Select(o => o.AuthorName).ToList(),
            quote.CreatedAt);
    }

    public async Task<QuoteDto> CreateAsync(CreateQuoteDto dto)
    {
        var quote = new Quote
        {
            Text = dto.Text,
            Author = dto.Author,
            CreatedAt = DateTime.UtcNow,
            WrongOptions = dto.WrongOptions.Select(w => new QuoteOption
            {
                AuthorName = w
            }).ToList()
        };

        _context.Quotes.Add(quote);
        await _context.SaveChangesAsync();

        return new QuoteDto(
            quote.Id,
            quote.Text,
            quote.Author,
            quote.WrongOptions.Select(o => o.AuthorName).ToList(),
            quote.CreatedAt);
    }

    public async Task<QuoteDto?> UpdateAsync(int id, CreateQuoteDto dto)
    {
        var quote = await _context.Quotes
            .Include(q => q.WrongOptions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quote is null) return null;

        quote.Text = dto.Text;
        quote.Author = dto.Author;

        // Replace wrong options
        _context.QuoteOptions.RemoveRange(quote.WrongOptions);
        quote.WrongOptions = dto.WrongOptions.Select(w => new QuoteOption
        {
            AuthorName = w,
            QuoteId = id
        }).ToList();

        await _context.SaveChangesAsync();

        return new QuoteDto(
            quote.Id,
            quote.Text,
            quote.Author,
            quote.WrongOptions.Select(o => o.AuthorName).ToList(),
            quote.CreatedAt);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var quote = await _context.Quotes.FindAsync(id);
        if (quote is null) return false;

        _context.Quotes.Remove(quote);
        await _context.SaveChangesAsync();
        return true;
    }
}
