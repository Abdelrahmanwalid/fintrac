import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

const ProgressInfo = ({ percentSpent, isOverBudget, remaining, budget, spentAmount }) => (
  <>
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">Spending Progress</span>
        <span className="text-sm font-medium text-gray-500">{percentSpent.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-600' : 'bg-blue-600'}`}
          style={{ width: `${Math.min(percentSpent, 100)}%` }}
        ></div>
      </div>
    </div>

    {isOverBudget && (
      <div className="flex items-center p-4 bg-red-100 text-red-700 rounded-lg mb-6">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">You've exceeded your budget for this item.</span>
      </div>
    )}

    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
      <div className="flex items-center">
        {isOverBudget ? (
          <TrendingUp className="h-5 w-5 text-red-600 mr-2" />
        ) : (
          <TrendingDown className="h-5 w-5 text-green-600 mr-2" />
        )}
        <span className="text-sm font-medium text-gray-700">
          {isOverBudget ? 'Overspending' : 'Within budget'}
        </span>
      </div>
      <span className="text-sm font-medium text-gray-700">
        {isOverBudget ? `$${(spentAmount - budget).toFixed(2)} over` : `$${remaining.toFixed(2)} left`}
      </span>
    </div>
  </>
);

export default ProgressInfo;