import React from "react";

const IncomeDashboard = ({ incomeItems, removeIncomeItem }) => {
  // Helper function to calculate monthly income based on recurring type
  const getMonthlyIncome = (amount, recurring, lastPaymentDate) => {
    const parsedAmount = parseFloat(amount);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Determine the start and end dates of the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0); // Last day of the month

    let paymentCount = 0;

    // Start counting from the last payment date
    let nextPaymentDate = new Date(lastPaymentDate);

    // Calculate payments based on the frequency
    switch (recurring) {
      case "weekly":
        // Count paydays from the last payment date until the end of the current month
        while (nextPaymentDate <= endOfMonth) {
          if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth) {
            paymentCount++;
          }
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 7); // Move to the next week
        }
        return parsedAmount * paymentCount; // Calculate based on the number of weeks
      case "bi-weekly":
        // Count paydays for bi-weekly payments
        while (nextPaymentDate <= endOfMonth) {
          if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth) {
            paymentCount++;
          }
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 14); // Move to the next bi-weekly payment
        }
        return parsedAmount * paymentCount; // Calculate based on the number of bi-weekly payments
      case "monthly":
        // If the last payment was in the current month, count it
        if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth) {
          return parsedAmount; // Fixed monthly payment
        }
        return 0; // No payment this month
      case "semester":
        return parsedAmount / 6; // Assuming 6 months in a semester
      case "yearly":
        return parsedAmount / 12; // 12 months in a year
      case "termly":
        return parsedAmount / 4; // Divide by 4 for monthly calculation
      default:
        return parsedAmount; // One-off income
    }
  };

  const calculateMonthlyIncome = () => {
    return incomeItems.reduce((total, item) => {
      return total + getMonthlyIncome(item.amount, item.recurring, item.lastPaymentDate);
    }, 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mt-6">Total Monthly Income: £{calculateMonthlyIncome().toFixed(2)}</h2>
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Income Items</h3>
        <ul>
          {incomeItems.map((item, index) => {
            const monthlyIncome = getMonthlyIncome(item.amount, item.recurring, item.lastPaymentDate);

            return (
              <li key={index} className="border p-2 mb-2">
                <p>Source: {item.source}</p>
                <p>Amount: £{item.amount}</p>
                <p>Recurring: {item.recurring}</p>
                <p>Estimated Monthly Income: £{monthlyIncome.toFixed(2)}</p>
                <button
                  onClick={() => removeIncomeItem(index)}
                  className="mt-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default IncomeDashboard;