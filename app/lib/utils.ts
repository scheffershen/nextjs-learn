import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // First check if revenue array exists and has data
  if (!revenue || !Array.isArray(revenue) || revenue.length === 0) {
    console.error('Invalid or empty revenue data:', revenue)
    return { yAxisLabels: [], topLabel: 0 }
  }

  //console.log('Revenue data:', JSON.stringify(revenue, null, 2))
  
  // Log the mapped revenue values to verify the data
  const revenueNumbers = revenue.map((month) => month.revenue)
  console.log('Mapped revenue values:', revenueNumbers)
  
  // Check if all revenue values are valid numbers
  if (revenueNumbers.some(val => typeof val !== 'number')) {
    console.error('Invalid revenue values detected:', revenueNumbers)
    return { yAxisLabels: [], topLabel: 0 }
  }

  const highestRecord = Math.max(...revenueNumbers)
  console.log('Highest record:', highestRecord)

  // Verify the calculation steps
  const topLabel = Math.ceil(highestRecord / 1000) * 1000
  console.log('Top label calculation:', {
    highestRecord,
    divided: highestRecord / 1000,
    ceiling: Math.ceil(highestRecord / 1000),
    final: topLabel
  })

  const yAxisLabels = []
  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`)
  }

  console.log('Y-axis labels:', yAxisLabels)
  console.log('Top label:', topLabel)
  
  return { yAxisLabels, topLabel }
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
