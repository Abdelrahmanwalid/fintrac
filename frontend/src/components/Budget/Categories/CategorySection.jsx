import React, { useState, useEffect } from "react";
import BudgetCategoryList from "./BudgetCategoryList";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoriesAsync,
  addCategoryAsync,
} from "../../../store/categorySlice";

const CategorySection = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(
    (state) => state.categories
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      console.error("Category name cannot be empty");
      return;
    }

    if (
      categories.some(
        (cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )
    ) {
      console.error("Category name already exists");
      return;
    }

    dispatch(addCategoryAsync(newCategoryName.trim()))
      .unwrap()
      .then(() => {
        setNewCategoryName("");
      })
      .catch((error) => {
        console.error("Failed to add category:", error);
      });
  };

  return (
    <div className="w-full">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        {loading ? (
          <div className="text-gray-500 text-sm sm:text-base">
            Loading categories...
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm sm:text-base">
            Error: {error}
          </div>
        ) : (
          <>
            <BudgetCategoryList />
            {isAddingCategory ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="flex-grow p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleAddCategory}
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setNewCategoryName("");
                      setIsAddingCategory(false);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="mt-4 w-full bg-blue-50 p-3 sm:p-4 rounded-lg flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-100 transition-colors text-sm sm:text-base"
              >
                <Plus className="h-5 w-5" />
                <span>Add Category</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
