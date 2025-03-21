export const getMonthlyAmount = (amount, frequency, lastPaymentDate = null) => {
  const parsedAmount = parseFloat(amount || 0);
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  let paymentCount = 0;
  let nextPaymentDate = lastPaymentDate ? new Date(lastPaymentDate) : null;

  switch (frequency) {
    case "weekly":
      if (!nextPaymentDate) return parsedAmount * 4.33; // Average weeks per month
      while (nextPaymentDate <= endOfMonth) {
        if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth)
          paymentCount++;
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      }
      return parsedAmount * paymentCount;
    case "bi-weekly":
      if (!nextPaymentDate) return parsedAmount * 2.17; // Average bi-weekly per month
      while (nextPaymentDate <= endOfMonth) {
        if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth)
          paymentCount++;
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 14);
      }
      return parsedAmount * paymentCount;
    case "monthly":
      if (!nextPaymentDate) return parsedAmount; // No date, assume monthly
      if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth)
        return parsedAmount;
      return 0;
    case "semester":
      return parsedAmount / 6; // Spread over 6 months
    case "yearly":
      return parsedAmount / 12; // Spread over 12 months
    case "termly":
      return parsedAmount / 4; // Spread over 4 months (student term assumption)
    case "custom":
      // For custom, without more data (e.g., customSchedule), treat as monthly
      return parsedAmount;
    default:
      return parsedAmount; // One-off or unknown frequency, assume monthly
  }
};
