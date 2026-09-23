/**
 * Parses the AI feedback markdown string produced by the interview flow into a
 * structured object. The string format is defined in app/interview/page.tsx and
 * must stay in sync with it — this parser is tolerant of missing sections.
 */

export interface ParsedFeedback {
  timeComplexity: string;
  spaceComplexity: string;
  isCorrect: boolean;
  qualityScore: number | null;
  correctnessIssues: string[];
  improvements: string[];
  suggestions: string[];
  edgeCases: string[];
  optimizedCode: string;
  hasContent: boolean;
}

function listItems(section: string): string[] {
  return (section.match(/^\s*[-•]\s*(.+)$/gm) || [])
    .map((l) => l.replace(/^\s*[-•]\s*/, '').trim())
    .filter((l) => l.length > 0);
}

function between(text: string, start: RegExp, ends: RegExp[]): string {
  const m = start.exec(text);
  if (!m) return '';
  const from = m.index + m[0].length;
  let to = text.length;
  for (const e of ends) {
    e.lastIndex = from;
    const em = e.exec(text);
    if (em && em.index < to) to = em.index;
  }
  return text.slice(from, to);
}

export function parseFeedback(feedback: string): ParsedFeedback {
  const timeComplexity =
    feedback.match(/\*\*Time Complexity:\*\*\s*([^\n*]+)/)?.[1]?.trim() || 'Not analyzed';
  const spaceComplexity =
    feedback.match(/\*\*Space Complexity:\*\*\s*([^\n*]+)/)?.[1]?.trim() || 'Not analyzed';

  const isCorrect = feedback.includes('✅');
  const scoreMatch = feedback.match(/Code Quality \(Score:\s*(\d+)\/10\)/);
  const qualityScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  const optimizedCode =
    feedback.match(/```(?:[a-zA-Z]+)?\n([\s\S]*?)```/)?.[1]?.trim() || '';

  const correctnessSection = between(
    feedback,
    /## Correctness Analysis:/,
    [/## Code Quality/, /## Optimization/, /## Edge Cases/],
  );
  const qualitySection = between(
    feedback,
    /## Code Quality \(Score:[^)]*\):/,
    [/## Optimization/, /## Edge Cases/, /### Optimized/],
  );
  const optimizationSection = between(
    feedback,
    /## Optimization Suggestions:/,
    [/### Optimized/, /## Edge Cases/],
  );
  const edgeSection = between(feedback, /## Edge Cases to Consider:/, []);

  return {
    timeComplexity,
    spaceComplexity,
    isCorrect,
    qualityScore,
    correctnessIssues: listItems(correctnessSection),
    improvements: listItems(qualitySection),
    suggestions: listItems(optimizationSection),
    edgeCases: listItems(edgeSection),
    optimizedCode,
    hasContent: feedback.trim().length > 0,
  };
}
