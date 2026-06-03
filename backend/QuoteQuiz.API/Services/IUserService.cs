using QuoteQuiz.API.DTOs;

namespace QuoteQuiz.API.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto?> UpdateAsync(int id, CreateUserDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> SetActiveAsync(int id, bool isActive);
    Task<bool> SetAdminAsync(int id, bool isAdmin);
}
