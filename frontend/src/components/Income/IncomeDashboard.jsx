import React from "react";
import { useSelector } from "react-redux";
import { getMonthlyAmount } from "../../utils/incomeUtils";

const IncomeDashboard = ({ incomeItems, removeIncomeItem }) => {
  const budgetItems = useSelector((state) =>
    Object.values(state.items.itemsByCategory).flat()
  );

  const calculateMonthlyIncome = () => {
    return incomeItems.reduce(
      (total, item) =>
        total +
        getMonthlyAmount(item.amount, item.recurring, item.lastPaymentDate),
      0
    );
  };

  const calculateTotalBudgeted = () => {
    return budgetItems.reduce(
      (total, item) => total + getMonthlyAmount(item.budget, item.frequency),
      0
    );
  };

  const monthlyIncome = calculateMonthlyIncome();
  const totalBudgeted = calculateTotalBudgeted();
  const fundsRemaining = monthlyIncome - totalBudgeted;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
        Total Monthly Income:{" "}
        <span className="text-blue-600">£{monthlyIncome.toFixed(2)}</span>
      </h2>
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          Funds Remaining:{" "}
          <span
            className={fundsRemaining < 0 ? "text-red-600" : "text-green-600"}
          >
            £{fundsRemaining.toFixed(2)}
          </span>
        </h3>
        <p
          className={`text-xs sm:text-sm mt-2 ${
            fundsRemaining < 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {fundsRemaining < 0
            ? "Warning: Your budget exceeds your monthly income!"
            : "Nice! You’ve got some cash left to save or spend."}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Total Budgeted: £{totalBudgeted.toFixed(2)}
        </p>
      </div>
      <div className="mt-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          Income Items
        </h3>
        {incomeItems.length === 0 ? (
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            No income items added yet. Start by adding one!
          </p>
        ) : (
          <ul className="mt-2 space-y-3">
            {incomeItems.map((item, index) => {
              const monthlyIncome = getMonthlyAmount(
                item.amount,
                item.recurring,
                item.lastPaymentDate
              );
              return (
                <li
                  key={item._id || index}
                  className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm text-sm sm:text-base"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p>
                        <strong className="text-gray-700">Source:</strong>{" "}
                        <span className="text-gray-800">{item.source}</span>
                      </p>
                      <p>
                        <strong className="text-gray-700">Amount:</strong>{" "}
                        <span className="text-gray-800">£{item.amount}</span>
                      </p>
                      <p>
                        <strong className="text-gray-700">Recurring:</strong>{" "}
                        <span className="text-gray-800">{item.recurring}</span>
                      </p>
                      <p>
                        <strong className="text-gray-700">
                          Estimated Monthly Income:
                        </strong>{" "}
                        <span className="text-blue-600">
                          £{monthlyIncome.toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeIncomeItem(index)}
                      className="w-full sm:w-auto bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="mt-4 bg-blue-50 p-3 sm:p-4 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-700">
          <strong>Student Tip:</strong> Set aside 10% of your monthly income for
          emergencies or fun—balance is key!
        </p>
      </div>
    </div>
  );
};

export default IncomeDashboard;
