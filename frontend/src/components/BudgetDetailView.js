import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Check, X, Trash2, Pencil } from 'lucide-react';

const BudgetDetailView = ({ item, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudget, setEditedBudget] = useState(item ? item.budget : 0);
  const [spentAmount, setSpentAmount] = useState(item ? item.spent : 0);
  const [originalSpentAmount, setOriginalSpentAmount] = useState(item ? item.spent : 0);
  const [originalBudget, setOriginalBudget] = useState(item ? item.budget : 0);
  const [isRenamingItem, setIsRenamingItem] = useState(false);
  const [newItemName, setNewItemName] = useState(item ? item.name : '');

  useEffect(() => {
    if (item) {
      setEditedBudget(item.budget);
      setSpentAmount(item.spent);
      setOriginalSpentAmount(item.spent);
      setOriginalBudget(item.budget);
      setNewItemName(item.name);
    }
  }, [item]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (typeof onUpdate === 'function') {
      onUpdate({ ...item, budget: parseFloat(editedBudget), spent: spentAmount });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedBudget(originalBudget);
    setSpentAmount(originalSpentAmount);
  };

  const handleSpentChange = (e) => {
    const value = Math.max(0, Math.min(e.target.value, editedBudget));
    setSpentAmount(value);
    onUpdate({ ...item, budget: parseFloat(editedBudget), spent: parseFloat(value) });
  };

  const handleBudgetChange = (e) => {
    const value = Math.max(0, parseFloat(e.target.value));
    setEditedBudget(value);
  };

  const handleRemove = () => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      onRemove(item.id);
    }
  };

  const handleRenameClick = () => {
    setIsRenamingItem(true);
    setNewItemName(item.name);
  };

  const handleRenameSubmit = () => {
    if (newItemName.trim() && newItemName !== item.name) {
      onUpdate({ ...item, name: newItemName.trim() });
    }
    setIsRenamingItem(false);
  };

  if (!item) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <div className="max-w-sm mx-auto space-y-4">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="text-gray-500">
            Select a budget item from the list to view its details
          </p>
        </div>
      </div>
    );
  }

  const budget = editedBudget;
  const remaining = budget - spentAmount;
  const percentSpent = (spentAmount / budget) * 100;
  const isOverBudget = spentAmount > budget;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        {isRenamingItem ? (
          <div className="flex items-center space-x-2 flex-1 mr-4">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="text-2xl font-bold text-gray-900 border rounded px-2 py-1 flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setIsRenamingItem(false);
              }}
              onBlur={handleRenameSubmit}
            />
          </div>
        ) : (
          <h3 className="text-2xl font-bold text-gray-900">{newItemName}</h3>
        )}
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRenameClick} 
            className="text-gray-600 hover:text-gray-800"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button 
            onClick={handleRemove} 
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
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
                step="0.01"
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
              step="0.01"
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

      {isEditing ? (
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Check className="h-5 w-5 mr-2" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={handleEditClick}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Budget
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetDetailView;