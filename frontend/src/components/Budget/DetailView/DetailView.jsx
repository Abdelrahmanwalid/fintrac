// frontend/src/components/Budget/DetailView/DetailView.js

import React from 'react';
import BudgetDetailView from './BudgetDetailView';
import { useItemContext } from '../Categories/Items/ItemContext';

const DetailView = () => {
  const { selectedItem, handleUpdateItem, handleDeleteItem } = useItemContext();

  if (!selectedItem) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500">Select an item to view details</p>
      </div>
    );
  }

  return (
    <BudgetDetailView
      item={selectedItem}
      onUpdate={(updates) => handleUpdateItem(selectedItem.categoryId, selectedItem.id, updates)}
      onRemove={() => {
        if (window.confirm('Are you sure you want to delete this item?')) {
          handleDeleteItem(selectedItem.categoryId, selectedItem.id);
        }
      }}
    />
  );
};

export default DetailView;