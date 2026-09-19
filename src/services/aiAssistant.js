/**
 * Toki Intelligent Task Assistant
 * 
 * CORE PRINCIPLE:
 * Transparent, deterministic, client-side semantic intelligence.
 * Never invents fake statistics, never modifies tasks without confirmation,
 * and empowers user workflow with zero latency and offline capability.
 */

// Curated domain templates for smart breakdown
const BREAKDOWN_TEMPLATES = [
  {
    pattern: /\b(portfolio|personal site|website)\b/i,
    subtasks: [
      'Choose layout structure and aesthetic direction',
      'Set up project skeleton and navigation',
      'Build hero introduction and bio section',
      'Curate and add featured project case studies',
      'Highlight core skills and toolstack',
      'Create contact form or links',
      'Test responsiveness on mobile and desktop',
      'Deploy to production hosting and test domain',
    ],
  },
  {
    pattern: /\b(react|component|frontend|ui|app)\b/i,
    subtasks: [
      'Define component hierarchy and state model',
      'Build basic UI layout with accessible semantics',
      'Connect state hooks and data handlers',
      'Add loading and empty states',
      'Implement micro-animations and hover transitions',
      'Write unit tests and verify keyboard accessibility',
    ],
  },
  {
    pattern: /\b(interview|prep|algorithm|leetcode)\b/i,
    subtasks: [
      'Review core data structures (arrays, trees, graphs)',
      'Practice 2-3 medium coding problems',
      'Draft concise project stories (STAR format)',
      'Prepare 3 thoughtful questions for the interviewer',
      'Conduct a 30-minute timed mock session',
    ],
  },
  {
    pattern: /\b(blog|article|newsletter|write|post)\b/i,
    subtasks: [
      'Define core thesis and target audience',
      'Outline key sections and takeaways',
      'Write rough first draft without editing',
      'Refine tone, clarity, and transitions',
      'Select or design header image',
      'Proofread and publish',
    ],
  },
  {
    pattern: /\b(hike|trip|travel|vacation|pack)\b/i,
    subtasks: [
      'Check route, elevation, and weather forecast',
      'Pack essentials (water, snacks, layers, first-aid)',
      'Confirm transportation or departure time',
      'Download offline maps and charge devices',
      'Notify someone of the planned itinerary',
    ],
  },
  {
    pattern: /\b(clean|organize|apartment|room|desk)\b/i,
    subtasks: [
      'Clear visible surface clutter',
      'Sort items into Keep, Donate, and Discard',
      'Wipe down tables, monitors, and surfaces',
      'Organize cables, notebooks, and drawers',
      'Take out recycling and trash',
    ],
  },
  {
    pattern: /\b(tax|financial|budget|expenses)\b/i,
    subtasks: [
      'Gather all income statements and W-2/1099 forms',
      'Download bank statements and tally deductible expenses',
      'Review filings for deductions and credits',
      'Submit return or upload to tax software',
      'Archive confirmation receipts securely',
    ],
  },
  {
    pattern: /\b(presentation|slides|talk|pitch)\b/i,
    subtasks: [
      'Establish primary narrative and single takeaway',
      'Structure slide flow: Problem, Solution, Evidence, Call to Action',
      'Design clean visuals with minimal bullet points',
      'Practice delivery aloud and check timing',
      'Prepare backup slides for anticipated questions',
    ],
  },
];

/**
 * Breaks a task into actionable subtasks based on domain matching or general structuring.
 */
export function generateSubtaskSuggestions(taskTitle, taskDescription = '') {
  const combined = `${taskTitle} ${taskDescription}`.toLowerCase();

  for (const template of BREAKDOWN_TEMPLATES) {
    if (template.pattern.test(combined)) {
      return template.subtasks.map((title) => ({
        id: crypto.randomUUID(),
        title,
        completed: false,
      }));
    }
  }

  // Generalized smart breakdown for any goal
  const sanitizedTitle = taskTitle.replace(/^(plan|build|create|do|finish|write|complete)\s+/i, '');
  return [
    `Clarify specific requirements for ${sanitizedTitle}`,
    `Outline initial plan and list necessary resources`,
    `Execute the core implementation of ${sanitizedTitle}`,
    `Review, test edge cases, and refine details`,
    `Complete final checklist and document outcome`,
  ].map((title) => ({
    id: crypto.randomUUID(),
    title,
    completed: false,
  }));
}

