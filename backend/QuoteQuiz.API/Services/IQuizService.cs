using QuoteQuiz.API.DTOs;

namespace QuoteQuiz.API.Services;

public interface IQuizService
{
    Task<QuizQuestionDto> GetQuestionAsync(string mode);
}
