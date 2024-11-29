import React, { useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil } from 'lucide-react';
import Modal from '../../Modal';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import ItemList from './Items/ItemList';
import ReactDOM from 'react-dom';
import { useCategoryContext } from './CategoryContext';

const SortableCategory = ({ category }) => {
  const { handleRename, handleToggle, handleDelete } = useCategoryContext();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalPosition, setModalPosition] = React.useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(category.name);
  const [showControls, setShowControls] = React.useState(false);
  const controlsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlsRef.current && !controlsRef.current.contains(event.target)) {
        setShowControls(false);
      }
    };

    if (showControls) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showControls]);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: category.id,
    data: {
      type: 'category',
      category
    }
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: category.id,
    data: {
      type: 'category',
      category
    }
  });

  const setNodeRef = (node) => {
    setSortableRef(node);
    setDroppableRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative',
    zIndex: isDragging ? 2 : 0,
    touchAction: 'none',
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    handleToggle(category.id);
  };

  const openModal = (e) => {
    e.stopPropagation();
    setModalPosition({ x: e.clientX, y: e.clientY });
    setIsModalVisible(true);
  };

  const handleNameClick = (e) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setModalPosition({ x: rect.left, y: rect.bottom });
    setShowControls(!showControls);
  };

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== category.name) {
      handleRename(category.id, newName);
    }
    setIsEditing(false);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowControls(false);
    if (window.confirm("Are you sure you want to remove this category and all its items?")) {
      handleDelete(category.id);
    }
  };

  const renderControls = () => (
    <div
      ref={controlsRef}
      style={{
        position: 'fixed',
        top: modalPosition.y,
        left: modalPosition.x,
        zIndex: 1000,
      }}
      className="control-menu bg-white shadow-lg rounded-md py-2 px-3 space-y-2"
    >
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
        onClick={handleDeleteClick}
        className="flex items-center space-x-2 text-red-600 hover:text-red-800 w-full"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 mb-4 
        ${isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''}`}
    >
      <div {...attributes} {...listeners}>
        <button
          onClick={handleToggleClick}
          className="flex items-center justify-between w-full p-4 text-left"
        >
          <div className="relative">
            {isEditing ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameSubmit();
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                    setNewName(category.name);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="font-medium px-2 py-1 border rounded"
                autoFocus
              />
            ) : (
              <>
                <span onClick={handleNameClick} className="font-medium hover:underline cursor-pointer">
                  {category.name}
                </span>
                {showControls && ReactDOM.createPortal(renderControls(), document.body)}
              </>
            )}
          </div>
          <div className="flex items-center">
            <Plus className="h-5 w-5 text-blue-600 cursor-pointer mr-2" onClick={openModal} />
            {category.isExpanded ? 
              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500" />
            }
          </div>
        </button>
      </div>
      
      {category.isExpanded && (
        <div className="p-4 pt-0">
          <ItemList
            key={`${category.id}-${category.items.length}`}
            items={category.items}
            categoryId={category.id}
          />
        </div>
      )}
      
      <Modal
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(itemName) => {
          setIsModalVisible(false);
        }}
        initialPosition={modalPosition}
        categoryId={category.id}
      />
    </div>
  );
};

export default React.memo(SortableCategory);