import React, { useState } from 'react';
import BudgetCategoryList from './BudgetCategoryList';
import { CategoryProvider } from './CategoryContext';
import { Plus } from 'lucide-react';
import { useCategoryContext } from './CategoryContext';

const CategorySection = () => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { categories, setCategories } = useCategoryContext();

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const categoryNumber = categories.length + 1;
      const categoryId = `category-${categoryNumber}`;
      const newCategory = {
        id: categoryId,
        name: newCategoryName.trim(),
        isExpanded: true,
        items: [],
      };
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  return (
    <div className="lg:w-1/3 space-y-4">
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
            onClick={addCategory}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
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
    </div>
  );
};

export default CategorySection; 