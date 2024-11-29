import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useItemContext } from './Budget/Categories/Items/ItemContext';

const Modal = ({ isOpen, onClose, initialPosition, categoryId }) => {
  const [itemName, setItemName] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [positionReady, setPositionReady] = useState(false);
  const modalRef = useRef(null);
  const { handleAddItem } = useItemContext();

  useEffect(() => {
    if (isOpen && initialPosition) {
      setPosition(initialPosition);
      setPositionReady(true);
    }
  }, [isOpen, initialPosition]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;

      // Restrict dragging within the viewport
      const modalWidth = modalRef.current.offsetWidth;
      const modalHeight = modalRef.current.offsetHeight;

      setPosition({
        x: Math.min(window.innerWidth - modalWidth, Math.max(0, newX)),
        y: Math.min(window.innerHeight - modalHeight, Math.max(0, newY)),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (itemName.trim()) {
      handleAddItem(categoryId, itemName.trim());
      setItemName(''); // Clear input after submission
      onClose(); // Close the modal
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !positionReady) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div
        className="absolute"
        style={{ left: position.x, top: position.y, zIndex: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className={`bg-white rounded-lg p-6 shadow-lg cursor-move ${isDragging ? 'z-70' : 'z-60'}`}
          onMouseDown={handleMouseDown}
          ref={modalRef}
          style={{ width: '300px', height: 'auto', userSelect: 'none' }}
        >
          <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter item name"
              className="border border-gray-300 rounded-lg p-2 w-full mb-4"
              required
              autoFocus
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 bg-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default Modal; 