using QuoteQuiz.API.DTOs;

namespace QuoteQuiz.API.Services;

public interface IAnswerService
{
    Task<AnswerResultDto> SubmitAnswerAsync(AnswerSubmitDto dto);
    Task<List<AchievementDto>> GetAchievementsAsync(int userId, string? sortBy, bool? filterCorrect);
}
