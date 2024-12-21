import React from 'react';
import { useCategoryContext } from './Categories/CategoryContext';
import { useBudgetContext } from '../../context/BudgetContext';

const BudgetOverview = () => {
  const { categories } = useCategoryContext();
  const { calculateMonthlyIncome } = useBudgetContext();

  const monthlyIncome = calculateMonthlyIncome();

  const calculateTotalBudget = () => {
    return categories.reduce((total, category) => {
      return total + category.items.reduce((catTotal, item) => catTotal + item.budget, 0);
    }, 0);
  };

  const totalBudget = calculateTotalBudget();
  const remainingBudget = monthlyIncome - totalBudget;
  const budgetUtilization = (totalBudget / monthlyIncome) * 100;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-900">Monthly Budget Overview</h2>
      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Monthly Income:</span>
          <span className="font-medium">£{monthlyIncome.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Budgeted:</span>
          <span className="font-medium">£{totalBudget.toFixed(2)}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${budgetUtilization > 100 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Remaining to Budget:</span>
          <span className={`font-medium ${remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}`}>
            £{remainingBudget.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview; 