import React from 'react';
import { Check, X } from 'lucide-react';

const ActionButtons = ({ isEditing, handleSave, handleCancel, handleEditClick }) => (
  <div className="flex space-x-2">
    {isEditing ? (
      <>
        <button
          onClick={handleSave}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <Check className="h-5 w-5 mr-2" />
          Save
        </button>
        <button
          onClick={handleCancel}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <X className="h-5 w-5 mr-2" />
          Cancel
        </button>
      </>
    ) : (
      <button
        onClick={handleEditClick}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Edit Budget
      </button>
    )}
  </div>
);

export default ActionButtons;