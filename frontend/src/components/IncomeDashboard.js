import React from "react";

const IncomeDashboard = ({ incomeItems }) => {
  const calculateMonthlyIncome = () => {
    return incomeItems.reduce((total, item) => {
      const amount = parseFloat(item.amount);
      switch (item.recurring) {
        case "weekly":
          return total + amount * 4; // Assuming 4 weeks in a month
        case "bi-weekly":
          return total + amount * 2; // 2 bi-weekly payments in a month
        case "monthly":
          return total + amount;
        case "semester":
          return total + amount / 6; // Assuming 6 months in a semester
        case "yearly":
          return total + amount / 12; // 12 months in a year
        default:
          return total; // One-off income
      }
    }, 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mt-6">Total Monthly Income: £{calculateMonthlyIncome().toFixed(2)}</h2>
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Income Items</h3>
        <ul>
          {incomeItems.map((item, index) => (
            <li key={index} className="border p-2 mb-2">
              <p>Source: {item.source}</p>
              <p>Amount: £{item.amount}</p>
              <p>Recurring: {item.recurring}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IncomeDashboard;