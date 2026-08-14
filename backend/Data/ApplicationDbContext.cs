using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options
    ) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");

            entity.HasKey(user => user.Id);

            entity.Property(user => user.FullName)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(user => user.Email)
                .HasMaxLength(255)
                .IsRequired();

            entity.HasIndex(user => user.Email)
                .IsUnique();

            entity.Property(user => user.PasswordHash)
                .IsRequired();

            entity.Property(user => user.Role)
                .HasConversion<string>()
                .HasMaxLength(30)
                .IsRequired();

            entity.HasOne(user => user.Course)
                .WithMany(course => course.Students)
                .HasForeignKey(user => user.CourseId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.ToTable("courses");
            entity.Property(course => course.Name).HasMaxLength(150).IsRequired();
            entity.Property(course => course.Code).HasMaxLength(30).IsRequired();
            entity.HasIndex(course => course.Code).IsUnique();
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.ToTable("subjects");
            entity.Property(subject => subject.Name).HasMaxLength(150).IsRequired();
            entity.Property(subject => subject.Code).HasMaxLength(30).IsRequired();
            entity.HasIndex(subject => new { subject.CourseId, subject.Code }).IsUnique();
            entity.HasOne(subject => subject.Teacher)
                .WithMany(user => user.TaughtSubjects)
                .HasForeignKey(subject => subject.TeacherId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.ToTable("assignments");
            entity.Property(assignment => assignment.Title).HasMaxLength(200).IsRequired();
            entity.Property(assignment => assignment.Description).HasMaxLength(5000).IsRequired();
            entity.Property(assignment => assignment.MaximumMarks).HasPrecision(8, 2);
            entity.HasOne(assignment => assignment.Teacher)
                .WithMany(user => user.CreatedAssignments)
                .HasForeignKey(assignment => assignment.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.ToTable("submissions");
            entity.Property(submission => submission.Answer).HasMaxLength(10000).IsRequired();
            entity.Property(submission => submission.Feedback).HasMaxLength(3000);
            entity.Property(submission => submission.Marks).HasPrecision(8, 2);
            entity.Property(submission => submission.Status).HasConversion<string>().HasMaxLength(30);
            entity.HasIndex(submission => new { submission.AssignmentId, submission.StudentId }).IsUnique();
            entity.HasOne(submission => submission.Student)
                .WithMany(user => user.Submissions)
                .HasForeignKey(submission => submission.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
