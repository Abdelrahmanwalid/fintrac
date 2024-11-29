import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

const ItemList = ({ items = [], categoryId }) => {
  if (!items) return null;

  return (
    <SortableContext 
      items={items.map(item => item.id)} 
      strategy={verticalListSortingStrategy}
    >
      <ul className="space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <SortableItem
              key={item.id}
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