/**
 * Calendar Integration Service for Toki
 * 
 * Supports:
 * 1. Generating a standard .ics iCalendar file for exporting tasks.
 * 2. Creating instant "Add to Google Calendar" event links.
 */

/**
 * Formats a Date object or YYYY-MM-DD + HH:MM into an iCalendar date string (YYYYMMDDTHHmmSSZ)
 */
function toICSDate(dateStr, timeStr = '09:00') {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = (timeStr || '09:00').split(':').map(Number);

  const d = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates an iCalendar (.ics) string from a list of tasks.
 */
export function generateICS(tasks = []) {
  const events = tasks
    .filter((t) => t.dueDate && !t.completed)
    .map((task) => {
      const dtStart = toICSDate(task.dueDate, task.dueTime);
      const durationHours = task.estimatedMinutes > 0 ? Math.ceil(task.estimatedMinutes / 60) : 1;
      const [year, month, day] = task.dueDate.split('-').map(Number);
      const [hours, minutes] = (task.dueTime || '09:00').split(':').map(Number);
      const endD = new Date(Date.UTC(year, month - 1, day, hours + durationHours, minutes, 0));
      const dtEnd = endD.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const summary = task.title.replace(/[\\,;]/g, (match) => `\\${match}`);
      const description = (task.description || `Priority: ${task.priority}`)
        .replace(/\n/g, '\\n')
        .replace(/[\\,;]/g, (match) => `\\${match}`);

      return [
        'BEGIN:VEVENT',
        `UID:toki-${task.id}@toki.app`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n');
    });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Toki Productivity//NONSGML v4.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Downloads the tasks as a .ics file directly in the browser.
 */
export function downloadTasksICS(tasks = [], filename = 'toki-tasks.ics') {
  const icsData = generateICS(tasks);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a prefilled Google Calendar event URL for a single task.
 */
export function getGoogleCalendarUrl(task) {
  if (!task.dueDate) return '';

  const dtStart = toICSDate(task.dueDate, task.dueTime);
  const durationHours = task.estimatedMinutes > 0 ? Math.ceil(task.estimatedMinutes / 60) : 1;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  const [hours, minutes] = (task.dueTime || '09:00').split(':').map(Number);
  const endD = new Date(Date.UTC(year, month - 1, day, hours + durationHours, minutes, 0));
  const dtEnd = endD.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: task.title,
    dates: `${dtStart}/${dtEnd}`,
    details: task.description ? `${task.description}\n\nManaged in Toki` : 'Managed in Toki',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
