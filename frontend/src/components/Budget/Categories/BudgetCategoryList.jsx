import React, { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableCategory from './SortableCategory';
import SortableItem from './Items/SortableItem';
import { useCategoryContext } from './CategoryContext';
import { useItemContext } from './Items/ItemContext';

const BudgetCategoryList = () => {
  const { categories, setCategories } = useCategoryContext();
  const { selectedItem } = useItemContext();
  const expandTimeoutRef = useRef(null);
  const collapseTimeoutRef = useRef(null);
  const lastHoveredCategoryRef = useRef(null);
  const originalExpandStateRef = useRef({});

  const [activeState, setActiveState] = useState({ 
    id: null, 
    draggedCategory: null,
    draggedItem: null,
    type: null 
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 200,
        tolerance: 5,
      },
    }),
  );

  const handleDragStart = (event) => {
    const { active } = event;
    
    // Store original expand states
    originalExpandStateRef.current = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.isExpanded;
      return acc;
    }, {});

    if (active.data?.current?.type === 'category') {
      const draggedCategory = categories.find(cat => cat.id === active.id);
      setActiveState({
        id: active.id,
        draggedCategory,
        draggedItem: null,
        type: 'category'
      });
    } else if (active.data?.current?.type === 'item') {
      const draggedItem = active.data.current.item;
      setActiveState({
        id: active.id,
        draggedCategory: null,
        draggedItem,
        type: 'item'
      });
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (active.data?.current?.type !== 'item') return;

    clearTimeout(collapseTimeoutRef.current);

    // If not over anything, collapse the last hovered category
    if (!over) {
      if (lastHoveredCategoryRef.current) {
        const shouldCollapse = !originalExpandStateRef.current[lastHoveredCategoryRef.current];
        if (shouldCollapse) {
          collapseTimeoutRef.current = setTimeout(() => {
            setCategories(prevCategories => {
              const newCategories = prevCategories.map(cat => 
                cat.id === lastHoveredCategoryRef.current 
                  ? { ...cat, isExpanded: false } 
                  : cat
              );
              localStorage.setItem('budgetCategories', JSON.stringify(newCategories));
              return newCategories;
            });
          }, 150);
        }
      }
      clearTimeout(expandTimeoutRef.current);
      lastHoveredCategoryRef.current = null;
      return;
    }

    // Find the category we're hovering over
    const overCategory = categories.find(cat => {
      if (cat.id === over.id) return true;
      return cat.items.some(item => item.id === over.id);
    });

    if (!overCategory) return;

    // If we're hovering over a new category
    if (lastHoveredCategoryRef.current !== overCategory.id) {
      // Collapse the previous category if it wasn't originally expanded
      if (lastHoveredCategoryRef.current) {
        const shouldCollapse = !originalExpandStateRef.current[lastHoveredCategoryRef.current];
        if (shouldCollapse) {
          setCategories(prevCategories => {
            const newCategories = prevCategories.map(cat => 
              cat.id === lastHoveredCategoryRef.current 
                ? { ...cat, isExpanded: false } 
                : cat
            );
            localStorage.setItem('budgetCategories', JSON.stringify(newCategories));
            return newCategories;
          });
        }
      }

      clearTimeout(expandTimeoutRef.current);
      lastHoveredCategoryRef.current = overCategory.id;

      if (!overCategory.isExpanded) {
        expandTimeoutRef.current = setTimeout(() => {
          setCategories(prevCategories => {
            const newCategories = prevCategories.map(cat => 
              cat.id === overCategory.id ? { ...cat, isExpanded: true } : cat
            );
            localStorage.setItem('budgetCategories', JSON.stringify(newCategories));
            return newCategories;
          });
        }, 150);
      }
    }
  };

  const handleDragEnd = (event) => {
    clearTimeout(expandTimeoutRef.current);
    clearTimeout(collapseTimeoutRef.current);
    
    const { active, over } = event;
    
    if (!over) {
      // Restore original expand states for all categories
      setCategories(prevCategories => {
        const newCategories = prevCategories.map(cat => ({
          ...cat,
          isExpanded: originalExpandStateRef.current[cat.id]
        }));
        localStorage.setItem('budgetCategories', JSON.stringify(newCategories));
        return newCategories;
      });
      setActiveState({ id: null, draggedCategory: null, draggedItem: null, type: null });
      return;
    }

    // Handle category reordering
    if (active.data?.current?.type === 'category') {
      if (active.id !== over.id) {
        setCategories(prevCategories => {
          const oldIndex = prevCategories.findIndex(cat => cat.id === active.id);
          const newIndex = prevCategories.findIndex(cat => cat.id === over.id);
          
          const newCategories = [...prevCategories];
          const [movedCategory] = newCategories.splice(oldIndex, 1);
          newCategories.splice(newIndex, 0, movedCategory);
          
          localStorage.setItem('budgetCategories', JSON.stringify(newCategories));
          return newCategories;
        });
      }
    }
    // Handle item movement
    else if (active.data?.current?.type === 'item') {
      const activeId = active.id;
      const overId = over.id;
      
      setCategories(prevCategories => {
        const sourceCategory = prevCategories.find(cat => 
          cat.items.some(item => item.id === activeId)
        );
        const targetCategory = prevCategories.find(cat => 
          cat.id === overId || cat.items.some(item => item.id === overId)
        );

        if (!sourceCategory || !targetCategory) return prevCategories;

        const newCategories = prevCategories.map(category => {
          // Moving within the same category
          if (sourceCategory.id === targetCategory.id && category.id === sourceCategory.id) {
            const oldIndex = category.items.findIndex(item => item.id === activeId);
            const newIndex = category.items.findIndex(item => item.id === overId);
            
            if (oldIndex === -1 || newIndex === -1) return category;
            
            const newItems = arrayMove([...category.items], oldIndex, newIndex);
            return { ...category, items: newItems };
          }
          
          // Moving between different categories
          if (sourceCategory.id !== targetCategory.id) {
            // Remove from source category
            if (category.id === sourceCategory.id) {
              return {
                ...category,
                items: category.items.filter(item => item.id !== activeId)
              };
            }
            // Add to target category
            if (category.id === targetCategory.id) {
              const itemToMove = sourceCategory.items.find(item => item.id === activeId);
              const updatedItem = { ...itemToMove, categoryId: targetCategory.id };
              
              if (over.data?.current?.type === 'item') {
                const targetIndex = category.items.findIndex(item => item.id === overId);
                const newItems = [...category.items];
                newItems.splice(targetIndex, 0, updatedItem);
                return { ...category, items: newItems };
              }
              return {
                ...category,
                items: [...category.items, updatedItem]
              };
            }
          }
          return category;
        });

        localStorage.setItem('budgetCategories', JSON.stringify(newCategories));
        return newCategories;
      });
    }
    
    lastHoveredCategoryRef.current = null;
    originalExpandStateRef.current = {};
    setActiveState({ id: null, draggedCategory: null, draggedItem: null, type: null });
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={categories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
          {categories.map((category) => (
            <SortableCategory
              key={category.id}
              category={category}
              activeState={activeState}
              setActiveState={setActiveState}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeState.type === 'category' && activeState.draggedCategory && (
            <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 opacity-90">
              {activeState.draggedCategory.name}
            </div>
          )}
          {activeState.type === 'item' && activeState.draggedItem && (
            <SortableItem
              item={activeState.draggedItem}
              categoryId={activeState.draggedItem.categoryId}
              isSelected={selectedItem?.id === activeState.draggedItem.id}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BudgetCategoryList;