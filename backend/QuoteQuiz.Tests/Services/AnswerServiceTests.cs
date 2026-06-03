using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using QuoteQuiz.API.Data;
using QuoteQuiz.API.DTOs;
using QuoteQuiz.API.Models;
using QuoteQuiz.API.Services;

namespace QuoteQuiz.Tests.Services;

[TestFixture]
public class AnswerServiceTests
{
    private AppDbContext _context = null!;
    private AnswerService _service = null!;

    private const string CorrectAuthor = "Mark Twain";
    private const int QuoteId = 1;
    private const int UserId = 1;

    [SetUp]
    public void SetUp()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);

        _context.Quotes.Add(new Quote
        {
            Id = QuoteId,
            Text = "The reports of my death are greatly exaggerated.",
            Author = CorrectAuthor,
            CreatedAt = DateTime.UtcNow
        });

        _context.Users.Add(new User
        {
            Id = UserId,
            Username = "TestUser",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        _context.SaveChanges();

        _service = new AnswerService(_context);
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }

    // ----- Binary mode tests -----

    [Test]
    public async Task SubmitAnswer_Binary_YesWithCorrectAuthor_IsCorrect()
    {
        // Arrange
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "binary",
            ProposedAuthor: CorrectAuthor,
            BinaryAnswer: "yes",
            SelectedAuthor: null
        );

        // Act
        var result = await _service.SubmitAnswerAsync(dto);

        // Assert
        Assert.That(result.IsCorrect, Is.True);
        Assert.That(result.CorrectAuthor, Is.EqualTo(CorrectAuthor));
    }

    [Test]
    public async Task SubmitAnswer_Binary_YesWithWrongAuthor_IsIncorrect()
    {
        // Arrange
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "binary",
            ProposedAuthor: "Wrong Author",
            BinaryAnswer: "yes",
            SelectedAuthor: null
        );

        // Act
        var result = await _service.SubmitAnswerAsync(dto);

        // Assert
        Assert.That(result.IsCorrect, Is.False);
        Assert.That(result.CorrectAuthor, Is.EqualTo(CorrectAuthor));
    }

    [Test]
    public async Task SubmitAnswer_Binary_NoWithWrongAuthor_IsCorrect()
    {
        // Arrange: proposed author is NOT the real author → answering "no" is correct
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "binary",
            ProposedAuthor: "Someone Else",
            BinaryAnswer: "no",
            SelectedAuthor: null
        );

        // Act
        var result = await _service.SubmitAnswerAsync(dto);

        // Assert
        Assert.That(result.IsCorrect, Is.True);
        Assert.That(result.CorrectAuthor, Is.EqualTo(CorrectAuthor));
    }

    [Test]
    public async Task SubmitAnswer_Binary_NoWithCorrectAuthor_IsIncorrect()
    {
        // Arrange: proposed author IS the real author → answering "no" is wrong
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "binary",
            ProposedAuthor: CorrectAuthor,
            BinaryAnswer: "no",
            SelectedAuthor: null
        );

        // Act
        var result = await _service.SubmitAnswerAsync(dto);

        // Assert
        Assert.That(result.IsCorrect, Is.False);
    }

    [Test]
    public async Task SubmitAnswer_Binary_SavesUserAnswer()
    {
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "binary",
            ProposedAuthor: CorrectAuthor,
            BinaryAnswer: "yes",
            SelectedAuthor: null
        );

        await _service.SubmitAnswerAsync(dto);

        var saved = _context.UserAnswers.Single();
        Assert.That(saved.UserId, Is.EqualTo(UserId));
        Assert.That(saved.QuoteId, Is.EqualTo(QuoteId));
        Assert.That(saved.AnsweredAuthor, Is.EqualTo(CorrectAuthor));
        Assert.That(saved.IsCorrect, Is.True);
    }

    // ----- Multiple-choice mode tests -----

    [Test]
    public async Task SubmitAnswer_MultipleChoice_CorrectSelection_IsCorrect()
    {
        // Arrange
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "multiple-choice",
            ProposedAuthor: null,
            BinaryAnswer: null,
            SelectedAuthor: CorrectAuthor
        );

        // Act
        var result = await _service.SubmitAnswerAsync(dto);

        // Assert
        Assert.That(result.IsCorrect, Is.True);
        Assert.That(result.CorrectAuthor, Is.EqualTo(CorrectAuthor));
    }

    [Test]
    public async Task SubmitAnswer_MultipleChoice_WrongSelection_IsIncorrect()
    {
        // Arrange
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "multiple-choice",
            ProposedAuthor: null,
            BinaryAnswer: null,
            SelectedAuthor: "Wrong Author"
        );

        // Act
        var result = await _service.SubmitAnswerAsync(dto);

        // Assert
        Assert.That(result.IsCorrect, Is.False);
        Assert.That(result.CorrectAuthor, Is.EqualTo(CorrectAuthor));
    }

    [Test]
    public async Task SubmitAnswer_MultipleChoice_SavesUserAnswerWithSelectedAuthor()
    {
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "multiple-choice",
            ProposedAuthor: null,
            BinaryAnswer: null,
            SelectedAuthor: "Wrong Author"
        );

        await _service.SubmitAnswerAsync(dto);

        var saved = _context.UserAnswers.Single();
        Assert.That(saved.AnsweredAuthor, Is.EqualTo("Wrong Author"));
        Assert.That(saved.IsCorrect, Is.False);
    }

    // ----- Error cases -----

    [Test]
    public void SubmitAnswer_UnknownQuote_ThrowsKeyNotFoundException()
    {
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: 9999,
            Mode: "multiple-choice",
            ProposedAuthor: null,
            BinaryAnswer: null,
            SelectedAuthor: "Someone"
        );

        Assert.ThrowsAsync<KeyNotFoundException>(
            async () => await _service.SubmitAnswerAsync(dto));
    }

    [Test]
    public void SubmitAnswer_UnknownMode_ThrowsArgumentException()
    {
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "unknown",
            ProposedAuthor: null,
            BinaryAnswer: null,
            SelectedAuthor: null
        );

        Assert.ThrowsAsync<ArgumentException>(
            async () => await _service.SubmitAnswerAsync(dto));
    }

    // ----- IsActive enforcement tests -----

    [Test]
    public void SubmitAnswer_DisabledUser_ThrowsUnauthorizedAccessException()
    {
        _context.Users.Add(new User
        {
            Id = 99,
            Username = "DisabledUser",
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        });
        _context.SaveChanges();

        var dto = new AnswerSubmitDto(
            UserId: 99,
            QuoteId: QuoteId,
            Mode: "multiple-choice",
            ProposedAuthor: null,
            BinaryAnswer: null,
            SelectedAuthor: CorrectAuthor
        );

        Assert.ThrowsAsync<UnauthorizedAccessException>(
            async () => await _service.SubmitAnswerAsync(dto));
    }

    [Test]
    public void SubmitAnswer_DisabledUser_DoesNotSaveAnswer()
    {
        _context.Users.Add(new User
        {
            Id = 99,
            Username = "DisabledUser",
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        });
        _context.SaveChanges();

        var dto = new AnswerSubmitDto(
            UserId: 99,
            QuoteId: QuoteId,
            Mode: "multiple-choice",
            ProposedAuthor: null,
            BinaryAnswer: null,
            SelectedAuthor: CorrectAuthor
        );

        Assert.ThrowsAsync<UnauthorizedAccessException>(
            async () => await _service.SubmitAnswerAsync(dto));

        Assert.That(_context.UserAnswers.Any(), Is.False);
    }

    [Test]
    public async Task SubmitAnswer_ActiveUser_Succeeds()
    {
        var dto = new AnswerSubmitDto(
            UserId: UserId,
            QuoteId: QuoteId,
            Mode: "multiple-choice",
            ProposedAuthor: null,
            BinaryAnswer: null,
            SelectedAuthor: CorrectAuthor
        );

        var result = await _service.SubmitAnswerAsync(dto);

        Assert.That(result.IsCorrect, Is.True);
    }
}
