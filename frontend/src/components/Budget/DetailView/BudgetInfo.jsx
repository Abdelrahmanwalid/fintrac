import React from 'react';

const BudgetInfo = ({ isEditing, editedBudget, handleBudgetChange, spentAmount, handleSpentChange, remaining, isOverBudget }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">Budget</p>
      {isEditing ? (
        <div className="flex items-center">
          <span className="text-xl font-semibold mr-2">$</span>
          <input
            type="number"
            value={editedBudget}
            onChange={handleBudgetChange}
            className="w-full text-xl font-semibold bg-white border border-gray-300 rounded px-2 py-1"
            min="0"
            step="1"
          />
        </div>
      ) : (
        <p className="text-xl font-semibold">${editedBudget.toFixed(2)}</p>
      )}
    </div>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">Spent</p>
      {isEditing ? (
        <input
          type="number"
          value={spentAmount}
          onChange={handleSpentChange}
          className="w-full text-xl font-semibold bg-white border border-gray-300 rounded px-2 py-1"
          min="0"
          step="1"
        />
      ) : (
        <p className="text-xl font-semibold">${spentAmount.toFixed(2)}</p>
      )}
    </div>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">Remaining</p>
      <p className={`text-xl font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
        ${remaining.toFixed(2)}
      </p>
    </div>
  </div>
);

export default BudgetInfo;