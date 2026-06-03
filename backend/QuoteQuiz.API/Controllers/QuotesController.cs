using Microsoft.AspNetCore.Mvc;
using QuoteQuiz.API.DTOs;
using QuoteQuiz.API.Services;

namespace QuoteQuiz.API.Controllers;

[ApiController]
[Route("api/quotes")]
public class QuotesController : ControllerBase
{
    private readonly IQuoteService _quoteService;

    public QuotesController(IQuoteService quoteService)
    {
        _quoteService = quoteService;
    }

    /// <summary>Get all quotes</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<QuoteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var quotes = await _quoteService.GetAllAsync();
        return Ok(quotes);
    }

    /// <summary>Get quote by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(QuoteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var quote = await _quoteService.GetByIdAsync(id);
        return quote is null ? NotFound() : Ok(quote);
    }

    /// <summary>Create a new quote</summary>
    [HttpPost]
    [ProducesResponseType(typeof(QuoteDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateQuoteDto dto)
    {
        var quote = await _quoteService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = quote.Id }, quote);
    }

    /// <summary>Update a quote</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(QuoteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] CreateQuoteDto dto)
    {
        var quote = await _quoteService.UpdateAsync(id, dto);
        return quote is null ? NotFound() : Ok(quote);
    }

    /// <summary>Delete a quote</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _quoteService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
