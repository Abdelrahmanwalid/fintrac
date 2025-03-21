import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchIncomeAsync } from "../../store/incomeSlice";
import { getMonthlyAmount } from "../../utils/incomeUtils";

const BudgetTracker = () => {
  const dispatch = useDispatch();

  const incomeItems = useSelector((state) => state.income?.incomeItems || []);
  const budgetItemsByCategory = useSelector(
    (state) => state.items?.itemsByCategory || {}
  );
  const budgetItems = Object.values(budgetItemsByCategory).flat();

  useEffect(() => {
    dispatch(fetchIncomeAsync());
  }, [dispatch]);

  const monthlyIncome = incomeItems.reduce(
    (total, item) =>
      total +
      getMonthlyAmount(item.amount, item.recurring, item.lastPaymentDate),
    0
  );

  const totalBudgeted = budgetItems.reduce(
    (total, item) => total + getMonthlyAmount(item.budget, item.frequency),
    0
  );
  const fundsRemaining = monthlyIncome - totalBudgeted;
  const isOverBudget = totalBudgeted > monthlyIncome;

  return (
    <div className="w-full mb-6">
      <div className="max-w-md mx-auto bg-white p-4 sm:p-5 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-sm sm:text-base font-medium text-gray-800">
            Income:{" "}
            <span className="text-blue-600">£{monthlyIncome.toFixed(2)}</span>
          </span>
          <span className="text-sm sm:text-base font-medium text-gray-800">
            Budgeted:{" "}
            <span className="text-gray-800">£{totalBudgeted.toFixed(2)}</span>
          </span>
          <span
            className={`text-sm sm:text-base font-medium ${
              isOverBudget ? "text-red-600" : "text-green-600"
            }`}
          >
            Remaining: £{fundsRemaining.toFixed(2)}
          </span>
        </div>
        {isOverBudget && (
          <p className="mt-3 text-xs sm:text-sm text-red-600 bg-red-50 p-2 rounded-md">
            Warning: Your budget exceeds your monthly income!
          </p>
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;
