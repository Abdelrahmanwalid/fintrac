import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
// Import your Redux actions:
import {
  updateItemAsync,
  selectItem,
  deleteItemAsync,
} from "../../../store/itemSlice";

const DetailHeader = ({ item }) => {
  const dispatch = useDispatch();
  const [isRenamingItem, setIsRenamingItem] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState(item?.name || "");

  React.useEffect(() => {
    if (item) {
      setNewItemName(item.name);
    }
  }, [item]);

  if (!item) return null;

  // 1) rename logic
  const handleRenameClick = () => {
    setIsRenamingItem(true);
  };

  const handleRenameSubmit = () => {
    setIsRenamingItem(false);
    if (newItemName.trim() && newItemName !== item.name) {
      const updatedItem = { ...item, name: newItemName.trim() };

      // Dispatch a Redux update instead of localStorage
      dispatch(
        updateItemAsync({
          itemId: updatedItem._id, // or updatedItem.id if that's your key
          itemData: updatedItem,
        })
      );
      // Optionally re-select this updated item in Redux
      dispatch(selectItem(updatedItem));
    } else {
      setNewItemName(item.name);
    }
  };

  // 2) delete logic
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      // Dispatch your delete thunk
      dispatch(deleteItemAsync(item._id));
      // Optionally clear the selected item
      dispatch(selectItem(null));
    }
  };

  return (
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
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") {
                setNewItemName(item.name);
                setIsRenamingItem(false);
              }
            }}
            onBlur={handleRenameSubmit}
          />
        </div>
      ) : (
        <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
      )}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleRenameClick}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Pencil className="h-5 w-5 text-gray-600 hover:text-gray-800" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 hover:bg-red-100 rounded-full transition-colors"
        >
          <Trash2 className="h-5 w-5 text-red-600 hover:text-red-800" />
        </button>
      </div>
    </div>
  );
};

export default DetailHeader;
