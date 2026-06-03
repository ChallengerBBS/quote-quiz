using Microsoft.EntityFrameworkCore;
using QuoteQuiz.API.Data;
using QuoteQuiz.API.DTOs;
using QuoteQuiz.API.Models;

namespace QuoteQuiz.API.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        return await _context.Users
            .Select(u => new UserDto(u.Id, u.Username, u.CreatedAt, u.IsActive, u.IsAdmin))
            .ToListAsync();
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        return user is null ? null : new UserDto(user.Id, user.Username, user.CreatedAt, user.IsActive, user.IsAdmin);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (user == null)
        {
	        user = new User
	        {
		        Username = dto.Username,
		        CreatedAt = DateTime.UtcNow
	        };

	        _context.Users.Add(user);
	        await _context.SaveChangesAsync();
        }

        return new UserDto(user.Id, user.Username, user.CreatedAt, user.IsActive, user.IsAdmin);
    }

    public async Task<UserDto?> UpdateAsync(int id, CreateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null) return null;

        user.Username = dto.Username;
        await _context.SaveChangesAsync();

        return new UserDto(user.Id, user.Username, user.CreatedAt, user.IsActive, user.IsAdmin);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetActiveAsync(int id, bool isActive)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null) return false;

        user.IsActive = isActive;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetAdminAsync(int id, bool isAdmin)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null) return false;

        user.IsAdmin = isAdmin;
        await _context.SaveChangesAsync();
        return true;
    }
}
