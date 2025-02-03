import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCategories,
  addCategory,
  updateCategoryOrder,
  fetchCategoryItems,
  renameCategory,
  deleteCategory,
} from '../Api/categoryApi';

// Thunks for async actions
export const fetchCategoriesAsync = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    const response = await fetchCategories();
    return response.map((cat) => ({
      ...cat,
      id: cat._id,
      order: cat.order,
      isExpanded: false // Initialize expansion state locally
    }));
  }
);


export const addCategoryAsync = createAsyncThunk(
  'categories/addCategory',
  async (name, { rejectWithValue }) => {
    try {
      const response = await addCategory(name);
      return { ...response, id: response._id, isExpanded: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add category');
    }
  }
);

export const updateCategoryOrderAsync = createAsyncThunk(
  'categories/updateCategoryOrder',
  async (categories, { rejectWithValue, dispatch }) => {
    try {
      dispatch(updateCategoryOrderOptimistic(categories));
      const backendResponse = await updateCategoryOrder(categories);
      return backendResponse.map(cat => ({
        ...cat,
        id: cat._id,
        order: cat.order
      }));
    } catch (error) {
      dispatch(revertCategoryOrder(categories.map(cat => ({
        id: cat.id,
        originalOrder: cat.order
      }))));
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoryItemsAsync = createAsyncThunk(
  'categories/fetchCategoryItems',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetchCategoryItems(categoryId);
      return { categoryId, items: response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category items');
    }
  }
);

export const renameCategoryAsync = createAsyncThunk(
  'categories/renameCategory',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      await renameCategory(id, name);
      return { id, name };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rename category');
    }
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      await deleteCategory(categoryId);
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {
    toggleCategory: (state, action) => {
      const category = state.categories.find(cat => cat.id === action.payload);
      if (category) {
        category.isExpanded = !category.isExpanded;
      }
    },
    expandCategory: (state, action) => {
      const category = state.categories.find(cat => cat.id === action.payload);
      if (category) {
        category.isExpanded = true;
      }
    },
    collapseCategory: (state, action) => {
      const category = state.categories.find(cat => cat.id === action.payload);
      if (category) {
        category.isExpanded = false;
      }
    },
    updateCategoryOrderOptimistic: (state, action) => {
      action.payload.forEach(updatedCat => {
        const existing = state.categories.find(c => c.id === updatedCat.id);
        if (existing) existing.order = updatedCat.order;
      });
    },
    revertCategoryOrder: (state, action) => {
      action.payload.forEach(({ id, originalOrder }) => {
        const existing = state.categories.find(c => c.id === id);
        if (existing) existing.order = originalOrder;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategoriesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCategoryAsync.fulfilled, (state, action) => {
        state.categories.push({ 
          ...action.payload, 
          items: [],
          isExpanded: false
        });
      })
      .addCase(updateCategoryOrderAsync.fulfilled, (state, action) => {
        state.categories = action.payload.map(cat => ({
          ...cat,
          id: cat._id,
          order: cat.order,
          // preserve isExpanded from existing state
          isExpanded: state.categories.find(c => c.id === cat.id)?.isExpanded || false
        }));
      })
      .addCase(renameCategoryAsync.fulfilled, (state, action) => {
        const category = state.categories.find(cat => cat.id === action.payload.id);
        if (category) category.name = action.payload.name;
      })
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { 
  toggleCategory,
  expandCategory,
  collapseCategory,
  updateCategoryOrderOptimistic,
  revertCategoryOrder 
} = categorySlice.actions;

export default categorySlice.reducer;
