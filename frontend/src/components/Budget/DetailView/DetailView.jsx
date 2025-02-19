import React from "react";
import { useSelector, useDispatch } from "react-redux";
import BudgetDetailView from "./BudgetDetailView";

// Import your Redux actions
import { updateItemAsync, deleteItemAsync } from "../../../store/itemSlice"; 

function DetailView() {
  const dispatch = useDispatch();

  // 1) Grab the selected item from Redux. 
  //    (Assuming your itemSlice has "selectedItem" or you have a selector.)
  const selectedItem = useSelector((state) => state.items.selectedItem);

  if (!selectedItem) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500">Select an item to view details</p>
      </div>
    );
  }

  // 2) Handlers that dispatch your Redux thunks
  const handleUpdateItem = (updates) => {
    dispatch(
      updateItemAsync({
        itemId: selectedItem._id, // or .id if that's how your item is stored
        itemData: { ...selectedItem, ...updates },
      })
    );
  };

  const handleDeleteItem = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteItemAsync(selectedItem._id)); 
    }
  };

  return (
    <BudgetDetailView
      item={selectedItem}
      onUpdate={handleUpdateItem}
      onRemove={handleDeleteItem}
    />
  );
}

export default DetailView;