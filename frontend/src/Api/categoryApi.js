import apiClient from './apiClient.js';

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data; // Expect an array of categories
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error(`Failed to fetch categories: ${message}`);
    throw new Error(`Failed to fetch categories: ${message}`);
  }
};

// Add a new category
export const addCategory = async (name) => {
  try {
    const response = await apiClient.post('/categories', { name });
    return response.data; // Expect the newly created category
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error(`Failed to add category: ${message}`);
    throw new Error(`Failed to add category: ${message}`);
  }
};

// Fetch items for a specific category
export const fetchCategoryItems = async (categoryId) => {
  try {
    const response = await apiClient.get(`/categories/${categoryId}/items`);
    return response.data; // Expect an array of items
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error(`Failed to fetch category items: ${message}`);
    throw new Error(`Failed to fetch category items: ${message}`);
  }
};



// Update category order
export const updateCategoryOrder = async (categories) => {
  try {
    const response = await apiClient.put('categories/order', {
      categories: categories.map(cat => ({ id: cat.id, order: cat.order }))
    });
    return response.data; // Return the backend's full category list
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update category order');
  }
};

// Rename Category
export const renameCategory = async (id, name) => {
  try {
    const response = await apiClient.put(`/categories/${id}`, { name });
    return response.data; // Expect the updated category
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to rename category');
  }
};

// Delete Category
export const deleteCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/categories/${categoryId}`);
    return response.data; // Expect success message or empty response
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};
