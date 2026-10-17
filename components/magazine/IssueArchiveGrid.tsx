"use client";

import ArchiveIssuesGrid, {
  type ArchiveIssuesGridProps,
} from "./ArchiveIssuesGrid";

/**
 * Unified Issue Archive Grid (CQ-04)
 * Delegates to the unified ArchiveIssuesGrid component with default preview styling.
 */
export default function IssueArchiveGrid(props: ArchiveIssuesGridProps) {
  return <ArchiveIssuesGrid {...props} />;
}
