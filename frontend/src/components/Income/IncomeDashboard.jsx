import React from "react";
import { useSelector } from "react-redux";

const IncomeDashboard = ({ incomeItems, removeIncomeItem }) => {
  const budgetItems = useSelector((state) =>
    Object.values(state.items.itemsByCategory).flat()
  );

  const getMonthlyIncome = (amount, recurring, lastPaymentDate) => {
    const parsedAmount = parseFloat(amount);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    let paymentCount = 0;
    let nextPaymentDate = lastPaymentDate ? new Date(lastPaymentDate) : null;

    switch (recurring) {
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
        if (!nextPaymentDate) return parsedAmount;
        if (nextPaymentDate >= startOfMonth && nextPaymentDate <= endOfMonth)
          return parsedAmount;
        return 0;
      case "semester":
        return parsedAmount / 6; // 6 months per semester
      case "yearly":
        return parsedAmount / 12; // 12 months per year
      case "termly":
        return parsedAmount / 4; // 4 months per term (student finance assumption)
      default:
        return parsedAmount; // One-off
    }
  };

  const calculateMonthlyIncome = () => {
    return incomeItems.reduce(
      (total, item) =>
        total +
        getMonthlyIncome(item.amount, item.recurring, item.lastPaymentDate),
      0
    );
  };

  const calculateMonthlyExpenses = () => {
    return budgetItems.reduce((total, item) => total + (item.spent || 0), 0);
  };

  const monthlyIncome = calculateMonthlyIncome();
  const monthlyExpenses = calculateMonthlyExpenses();
  const fundsAvailable = monthlyIncome - monthlyExpenses;

  return (
    <div>
      <h2 className="text-2xl font-bold mt-6">
        Total Monthly Income: £{monthlyIncome.toFixed(2)}
      </h2>
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-xl font-semibold">
          Funds Available: £{fundsAvailable.toFixed(2)}
        </h3>
        <p
          className={`text-sm mt-2 ${
            fundsAvailable < 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          {fundsAvailable < 0
            ? "Warning: You're overspending this month!"
            : "Nice! You’ve got some cash left to save or spend."}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Total Expenses: £{monthlyExpenses.toFixed(2)}
        </p>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Income Items</h3>
        {incomeItems.length === 0 ? (
          <p className="text-gray-500 mt-2">
            No income items added yet. Start by adding one!
          </p>
        ) : (
          <ul>
            {incomeItems.map((item, index) => {
              const monthlyIncome = getMonthlyIncome(
                item.amount,
                item.recurring,
                item.lastPaymentDate
              );
              return (
                <li
                  key={item._id || index}
                  className="border p-2 mb-2 rounded-lg bg-white shadow-sm"
                >
                  <p>
                    <strong>Source:</strong> {item.source}
                  </p>
                  <p>
                    <strong>Amount:</strong> £{item.amount}
                  </p>
                  <p>
                    <strong>Recurring:</strong> {item.recurring}
                  </p>
                  <p>
                    <strong>Estimated Monthly Income:</strong> £
                    {monthlyIncome.toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeIncomeItem(index)}
                    className="mt-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Student Tip:</strong> Set aside 10% of your monthly income for
          emergencies or fun—balance is key!
        </p>
      </div>
    </div>
  );
};

export default IncomeDashboard;
