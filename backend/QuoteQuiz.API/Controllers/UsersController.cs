using Microsoft.AspNetCore.Mvc;
using QuoteQuiz.API.DTOs;
using QuoteQuiz.API.Services;


namespace QuoteQuiz.API.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>Get all users</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    /// <summary>Get user by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(user);
    }

    /// <summary>Create a new user</summary>
    [HttpPost]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var user = await _userService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    /// <summary>Update a user's username</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] CreateUserDto dto)
    {
        var user = await _userService.UpdateAsync(id, dto);
        return user is null ? NotFound() : Ok(user);
    }

    /// <summary>Set or clear admin rights for a user</summary>
    [HttpPatch("{id:int}/admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetAdmin(int id, [FromBody] SetAdminDto dto)
    {
        var found = await _userService.SetAdminAsync(id, dto.IsAdmin);
        return found ? NoContent() : NotFound();
    }

    /// <summary>Disable a user</summary>
    [HttpPatch("{id:int}/disable")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Disable(int id)
    {
        var found = await _userService.SetActiveAsync(id, false);
        return found ? NoContent() : NotFound();
    }

    /// <summary>Enable a user</summary>
    [HttpPatch("{id:int}/enable")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Enable(int id)
    {
        var found = await _userService.SetActiveAsync(id, true);
        return found ? NoContent() : NotFound();
    }

    /// <summary>Delete a user</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _userService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
