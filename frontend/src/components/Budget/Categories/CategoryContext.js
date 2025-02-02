import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchCategories,
  addCategory,
} from '../../../Api/categoryApi'; // Import the API functions

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]); // No longer use localStorage directly
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Fetch categories on initial load
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await fetchCategories();
        console.log('Fetched categories:', fetchedCategories); // Debug fetched data
        const mappedCategories = fetchedCategories.map((cat) => ({
          ...cat,
          id: cat._id, // Map `_id` to `id`
        }));
        setCategories(mappedCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err.message);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
  
    loadCategories();
  }, [setCategories, setLoading, setError]);
  const handleAddCategory = async () => {
  if (newCategoryName.trim() && !categories.some((cat) => cat.name === newCategoryName.trim())) {
    try {
      const newCategory = await addCategory(newCategoryName.trim());
      const updatedCategory = { ...newCategory, id: newCategory._id }; // Map `_id` to `id`
      const updatedCategories = [...categories, updatedCategory];
      setCategories(updatedCategories); // Update state
      localStorage.setItem('categories', JSON.stringify(updatedCategories)); // Sync localStorage
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (err) {
      console.error('Failed to add category:', err.message);
    }
  } else {
    console.error('Category name is invalid or already exists');
  }
};



  const handleToggle = (categoryId) => {
    console.log('Toggling category:', categoryId);
    setCategories((prevCategories) =>
        prevCategories.map((category) =>
            category.id === categoryId
                ? { ...category, isExpanded: !category.isExpanded }
                : category
        )
    );
};


  return (
    <CategoryContext.Provider
      value={{
        categories,
        setCategories,
        loading,
        setLoading,
        error,
        setError,
        newCategoryName,
        setNewCategoryName,
        isAddingCategory,
        setIsAddingCategory,
        handleAddCategory,
        handleToggle,
      }}
    >
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