import React, { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  rectIntersection, // You can experiment with this too
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableCategory from "./SortableCategory";
import SortableItem from "./Items/SortableItem";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCategoryOrderAsync,
  updateCategoryOrderOptimistic,
  expandCategory,
  collapseCategory,
} from "../../../store/categorySlice";
import { updateItemOrderAsync } from "../../../store/itemSlice";

const BudgetCategoryList = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.categories);
  const selectedItem = useSelector((state) => state.items.selectedItem);

  // Refs for expansion/collapse timing and last hovered category:
  const expandTimeoutRef = useRef(null);
  const collapseTimeoutRef = useRef(null);
  const lastHoveredCategoryRef = useRef(null);
  const originalExpandStateRef = useRef({});

  // Active drag state for categories and items
  const [activeState, setActiveState] = useState({
    id: null,
    draggedCategory: null,
    draggedItem: null,
    type: null,
  });

  // Configure sensors (try with closestCenter or rectIntersection)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8, delay: 200, tolerance: 5 },
    })
  );

  // Reset drag state and refs
  const resetDragState = () => {
    lastHoveredCategoryRef.current = null;
    originalExpandStateRef.current = {};
    setActiveState({ id: null, draggedCategory: null, draggedItem: null, type: null });
  };

  const handleDragStart = (event) => {
    const { active } = event;
    if (!active || !active.data?.current) {
      console.warn("Drag Start: Active item is undefined or invalid.");
      return;
    }
    console.log("Drag Start:", active);
    // Save original expansion states for all categories
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

  const handleDragOver = (event) => {
    const { active, over } = event;
    console.log("DragOver event:", { active, over });
    if (!active || !over) {
      console.warn("Drag Over: Missing active or over item.");
      return;
    }
    if (active.data?.current?.type !== "item") return;
    clearTimeout(collapseTimeoutRef.current);

    // Find the category that is being hovered over by matching either the category id or one of its items.
    const overCategory = categories.find((cat) => {
      if (cat.id === over.id) return true;
      return cat.items && cat.items.some((item) => item.id === over.id);
    });
    console.log("Detected overCategory:", overCategory);
    if (!overCategory) return;

    if (lastHoveredCategoryRef.current !== overCategory.id) {
      // Collapse the previously hovered category if it wasn’t originally expanded.
      if (lastHoveredCategoryRef.current) {
        const shouldCollapse = !originalExpandStateRef.current[lastHoveredCategoryRef.current];
        if (shouldCollapse) {
          dispatch(collapseCategory(lastHoveredCategoryRef.current));
        }
      }
      clearTimeout(expandTimeoutRef.current);
      lastHoveredCategoryRef.current = overCategory.id;
      if (!overCategory.isExpanded) {
        expandTimeoutRef.current = setTimeout(() => {
          console.log("Expanding category:", overCategory.id);
          dispatch(expandCategory(overCategory.id));
        }, 150);
      }
    }
  };

  const handleDragEnd = (event) => {
    clearTimeout(expandTimeoutRef.current);
    clearTimeout(collapseTimeoutRef.current);
    const { active, over } = event;
    if (!over) {
      resetDragState();
      return;
    }

    // Category reordering
    if (active.data?.current?.type === "category") {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);
      if (oldIndex !== newIndex) {
        const updatedCategories = arrayMove(categories, oldIndex, newIndex).map((cat, index) => ({
          ...cat,
          order: index,
        }));
        dispatch(updateCategoryOrderOptimistic(updatedCategories));
        dispatch(updateCategoryOrderAsync(updatedCategories));
      }
    }
    // Handle item movement (including cross-category moves)
    else if (active.data?.current?.type === "item") {
      const activeId = active.id;
      let targetCategoryId = null;
      if (over.data?.current?.type === "category") {
        targetCategoryId = over.id;
      } else {
        const targetCategory = categories.find((cat) =>
          cat.items && cat.items.some((item) => item.id === over.id)
        );
        targetCategoryId = targetCategory ? targetCategory.id : null;
      }
      const sourceCategory = categories.find((cat) =>
        cat.items && cat.items.some((item) => item.id === activeId)
      );
      if (!sourceCategory || !targetCategoryId) {
        resetDragState();
        return;
      }
      const newOrder = (targetCategoryId === sourceCategory.id)
        ? sourceCategory.items.findIndex((item) => item.id === over.id)
        : (categories.find((cat) => cat.id === targetCategoryId).items || []).length;
      dispatch(updateItemOrderAsync({
        itemId: activeId,
        newOrder,
        sourceCategoryId: sourceCategory.id,
        targetCategoryId,
      }));
    }
    resetDragState();
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection} // or try rectIntersection
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={categories.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
          {categories.map((category) => (
            <SortableCategory key={category.id} category={category} />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeState.type === "category" && activeState.draggedCategory && (
            <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 opacity-90">
              {activeState.draggedCategory.name}
            </div>
          )}
          {activeState.type === "item" && activeState.draggedItem && (
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