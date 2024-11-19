import React, { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2, Pencil } from 'lucide-react';
import Modal from './Modal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, item, onSelect, isSelected, categoryId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 0,
    touchAction: 'none'
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 rounded-lg bg-white ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="relative px-2 py-2 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <button
        onClick={() => onSelect({ ...item, categoryId })}
        className={`flex-grow p-2 text-left rounded-lg transition-colors ${
          isSelected ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"
        }`}
      >
        {item.name}
      </button>
    </li>
  );
};

const SortableCategory = ({ category, onToggle, onSelectItem, selectedItemId, onAddItem, onRemoveCategory, onRenameCategory }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: category.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative',
    zIndex: isDragging ? 2 : 0,
    touchAction: 'none'
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(category.name);
  const [showControls, setShowControls] = useState(false);

  const handleAddItem = (itemName) => {
    console.log("Adding item:", itemName, "to category:", category.id);
    onAddItem(category.id, itemName);
  };

  const openModal = (e) => {
    e.stopPropagation();
    setModalPosition({ x: e.clientX, y: e.clientY });
    setIsModalVisible(true);
    console.log("Modal opened for category:", category.name);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    if (newName.trim() && newName !== category.name) {
      onRenameCategory(category.id, newName);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRename(e);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewName(category.name);
    }
  };

  const handleNameClick = (e) => {
    e.stopPropagation();
    setShowControls(!showControls);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 mb-4 ${
        isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''
      }`}
    >
      <div {...attributes} {...listeners}>
        <button
          onClick={() => onToggle(category.id)}
          className="flex items-center justify-between w-full p-4 text-left"
        >
          <div className="relative">
            {isEditing ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyPress}
                onClick={(e) => e.stopPropagation()}
                className="font-medium px-2 py-1 border rounded"
                autoFocus
              />
            ) : (
              <>
                <span 
                  onClick={handleNameClick}
                  className="font-medium hover:underline cursor-pointer"
                >
                  {category.name}
                </span>
                {showControls && (
                  <div className="absolute left-0 top-8 bg-white shadow-lg rounded-md py-2 px-3 z-10 space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                        setShowControls(false);
                      }}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 w-full"
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Rename</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCategory(category.id);
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-800 w-full"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center">
            <Plus 
              className="h-5 w-5 text-blue-600 cursor-pointer mr-2" 
              onClick={openModal} 
            />
            {category.isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </button>
      </div>
      {category.isExpanded && (
        <div className="p-4 pt-0">
          <SortableContext
            items={category.items}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-1">
              {category.items.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  item={item}
                  categoryId={category.id}
                  onSelect={onSelectItem}
                  isSelected={selectedItemId === item.id}
                />
              ))}
            </ul>
          </SortableContext>
        </div>
      )}
      <Modal
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddItem}
        initialPosition={modalPosition}
      />
    </div>
  );
};

const BudgetCategoryList = ({ categories, onToggleCategory, onSelectItem, selectedItemId, onDragEnd, onAddItem, onRemoveCategory, onRenameCategory }) => {
  const [activeId, setActiveId] = useState(null);
  const [activeDraggedItem, setActiveDraggedItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    const draggedCategory = categories.find(cat => cat.id === active.id);
    const draggedItem = categories.flatMap(cat => cat.items).find(item => item.id === active.id);
    setActiveDraggedItem(draggedCategory || draggedItem);
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={(event) => {
          setActiveId(null);
          setActiveDraggedItem(null);
          onDragEnd(event);
        }}
        onDragCancel={() => {
          setActiveId(null);
          setActiveDraggedItem(null);
        }}
      >
        <SortableContext
          items={categories}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => (
            <SortableCategory
              key={category.id}
              category={category}
              onToggle={onToggleCategory}
              onSelectItem={onSelectItem}
              selectedItemId={selectedItemId}
              onAddItem={onAddItem}
              onRemoveCategory={onRemoveCategory}
              onRenameCategory={onRenameCategory}
            />
          ))}
        </SortableContext>
        <DragOverlay dropAnimation={{
          duration: 150,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          scale: 1,
        }}>
          {activeDraggedItem && (
            <div className={`bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 ${activeId ? 'opacity-90' : 'opacity-0'} transition-all duration-150`}>
              {activeDraggedItem.name}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BudgetCategoryList