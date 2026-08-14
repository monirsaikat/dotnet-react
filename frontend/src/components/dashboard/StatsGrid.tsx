interface StatsGridProps {
  assignmentCount: number;
  upcomingCount: number;
  courseCount: number;
}

export function StatsGrid({
  assignmentCount,
  upcomingCount,
  courseCount,
}: StatsGridProps) {
  const stats = [
    { label: "Assignments", value: assignmentCount, hint: "Visible to you" },
    { label: "Upcoming", value: upcomingCount, hint: "Before deadline" },
    { label: "Courses", value: courseCount, hint: "Active learning groups" },
  ];

  return (
    <section className="stats" aria-label="Dashboard summary">
      {stats.map((stat) => (
        <article key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <small>{stat.hint}</small>
        </article>
      ))}
    </section>
  );
}
