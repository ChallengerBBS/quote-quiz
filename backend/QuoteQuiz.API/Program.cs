using Microsoft.EntityFrameworkCore;
using QuoteQuiz.API.Data;
using QuoteQuiz.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "QuoteQuiz API", Version = "v1" });
});

// Services
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IQuoteService, QuoteService>();
builder.Services.AddScoped<IAnswerService, AnswerService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger (development only)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuoteQuiz API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Health endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

// Seed database
SeedData.Initialize(app);

app.Run();

// Make the implicit Program class accessible for integration tests
public partial class Program { }