/**
 * Suggests a realistic duration and priority level with clear, transparent reasoning.
 */
export function suggestTaskEstimates(taskTitle, taskCategory = 'Personal') {
  const text = taskTitle.toLowerCase();
  let estimatedMinutes = 30;
  let priority = 'Medium';
  let reason = 'Standard task scope';

  if (/\b(deploy|launch|interview|exam|presentation|taxes|urgent|deadline)\b/i.test(text)) {
    priority = 'High';
    estimatedMinutes = 60;
    reason = 'Tasks tied to major releases, interviews, or formal deadlines carry high impact.';
  } else if (/\b(build|develop|redesign|write article|deep dive|study|research)\b/i.test(text)) {
    priority = 'Medium';
    estimatedMinutes = 90;
    reason = 'Creative and engineering tasks typically require deep focus sessions of 60-90 minutes.';
  } else if (/\b(call|email|reply|schedule|book|buy|order|check|quick)\b/i.test(text)) {
    priority = 'Low';
    estimatedMinutes = 15;
    reason = 'Administrative or communication tasks can usually be closed in a quick 15-minute burst.';
  } else if (taskCategory === 'Health' || /\b(walk|stretch|workout|gym)\b/i.test(text)) {
    priority = 'Medium';
    estimatedMinutes = 45;
    reason = 'Physical and wellness activities are optimal when planned with a 45-minute block.';
  }

  return { estimatedMinutes, priority, reason };
}

/**
 * Rewrites a vague task into a clear, outcome-oriented description.
 */
export function rewriteTaskDescription(taskTitle, existingDescription = '') {
  const title = taskTitle.trim();
  const notes = existingDescription ? ` Notes: ${existingDescription.trim()}` : '';

  return `### Objective\nDeliver a polished, verified outcome for "${title}".\n\n### Deliverables\n- Clear milestone completion with no remaining ambiguities.\n- Verified functionality across expected use cases.${notes ? `\n- Context: ${existingDescription.trim()}` : ''}\n\n### Definition of Done\n- [ ] Core requirements satisfied\n- [ ] Quality reviewed and tested\n- [ ] Logged in Toki`;
}

/**
 * Summarizes the state of a project and recommends the 2 best next actions.
 */
export function summarizeProject(project, tasks = []) {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const total = projectTasks.length;
  const completed = projectTasks.filter((t) => t.completed).length;
  const active = projectTasks.filter((t) => !t.completed);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Unblocked next actions: active tasks that don't depend on uncompleted tasks
  const unblocked = active.filter((t) => {
    if (!Array.isArray(t.dependsOn) || t.dependsOn.length === 0) return true;
    return t.dependsOn.every((depId) => {
      const depTask = tasks.find((item) => item.id === depId);
      return depTask ? depTask.completed : true;
    });
  });

  const nextActions = unblocked
    .sort((a, b) => {
      const prioWeight = { High: 3, Medium: 2, Low: 1 };
      return (prioWeight[b.priority] || 2) - (prioWeight[a.priority] || 2);
    })
    .slice(0, 2);

  let statusSummary = '';
  if (total === 0) {
    statusSummary = 'This project currently has no tasks. Add the first milestone to get rolling.';
  } else if (percent === 100) {
    statusSummary = `All ${total} tasks in "${project.name}" are finished! Wonderful work.`;
  } else {
    statusSummary = `"${project.name}" is ${percent}% complete with ${active.length} active tasks remaining (${completed} done).`;
  }

  return {
    percent,
    total,
    completed,
    activeCount: active.length,
    statusSummary,
    nextActions,
  };
}
