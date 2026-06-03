using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using QuoteQuiz.API.Data;
using QuoteQuiz.API.Models;
using QuoteQuiz.API.Services;

namespace QuoteQuiz.Tests.Services;

[TestFixture]
public class QuizServiceTests
{
    private AppDbContext _context = null!;
    private QuizService _service = null!;

    [SetUp]
    public void SetUp()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        SeedTestData(_context);
        _service = new QuizService(_context);
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }

    private static void SeedTestData(AppDbContext context)
    {
        var quote = new Quote
        {
            Id = 1,
            Text = "Test quote text",
            Author = "Correct Author",
            CreatedAt = DateTime.UtcNow,
            WrongOptions = new List<QuoteOption>
            {
                new QuoteOption { Id = 1, AuthorName = "Wrong Author 1" },
                new QuoteOption { Id = 2, AuthorName = "Wrong Author 2" }
            }
        };

        context.Quotes.Add(quote);

        // Add extra quotes so binary mode has other authors to fill from
        context.Quotes.Add(new Quote
        {
            Id = 2,
            Text = "Another quote",
            Author = "Another Author",
            CreatedAt = DateTime.UtcNow,
            WrongOptions = new List<QuoteOption>()
        });

        context.SaveChanges();
    }

    [Test]
    public async Task GetQuestionAsync_BinaryMode_ReturnsBinaryQuestion()
    {
        // Act
        var result = await _service.GetQuestionAsync("binary");

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.QuoteId, Is.EqualTo(1).Or.EqualTo(2));
        Assert.That(result.QuoteText, Is.Not.Empty);
        Assert.That(result.ProposedAuthor, Is.Not.Null.And.Not.Empty);
        Assert.That(result.Options, Is.Null);
    }

    [Test]
    public async Task GetQuestionAsync_BinaryMode_ProposedAuthorIsEitherCorrectOrWrong()
    {
        // Run multiple times to cover both branches of the 50/50 random
        var proposedAuthors = new HashSet<string>();

        for (int i = 0; i < 50; i++)
        {
            var result = await _service.GetQuestionAsync("binary");
            if (result.QuoteId == 1)
                proposedAuthors.Add(result.ProposedAuthor!);
        }

        // The proposed author should be the correct one ("Correct Author") or one of the wrong ones
        var validAuthors = new HashSet<string> { "Correct Author", "Wrong Author 1", "Wrong Author 2" };
        Assert.That(proposedAuthors, Is.SubsetOf(validAuthors));
    }

    [Test]
    public async Task GetQuestionAsync_MultipleChoiceMode_ReturnsMCQuestion()
    {
        // Act
        var result = await _service.GetQuestionAsync("multiple-choice");

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.QuoteText, Is.Not.Empty);
        Assert.That(result.ProposedAuthor, Is.Null);
        Assert.That(result.Options, Is.Not.Null);
        Assert.That(result.Options!.Count, Is.EqualTo(3));
    }

    [Test]
    public async Task GetQuestionAsync_MultipleChoiceMode_OptionsContainCorrectAuthor()
    {
        // Act - run several times to always hit the quote with known author
        string? correctAuthor = null;
        List<string>? options = null;

        for (int i = 0; i < 20; i++)
        {
            var result = await _service.GetQuestionAsync("multiple-choice");
            if (result.QuoteId == 1)
            {
                correctAuthor = "Correct Author";
                options = result.Options;
                break;
            }
        }

        if (correctAuthor is not null && options is not null)
        {
            Assert.That(options, Does.Contain(correctAuthor));
        }
        else
        {
            // If we never hit quote 1, just verify structure is valid (3 options, no dupes)
            var lastResult = await _service.GetQuestionAsync("multiple-choice");
            Assert.That(lastResult.Options!.Count, Is.EqualTo(3));
            Assert.That(lastResult.Options!.Distinct().Count(), Is.EqualTo(3));
        }
    }

    [Test]
    public async Task GetQuestionAsync_MultipleChoiceMode_OptionsAreShuffled_NoDuplicates()
    {
        // Act
        var result = await _service.GetQuestionAsync("multiple-choice");

        // Assert no duplicates
        Assert.That(result.Options!.Distinct().Count(), Is.EqualTo(3));
    }

    [Test]
    public void GetQuestionAsync_UnknownMode_ThrowsArgumentException()
    {
        // Act & Assert
        Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.GetQuestionAsync("unknown-mode"));
    }

    [Test]
    public async Task GetQuestionAsync_QuoteWithNoWrongOptions_FillsFromOtherQuotes()
    {
        // Arrange: use a fresh context where the selected quote has no wrong options
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new AppDbContext(options);

        // Add quotes with no wrong options
        context.Quotes.AddRange(
            new Quote { Id = 10, Text = "Q10", Author = "Author10", WrongOptions = new List<QuoteOption>() },
            new Quote { Id = 11, Text = "Q11", Author = "Author11", WrongOptions = new List<QuoteOption>() },
            new Quote { Id = 12, Text = "Q12", Author = "Author12", WrongOptions = new List<QuoteOption>() }
        );
        context.SaveChanges();

        var service = new QuizService(context);

        // Act
        var result = await service.GetQuestionAsync("multiple-choice");

        // Assert: options still have 3 items (filled from other quotes)
        Assert.That(result.Options, Is.Not.Null);
        Assert.That(result.Options!.Count, Is.EqualTo(3));
    }
}
