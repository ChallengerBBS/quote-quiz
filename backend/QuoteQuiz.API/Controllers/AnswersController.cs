using Microsoft.AspNetCore.Mvc;
using QuoteQuiz.API.DTOs;
using QuoteQuiz.API.Services;

namespace QuoteQuiz.API.Controllers;

[ApiController]
[Route("api")]
public class AnswersController : ControllerBase
{
    private readonly IAnswerService _answerService;

    public AnswersController(IAnswerService answerService)
    {
        _answerService = answerService;
    }

    /// <summary>Submit an answer</summary>
    [HttpPost("answers")]
    [ProducesResponseType(typeof(AnswerResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitAnswer([FromBody] AnswerSubmitDto dto)
    {
        try
        {
            var result = await _answerService.SubmitAnswerAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Get achievements for a user</summary>
    /// <param name="userId">The user ID</param>
    /// <param name="sortBy">date | correct | incorrect</param>
    /// <param name="filterCorrect">true = only correct; false = only incorrect</param>
    [HttpGet("achievements")]
    [ProducesResponseType(typeof(List<AchievementDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAchievements(
        [FromQuery] int userId,
        [FromQuery] string? sortBy = "date",
        [FromQuery] bool? filterCorrect = null)
    {
        var achievements = await _answerService.GetAchievementsAsync(userId, sortBy, filterCorrect);
        return Ok(achievements);
    }
}
