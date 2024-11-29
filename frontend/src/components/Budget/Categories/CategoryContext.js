import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => {
    const storedCategories = localStorage.getItem('budgetCategories');
    return storedCategories ? JSON.parse(storedCategories) : [];
  });

  // Listen for storage events and local changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedCategories = localStorage.getItem('budgetCategories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      }
    };

    // Listen for storage events from other components
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events for local changes
    window.addEventListener('categoriesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('categoriesUpdated', handleStorageChange);
    };
  }, []);

  const handleAddCategory = (name) => {
    const newCategory = {
      id: uuidv4(),
      name,
      items: [],
      isExpanded: true,
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem('budgetCategories', JSON.stringify(updatedCategories));
    window.dispatchEvent(new Event('categoriesUpdated'));
  };

  const handleRename = (categoryId, newName) => {
    const updatedCategories = categories.map(category =>
      category.id === categoryId ? { ...category, name: newName } : category
    );
    setCategories(updatedCategories);
    localStorage.setItem('budgetCategories', JSON.stringify(updatedCategories));
    window.dispatchEvent(new Event('categoriesUpdated'));
  };

  const handleToggle = (categoryId) => {
    const updatedCategories = categories.map(category =>
      category.id === categoryId ? { ...category, isExpanded: !category.isExpanded } : category
    );
    setCategories(updatedCategories);
    localStorage.setItem('budgetCategories', JSON.stringify(updatedCategories));
    window.dispatchEvent(new Event('categoriesUpdated'));
  };

  const handleDelete = (categoryId) => {
    const updatedCategories = categories.filter(category => category.id !== categoryId);
    setCategories(updatedCategories);
    localStorage.setItem('budgetCategories', JSON.stringify(updatedCategories));
    window.dispatchEvent(new Event('categoriesUpdated'));
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      setCategories,
      handleAddCategory,
      handleRename,
      handleToggle,
      handleDelete,
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
}; 