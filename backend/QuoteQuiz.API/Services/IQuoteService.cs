using QuoteQuiz.API.DTOs;

namespace QuoteQuiz.API.Services;

public interface IQuoteService
{
    Task<List<QuoteDto>> GetAllAsync();
    Task<QuoteDto?> GetByIdAsync(int id);
    Task<QuoteDto> CreateAsync(CreateQuoteDto dto);
    Task<QuoteDto?> UpdateAsync(int id, CreateQuoteDto dto);
    Task<bool> DeleteAsync(int id);
}
