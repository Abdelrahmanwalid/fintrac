import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { fetchItemsAsync, selectItemsByCategory, updateItemOrderAsync } from '../../../../store/itemSlice';
import SortableItem from './SortableItem';

const ItemList = ({ categoryId }) => {
  const dispatch = useDispatch();
  const items = useSelector((state) => selectItemsByCategory(state, categoryId)) || [];

  // Fetch items when component mounts
  useEffect(() => {
    dispatch(fetchItemsAsync());
  }, [dispatch]);

  // Debugging: Log valid items
  items.forEach((item, index) => {
    if (!item || !item.name) {
      console.error(`Invalid item at index ${index}:`, item);
    }
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  
    const oldIndex = items.findIndex(item => item?._id === active.id);
    const newIndex = items.findIndex(item => item?._id === over.id);
  
    if (oldIndex === -1 || newIndex === -1) return;
  
    const movedItem = items[oldIndex];
  
    if (!movedItem) return;
  
    // Dispatch the update with a payload that matches the thunk expectation.
    dispatch(updateItemOrderAsync({
      itemId: movedItem._id,
      newOrder: newIndex,
      sourceCategoryId: categoryId,
      targetCategoryId: categoryId
    }));
  };
  return (
      <SortableContext 
        items={items.filter(item => item?._id).map(item => item._id)} // Ensure valid item IDs
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2">
          {items.length > 0 ? (
            items
              .filter(item => item?._id && item?.name) // Ensure valid items
              .map((item) => (
                <SortableItem
                  key={item._id} // Use _id as key
                  item={item}
                  categoryId={categoryId}
                />
              ))
          ) : (
            <li className="p-4 text-center text-gray-500 border-dashed border-2 border-gray-300 rounded-lg">
              Drop items here
            </li>
          )}
        </ul>
      </SortableContext>
  );
};

export default ItemList;