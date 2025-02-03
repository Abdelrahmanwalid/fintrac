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

// Import Redux stuff
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
  // items from itemSlice, so we can reorder them properly
  const itemsByCategory = useSelector((state) => state.items.itemsByCategory);
  const selectedItem = useSelector((state) => state.items.selectedItem);

  // Refs for auto-expanding categories during drag
  const expandTimeoutRef = useRef(null);
  const collapseTimeoutRef = useRef(null);
  const lastHoveredCategoryRef = useRef(null);
  // Track which categories were expanded pre-drag, so we can collapse them again
  const originalExpandStateRef = useRef({});

  // Local state for the DragOverlay
  const [activeState, setActiveState] = useState({
    id: null,
    draggedCategory: null,
    draggedItem: null,
    type: null,
  });

  // Configure sensors (keep the delay, distance, and the user’s tolerance)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 200,
        tolerance: 5, // not officially documented, but we keep it
      },
    })
  );

  // Helper to reset local drag data
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

    // Save expansions for each category
    originalExpandStateRef.current = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.isExpanded;
      return acc;
    }, {});

    const activeItem = active.data.current;
    if (activeItem.type === "category") {
      const draggedCategory = categories.find((cat) => cat.id === active.id);
      if (draggedCategory) {
        setActiveState({
          id: active.id,
          draggedCategory,
          draggedItem: null,
          type: "category",
        });
      }
    } else if (activeItem.type === "item") {
      setActiveState({
        id: active.id,
        draggedCategory: null,
        draggedItem: activeItem.item,
        type: "item",
      });
    }
  };

  // ----------------------
  // onDragOver (auto-expand categories)
  // ----------------------
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.data?.current?.type !== "item") return;
    clearTimeout(collapseTimeoutRef.current);

    // Find the category being hovered
    const overCategory = categories.find((cat) => {
      if (cat.id === over.id) {
        return true; // hovered over the category container itself
      }
      const catItems = itemsByCategory[cat.id] || [];
      return catItems.some((itm) => itm._id === over.id);
    });

    if (!overCategory) return;

    // If we switched hovered categories, collapse the old one if needed, expand the new one
    if (lastHoveredCategoryRef.current !== overCategory.id) {
      if (lastHoveredCategoryRef.current) {
        const oldCatId = lastHoveredCategoryRef.current;
        const wasExpanded = originalExpandStateRef.current[oldCatId];
        // If it was NOT originally expanded, we collapse it
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
    if (!over) {
      resetDragState();
      return;
    }
    const activeData = active.data?.current;
    if (!activeData) {
      resetDragState();
      return;
    }

    // ======================
    // 1) Category Reorder
    // ======================
    if (activeData.type === "category") {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        // Reorder array
        const updated = [...categories];
        const [removed] = updated.splice(oldIndex, 1);
        updated.splice(newIndex, 0, removed);

        // Reassign 'order'
        const finalCategories = updated.map((cat, i) => ({
          ...cat,
          order: i,
        }));

        // Optimistic local update
        dispatch(updateCategoryOrderOptimistic(finalCategories));
        // Server update
        dispatch(updateCategoryOrderAsync(finalCategories));
      }
    }
    // ======================
    // 2) Item Reorder
    // ======================
    else if (activeData.type === "item") {
      const activeId = active.id; // the item._id

      // find the source category by scanning itemsByCategory
      const sourceCategoryId = Object.keys(itemsByCategory).find((catId) =>
        (itemsByCategory[catId] || []).some((itm) => itm._id === activeId)
      );
      if (!sourceCategoryId) {
        resetDragState();
        return;
      }

      // figure out the target category
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

      // same-category reorder
      if (targetCategoryId === sourceCategoryId) {
        const itemsArray = itemsByCategory[sourceCategoryId] || [];
        const oldIndex = itemsArray.findIndex((itm) => itm._id === activeId);

        const overItemId = over.id;
        let newIndex = itemsArray.findIndex((itm) => itm._id === overItemId);

        console.log("Item Reorder Debug => oldIndex:", oldIndex, " raw newIndex:", newIndex);

        // If we didn't find an item or the user is dropping on itself, place at the end
        if (newIndex === -1 || overItemId === activeId) {
          newIndex = itemsArray.length - 1;
        }
        // If dragging the item downward, place it below that item
        if (oldIndex < newIndex) {
          newIndex -= 1;
        }
        if (newIndex < 0) newIndex = 0;

        console.log("Corrected newIndex:", newIndex);
        if (newIndex !== oldIndex) {
          dispatch(
            updateItemOrderAsync({
              itemId: activeId,
              newOrder: newIndex,
              sourceCategoryId,
              targetCategoryId: sourceCategoryId,
            })
          );
        } else {
          console.log("No reorder triggered (same index).");
        }
      }
      // cross-category move
      else {
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
            // read items from itemSlice
            const itemsForCat = itemsByCategory[category.id] || [];

            return (
              <SortableCategory key={category.id} category={category}>
                {category.isExpanded && (
                  <div style={{ marginLeft: "2rem", marginTop: "0.5rem" }}>
                    {/* Nested SortableContext for items in this category */}
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
