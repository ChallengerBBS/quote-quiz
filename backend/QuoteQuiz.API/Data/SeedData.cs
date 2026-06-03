using Microsoft.EntityFrameworkCore;
using QuoteQuiz.API.Models;

namespace QuoteQuiz.API.Data;

public static class SeedData
{
    public static void Initialize(IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        context.Database.Migrate();

        SeedUsers(context);
        SeedQuotes(context);
    }

    private static void SeedUsers(AppDbContext context)
    {
        if (context.Users.Any())
            return;

        context.Users.Add(new User
        {
            Id = 1,
            Username = "Guest",
            CreatedAt = DateTime.UtcNow
        });

        context.SaveChanges();
    }

    private static void SeedQuotes(AppDbContext context)
    {
        if (context.Quotes.Any())
            return;

        var quotes = new List<(string Text, string Author, string[] WrongOptions)>
        {
            (
                "The only way to do great work is to love what you do.",
                "Steve Jobs",
                new[] { "Elon Musk", "Bill Gates" }
            ),
            (
                "Be yourself; everyone else is already taken.",
                "Oscar Wilde",
                new[] { "Mark Twain", "George Bernard Shaw" }
            ),
            (
                "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
                "Albert Einstein",
                new[] { "Nikola Tesla", "Isaac Newton" }
            ),
            (
                "In the middle of every difficulty lies opportunity.",
                "Albert Einstein",
                new[] { "Winston Churchill", "Napoleon Bonaparte" }
            ),
            (
                "It does not matter how slowly you go as long as you do not stop.",
                "Confucius",
                new[] { "Lao Tzu", "Sun Tzu" }
            ),
            (
                "Life is what happens when you're busy making other plans.",
                "John Lennon",
                new[] { "Paul McCartney", "Bob Dylan" }
            ),
            (
                "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
                "Ralph Waldo Emerson",
                new[] { "Henry David Thoreau", "Walt Whitman" }
            ),
            (
                "Spread love everywhere you go.",
                "Mother Teresa",
                new[] { "Mahatma Gandhi", "Dalai Lama" }
            ),
            (
                "When you reach the end of your rope, tie a knot in it and hang on.",
                "Franklin D. Roosevelt",
                new[] { "Abraham Lincoln", "Theodore Roosevelt" }
            ),
            (
                "Always remember that you are absolutely unique. Just like everyone else.",
                "Margaret Mead",
                new[] { "Eleanor Roosevelt", "Maya Angelou" }
            )
        };

        foreach (var (text, author, wrongOptions) in quotes)
        {
            var quote = new Quote
            {
                Text = text,
                Author = author,
                CreatedAt = DateTime.UtcNow,
                WrongOptions = wrongOptions.Select(w => new QuoteOption
                {
                    AuthorName = w
                }).ToList()
            };

            context.Quotes.Add(quote);
        }

        context.SaveChanges();
    }
}
