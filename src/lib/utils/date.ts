import { format, formatDistance, parseISO } from 'date-fns';

// Format date for display
export const formatDate = (date: string | Date, formatString = 'dd MMM yyyy, HH:mm') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

// Format short date (e.g., "15 Jan 2024")
export const formatShortDate = (date: string | Date) => {
  return formatDate(date, 'dd MMM yyyy');
};

// Format time (e.g., "14:30")
export const formatTime = (date: string | Date) => {
  return formatDate(date, 'HH:mm');
};

// Format date with day (e.g., "Monday, 15 January 2024")
export const formatDateWithDay = (date: string | Date) => {
  return formatDate(date, 'eeee, dd MMMM yyyy');
};

// Check if date is in the past
export const isPast = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < new Date();
};

// Check if date is today
export const isToday = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

// Check if date is this week
export const isThisWeek = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  return dateObj >= weekStart && dateObj <= weekEnd;
};

// Get event status based on dates
export const getEventStatus = (eventDate: string | Date, isRegistrationClose: boolean) => {
  if (isPast(eventDate)) return 'completed';
  if (isRegistrationClose) return 'registration-closed';
  return 'upcoming';
};

// Format event date range
export const formatEventDateRange = (startDate: string | Date, endDate?: string | Date) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;

  if (!endDate) {
    return formatDate(start, 'dd MMM yyyy');
  }

  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (start.toDateString() === end.toDateString()) {
    // Same day
    return `${formatDate(start, 'dd MMM yyyy')} ${formatTime(start)} - ${formatTime(end)}`;
  }

  // Different days
  return `${formatDate(start, 'dd MMM yyyy')} - ${formatDate(end, 'dd MMM yyyy')}`;
};