import React from 'react';

const BudgetSummary = ({ item }) => {
  const progress = Math.round((item.spent / item.budget) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <p className="text-sm text-green-700 font-medium">Budget</p>
          <p className="text-2xl font-bold text-green-700">
            ${item.budget}
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Spent</p>
          <p className="text-2xl font-bold text-blue-700">
            ${item.spent}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="text-gray-900 font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(progress, 100)}%`,
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          ${item.budget - item.spent} remaining
        </p>
      </div>
    </div>
  );
};

export default BudgetSummary;