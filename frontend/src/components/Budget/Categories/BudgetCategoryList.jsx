import React, { useState, useRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableCategory from "./SortableCategory";
import SortableItem from "./Items/SortableItem";

// Redux
import { useSelector, useDispatch } from "react-redux";
import {
  updateCategoryOrderAsync,
  updateCategoryOrderOptimistic,
  expandCategory,
  collapseCategory,
} from "../../../store/categorySlice";
import {
  updateItemOrderAsync,
} from "../../../store/itemSlice";

const BudgetCategoryList = () => {
  const dispatch = useDispatch();
  // categories from categorySlice
  const categories = useSelector((state) => state.categories.categories);
  // items from itemSlice
  const itemsByCategory = useSelector((state) => state.items.itemsByCategory);
  const selectedItem = useSelector((state) => state.items.selectedItem);

  // For auto-expanding categories
  const expandTimeoutRef = useRef(null);
  const collapseTimeoutRef = useRef(null);
  const lastHoveredCategoryRef = useRef(null);
  const originalExpandStateRef = useRef({});

  // Local drag state (for DragOverlay)
  const [activeState, setActiveState] = useState({
    id: null,
    draggedCategory: null,
    draggedItem: null,
    type: null,
  });

  // Configure PointerSensor
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Reset local refs/states
  const resetDragState = () => {
    lastHoveredCategoryRef.current = null;
    originalExpandStateRef.current = {};
    setActiveState({ id: null, draggedCategory: null, draggedItem: null, type: null });
  };

  // ----------------------
  // onDragStart
  // ----------------------
  const handleDragStart = (event) => {
    const { active } = event;
    if (!active?.data?.current) {
      console.warn("Drag Start: Active item is undefined or invalid.");
      return;
    }
    console.log("Drag Start:", active);

    // Save expansions
    originalExpandStateRef.current = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.isExpanded;
      return acc;
    }, {});

    const activeData = active.data.current;
    if (activeData.type === "category") {
      const draggedCategory = categories.find((cat) => cat.id === active.id);
      if (draggedCategory) {
        setActiveState({
          id: active.id,
          draggedCategory,
          draggedItem: null,
          type: "category",
        });
      }
    } else if (activeData.type === "item") {
      setActiveState({
        id: active.id,
        draggedCategory: null,
        draggedItem: activeData.item,
        type: "item",
      });
    }
  };

  // ----------------------
  // onDragOver (expand categories)
  // ----------------------
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.data?.current?.type !== "item") return;
    clearTimeout(collapseTimeoutRef.current);

    // Find the category hovered
    const overCategory = categories.find((cat) => {
      if (cat.id === over.id) return true;
      const catItems = itemsByCategory[cat.id] || [];
      return catItems.some((itm) => itm._id === over.id);
    });

    if (!overCategory) return;

    // Possibly collapse old hovered category, expand new hovered
    if (lastHoveredCategoryRef.current !== overCategory.id) {
      if (lastHoveredCategoryRef.current) {
        const oldCatId = lastHoveredCategoryRef.current;
        const wasExpanded = originalExpandStateRef.current[oldCatId];
        if (!wasExpanded) {
          dispatch(collapseCategory(oldCatId));
        }
      }
      clearTimeout(expandTimeoutRef.current);
      lastHoveredCategoryRef.current = overCategory.id;

      if (!overCategory.isExpanded) {
        expandTimeoutRef.current = setTimeout(() => {
          dispatch(expandCategory(overCategory.id));
        }, 150);
      }
    }
  };

  // ----------------------
  // onDragEnd
  // ----------------------
  const handleDragEnd = (event) => {
    clearTimeout(expandTimeoutRef.current);
    clearTimeout(collapseTimeoutRef.current);
  
    const { active, over } = event;
  
    console.log("HANDLE DRAG END");
    console.log("  active:", active.id, " type:", active.data?.current?.type);
    console.log("  over:", over?.id, " type:", over?.data?.current?.type, " containerId:", over?.data?.current?.containerId);
  
    if (!over) {
      console.log("No 'over' => no reorder");
      resetDragState();
      return;
    }
  
    const activeData = active.data?.current;
    if (!activeData) {
      console.log("No activeData => no reorder");
      resetDragState();
      return;
    }
    // 1) Category Reorder
    if (activeData.type === "category") {
      console.log("Category reorder block");
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const updated = [...categories];
        const [removed] = updated.splice(oldIndex, 1);
        updated.splice(newIndex, 0, removed);

        // Reassign .order
        const finalCategories = updated.map((cat, i) => ({
          ...cat,
          order: i,
        }));

        dispatch(updateCategoryOrderOptimistic(finalCategories));
        dispatch(updateCategoryOrderAsync(finalCategories));
      }
    }

    // 2) Item Reorder
    else if (activeData.type === "item") {
      console.log("Item reorder block");
      const activeId = active.id; // item._id

      // Find source category via itemsByCategory
      const sourceCategoryId = Object.keys(itemsByCategory).find((catId) =>
        (itemsByCategory[catId] || []).some((itm) => itm._id === activeId)
      );
      if (!sourceCategoryId) {
        resetDragState();
        return;
      }

      // Determine target category
      let targetCategoryId = null;
      if (over.data?.current?.type === "category") {
        targetCategoryId = over.id;
      } else if (over.data?.current?.type === "item") {
        targetCategoryId = over.data?.current?.containerId;
      }
      if (!targetCategoryId) {
        resetDragState();
        return;
      }

      // same-category reorder (SIMPLE)
      if (targetCategoryId === sourceCategoryId) {
        console.log("SAME-CATEGORY reorder");
        const itemsArray = itemsByCategory[sourceCategoryId] || [];
        // oldIndex
        const oldIndex = itemsArray.findIndex((itm) => itm._id === activeId);
        // newIndex
        const overItemId = over.id;
        const newIndex = itemsArray.findIndex((itm) => itm._id === overItemId);

        console.log("Item Reorder Debug => oldIndex:", oldIndex, "raw newIndex:", newIndex);

        // If we can't find that 'over' item or we dropped on the same item => do nothing
        if (oldIndex === -1 || newIndex === -1 || overItemId === activeId) {
          console.log("No reorder triggered (invalid drop).");
          resetDragState();
          return;
        }

        // If same index => no move
        if (oldIndex === newIndex) {
          console.log("No reorder triggered (same index).");
          resetDragState();
          return;
        }

        // Otherwise, reorder
        dispatch(
          updateItemOrderAsync({
            itemId: activeId,
            newOrder: newIndex,
            sourceCategoryId,
            targetCategoryId: sourceCategoryId,
          })
        );
      }
      // cross-category move
      else {
        console.log("CROSS-CATEGORY reorder")
        const targetItems = itemsByCategory[targetCategoryId] || [];
        let newIndex = targetItems.length;

        if (over.data?.current?.type === "item") {
          const overIndex = targetItems.findIndex((itm) => itm._id === over.id);
          if (overIndex >= 0) {
            newIndex = overIndex;
          }
        }

        dispatch(
          updateItemOrderAsync({
            itemId: activeId,
            newOrder: newIndex,
            sourceCategoryId,
            targetCategoryId,
          })
        );
      }
    }

    resetDragState();
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
        {/* SortableContext for categories */}
        <SortableContext
          items={categories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => {
            const itemsForCat = itemsByCategory[category.id] || [];

            return (
              <SortableCategory key={category.id} category={category}>
                {category.isExpanded && (
                  <div style={{ marginLeft: "2rem", marginTop: "0.5rem" }}>
                    <SortableContext
                      items={itemsForCat.map((itm) => itm._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {itemsForCat.map((itm) => (
                        <SortableItem
                          key={itm._id}
                          item={itm}
                          categoryId={category.id}
                          isSelected={selectedItem?.id === itm._id}
                        />
                      ))}
                    </SortableContext>
                  </div>
                )}
              </SortableCategory>
            );
          })}
        </SortableContext>

        <DragOverlay>
          {/* Category overlay */}
          {activeState.type === "category" && activeState.draggedCategory && (
            <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 opacity-90">
              {activeState.draggedCategory.name}
            </div>
          )}
          {/* Item overlay */}
          {activeState.type === "item" && activeState.draggedItem && (
            <div className="bg-white rounded-md shadow-lg border p-2">
              {activeState.draggedItem.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BudgetCategoryList;
