import React from "react";
import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useItemContext } from './ItemContext';

const SortableItem = ({ item, categoryId }) => {
  const { selectedItem, handleSelectItem } = useItemContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    data: {
      type: 'item',
      item: { ...item, categoryId }
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    cursor: 'default',
    position: 'relative',
    zIndex: isDragging ? 999 : 1,
  };

  const isSelected = selectedItem?.id === item.id;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 rounded-lg bg-white border border-gray-200
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'shadow-sm'}
        ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
        transition-shadow duration-200`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="relative px-2 py-2 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <button
        onClick={() => handleSelectItem(item)}
        className={`flex-grow p-2 text-left rounded-lg transition-all duration-200 
          ${isSelected ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
      >
        {item.name}
      </button>
    </li>
  );
};

export default SortableItem;