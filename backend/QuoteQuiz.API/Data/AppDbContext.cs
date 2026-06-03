using Microsoft.EntityFrameworkCore;
using QuoteQuiz.API.Models;

namespace QuoteQuiz.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<QuoteOption> QuoteOptions => Set<QuoteOption>();
    public DbSet<UserAnswer> UserAnswers => Set<UserAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
            entity.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<Quote>(entity =>
        {
            entity.HasKey(q => q.Id);
            entity.Property(q => q.Text).IsRequired();
            entity.Property(q => q.Author).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<QuoteOption>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.AuthorName).IsRequired().HasMaxLength(200);
            entity.HasOne(o => o.Quote)
                  .WithMany(q => q.WrongOptions)
                  .HasForeignKey(o => o.QuoteId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserAnswer>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.AnsweredAuthor).IsRequired().HasMaxLength(200);
            entity.HasOne(a => a.User)
                  .WithMany(u => u.Answers)
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(a => a.Quote)
                  .WithMany(q => q.UserAnswers)
                  .HasForeignKey(a => a.QuoteId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
