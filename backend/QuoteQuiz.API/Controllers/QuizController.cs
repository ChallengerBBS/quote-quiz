using Microsoft.AspNetCore.Mvc;
using QuoteQuiz.API.DTOs;
using QuoteQuiz.API.Services;

namespace QuoteQuiz.API.Controllers;

[ApiController]
[Route("api/quiz")]
public class QuizController : ControllerBase
{
    private readonly IQuizService _quizService;

    public QuizController(IQuizService quizService)
    {
        _quizService = quizService;
    }

    /// <summary>Get a quiz question</summary>
    /// <param name="mode">binary | multiple-choice</param>
    [HttpGet("question")]
    [ProducesResponseType(typeof(QuizQuestionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetQuestion([FromQuery] string mode = "multiple-choice")
    {
        if (mode != "binary" && mode != "multiple-choice")
            return BadRequest(new { error = "mode must be 'binary' or 'multiple-choice'" });

        try
        {
            var question = await _quizService.GetQuestionAsync(mode);
            return Ok(question);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
