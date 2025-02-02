import React, { useState, useEffect } from 'react';
import BudgetCategoryList from './BudgetCategoryList';
import { Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoriesAsync, addCategoryAsync } from '../../../store/categorySlice';

const CategorySection = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.categories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      console.error('Category name cannot be empty');
      return;
    }
  
    if (categories.some((cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      console.error('Category name already exists');
      return;
    }
  
    // Dispatch Redux thunk to add category
    dispatch(addCategoryAsync(newCategoryName.trim()))
      .unwrap()
      .then(() => {
        setNewCategoryName('');
      })
      .catch((error) => {
        console.error('Failed to add category:', error);
      });
  };

  return (
    <div className="lg:w-1/3 space-y-4">
      {loading ? (
        <div>Loading categories...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <>
          <BudgetCategoryList />
          {isAddingCategory ? (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="flex-grow p-2 border rounded-lg"
              />
              <button
                onClick={handleAddCategory}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setNewCategoryName('');
                  setIsAddingCategory(false);
                }}
                className="p-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Category</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CategorySection;