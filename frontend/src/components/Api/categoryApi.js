import api from '../api';

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data; // Return the list of categories
  } catch (error) {
    console.error('Failed to fetch categories:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

// Add a new category
export const addCategory = async (categoryName) => {
  try {
    const response = await api.post('/categories', { name: categoryName });
    return response.data; // Return the newly created category
  } catch (error) {
    console.error('Failed to add category:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add category');
  }
};

// Fetch items for a category
export const fetchCategoryItems = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}/items`);
    return response.data; // Return the list of items for the category
  } catch (error) {
    console.error('Failed to fetch category items:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch category items');
  }
};

// Add an item to a category
export const addItemToCategory = async (categoryId, itemData) => {
  try {
    const response = await api.post(`/categories/${categoryId}/items`, itemData);
    return response.data; // Return the newly created item
  } catch (error) {
    console.error('Failed to add item to category:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add item to category');
  }
};

// Update an item
export const updateItem = async (itemId, itemData) => {
  try {
    const response = await api.put(`/items/${itemId}`, itemData);
    return response.data; // Return the updated item
  } catch (error) {
    console.error('Failed to update item:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update item');
  }
};

// Delete an item
export const deleteItem = async (itemId) => {
  try {
    const response = await api.delete(`/items/${itemId}`);
    return response.data; // Return success message or empty response
  } catch (error) {
    console.error('Failed to delete item:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete item');
  }
};