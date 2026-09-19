const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

export const initialTasks = [
  { id: 'task-1', title: 'Design the onboarding flow', description: 'Map the welcoming first-run experience.', priority: 'high', category: 'Work', dueDate: today, completed: false, createdAt: Date.now() - 900000 },
  { id: 'task-2', title: 'Reply to project feedback', description: 'Send a concise update to the team.', priority: 'medium', category: 'Work', dueDate: today, completed: false, createdAt: Date.now() - 720000 },
  { id: 'task-3', title: 'Book a dentist appointment', description: '', priority: 'low', category: 'Personal', dueDate: today, completed: false, createdAt: Date.now() - 540000 },
  { id: 'task-4', title: 'Outline React presentation', description: 'Draft the story for the component talk.', priority: 'high', category: 'Study', dueDate: today, completed: true, createdAt: Date.now() - 360000, completedAt: Date.now() - 180000 },
  { id: 'task-5', title: 'Read the React docs', description: 'Review the state management chapter.', priority: 'medium', category: 'Study', dueDate: tomorrow, completed: false, createdAt: Date.now() - 180000 },
  { id: 'task-6', title: 'Plan Saturday morning', description: '', priority: 'low', category: 'Personal', dueDate: nextWeek, completed: false, createdAt: Date.now() - 120000 },
];
