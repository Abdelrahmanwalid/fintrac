import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import BudgetDetailView from "./BudgetDetailView";
import {
  updateItemAsync,
  deleteItemAsync,
  fetchItemsAsync,
} from "../../../store/itemSlice";

function DetailView() {
  const dispatch = useDispatch();
  const selectedItem = useSelector((state) => state.items.selectedItem);
  const itemsByCategory = useSelector((state) => state.items.itemsByCategory);
  const loading = useSelector((state) => state.items.loading);

  useEffect(() => {
    console.log("DetailView mounted, fetching items...");
    dispatch(fetchItemsAsync());
  }, [dispatch]);

  // Find the latest version of selectedItem from itemsByCategory
  const getLatestItem = () => {
    if (!selectedItem || loading) return selectedItem;
    const categoryItems = itemsByCategory[selectedItem.categoryId] || [];
    const latestItem = categoryItems.find((i) => i._id === selectedItem._id);
    return latestItem || selectedItem;
  };

  const currentItem = getLatestItem();

  if (!currentItem) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500">Select an item to view details</p>
      </div>
    );
  }

  const handleUpdateItem = (updates) => {
    dispatch(
      updateItemAsync({
        itemId: currentItem._id,
        itemData: { ...currentItem, ...updates },
      })
    );
  };

  const handleDeleteItem = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteItemAsync(currentItem._id));
    }
  };

  return (
    <BudgetDetailView
      item={currentItem}
      onUpdate={handleUpdateItem}
      onRemove={handleDeleteItem}
    />
  );
}

export default DetailView;
