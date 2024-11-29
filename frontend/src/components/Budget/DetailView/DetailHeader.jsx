import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useItemContext } from '../Categories/Items/ItemContext';
import { useCategoryContext } from '../Categories/CategoryContext';

const DetailHeader = ({ item }) => {
  const [isRenamingItem, setIsRenamingItem] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState(item?.name || '');
  const { handleUpdateItem, handleSelectItem } = useItemContext();
  const { categories, setCategories } = useCategoryContext();

  React.useEffect(() => {
    if (item) {
      setNewItemName(item.name);
    }
  }, [item]);

  if (!item) return null;

  const handleRenameClick = () => {
    setIsRenamingItem(true);
  };

  const handleRenameSubmit = () => {
    setIsRenamingItem(false);
    if (newItemName.trim() && newItemName !== item.name) {
      const updatedItem = { ...item, name: newItemName.trim() };
      handleUpdateItem(updatedItem);
      handleSelectItem(updatedItem);
    } else {
      setNewItemName(item.name);
    }
  };

  const handleDelete = () => {
    const updatedCategories = categories.map(category => {
      if (category.id === item.categoryId) {
        return {
          ...category,
          items: category.items.filter(i => i.id !== item.id)
        };
      }
      return category;
    });
    
    setCategories(updatedCategories);
    localStorage.setItem('budgetCategories', JSON.stringify(updatedCategories));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('categoriesUpdated'));
    handleSelectItem(null);
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
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') {
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
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this item?')) {
              handleDelete();
            }
          }}
          className="p-1 hover:bg-red-100 rounded-full transition-colors"
        >
          <Trash2 className="h-5 w-5 text-red-600 hover:text-red-800" />
        </button>
      </div>
    </div>
  );
};

export default DetailHeader;