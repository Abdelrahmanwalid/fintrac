import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleAddItem = (categoryId, itemName) => {
    const newItem = {
      id: uuidv4(),
      name: itemName,
      categoryId: categoryId,
      budget: 10,
      spent: 0,
      frequency: 'monthly',
    };
    
    const storedCategories = JSON.parse(localStorage.getItem('budgetCategories') || '[]');
    const updatedCategories = storedCategories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: [...(category.items || []), newItem]
        };
      }
      return category;
    });
    
    localStorage.setItem('budgetCategories', JSON.stringify(updatedCategories));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('categoriesUpdated'));
  };

  const handleUpdateItem = (updatedItem) => {
    const storedCategories = JSON.parse(localStorage.getItem('budgetCategories') || '[]');
    const updatedCategories = storedCategories.map(category => {
      if (category.id === updatedItem.categoryId) {
        return {
          ...category,
          items: category.items.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          )
        };
      }
      return category;
    });
    
    localStorage.setItem('budgetCategories', JSON.stringify(updatedCategories));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <ItemContext.Provider value={{
      selectedItem,
      handleSelectItem,
      handleAddItem,
      handleUpdateItem
    }}>
      {children}
    </ItemContext.Provider>
  );
};

export const useItemContext = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItemContext must be used within an ItemProvider');
  }
  return context;
};