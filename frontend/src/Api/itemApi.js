import apiClient from './apiClient';

export const fetchItems = async () => {
  try {
    const response = await apiClient.get('/items');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch items');
  }
};
// Add an item to a category
export const addItem = async (categoryId, itemName) => {
  try {
    const response = await apiClient.post('/items', { categoryId, name: itemName });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add item');
  }
};
  export const updateItem = async (itemId, itemData) => {
    try {
      const response = await apiClient.put(`/items/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update item');
    }
  };
  
  export const deleteItem = async (itemId) => {
    try {
      const response = await apiClient.delete(`/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete item');
    }
  };
  
  export const updateItemOrder = async (itemId, newOrder, sourceCategoryId, targetCategoryId) => {
    try {
      const response = await apiClient.put('/items/order', {
        itemId,
        newOrder,
        sourceCategoryId,
        targetCategoryId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update item order');
    }
  };