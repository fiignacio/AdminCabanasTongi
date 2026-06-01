import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Ensures a date is evaluated consistently without timezone shifts.
 * Works with YYYY-MM-DD strings, ISO strings, or Date objects.
 */
export const parseSafeDate = (dateVal) => {
  if (!dateVal) return new Date();
  
  if (dateVal instanceof Date) return dateVal;
  
  let dateStr = String(dateVal);
  
  // If it's a timestamp (number as string)
  if (!isNaN(dateStr) && dateStr.length >= 10) {
    const d = new Date(Number(dateStr));
    // To prevent UTC shift, we extract the local date components
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  }

  // Handle "YYYY-MM-DD" or ISO strings
  const datePart = dateStr.split('T')[0];
  const parts = datePart.split('-');
  
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
    const day = parseInt(parts[2], 10);
    
    // Return date at local noon to avoid any timezone boundary issues
    return new Date(year, month, day, 12, 0, 0);
  }
  
  const fallback = new Date(dateVal);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
};

export const formatSafeDate = (dateVal, formatStr = 'dd MMM yyyy') => {
  const safe = parseSafeDate(dateVal);
  return format(safe, formatStr, { locale: es });
};
