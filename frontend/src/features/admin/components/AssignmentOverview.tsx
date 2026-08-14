import { AssignmentRow } from "@/components/assignments/AssignmentRow";
import type { Assignment } from "@/types/domain";

interface AssignmentOverviewProps {
  assignments: Assignment[];
}

export function AssignmentOverview({ assignments }: AssignmentOverviewProps) {
  return (
    <section className="panel">
      <div className="panelTitle">
        <div>
          <span className="eyebrow">System visibility</span>
          <h2>All assignments</h2>
        </div>
        <span>{assignments.length} total</span>
      </div>
      <div className="assignmentList">
        {assignments.map((assignment) => (
          <AssignmentRow
            key={assignment.id}
            assignment={assignment}
            detail={`${assignment.submissionCount} submissions`}
          />
        ))}
      </div>
    </section>
  );
}
