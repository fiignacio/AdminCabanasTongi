import { getMonth, eachDayOfInterval, startOfDay } from 'date-fns';
import { parseSafeDate } from './dateUtils';

/**
 * Determines if a given date is in High Season.
 * High season: December (11), January (0), February (1), March (2)
 */
export function isHighSeason(date) {
  const month = getMonth(date);
  return month === 11 || month <= 2;
}

/**
 * Calculates the total cost of a reservation.
 * Price is calculated per night using dynamic prices.
 */
export function calculateReservationCost(startDate, endDate, adultsCount, childrenCount, prices) {
  if (!startDate || !endDate || !prices) return 0; // Guard in case prices are not passed
  
  const start = startOfDay(parseSafeDate(startDate));
  const end = startOfDay(parseSafeDate(endDate));
  
  if (start >= end) return 0;
  
  let days = eachDayOfInterval({ start, end });
  if (days.length > 1) {
    days.pop(); // Remove checkout day
  }

  let totalCost = 0;

  days.forEach(day => {
    const adultPrice = isHighSeason(day) ? Number(prices.highSeasonAdult) : Number(prices.lowSeasonAdult);
    
    totalCost += (adultsCount * adultPrice);
    totalCost += (childrenCount * Number(prices.child));
  });

  return totalCost;
}
