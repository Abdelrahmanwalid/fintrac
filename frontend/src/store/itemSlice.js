// src/store/itemSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  updateItemOrder,
} from "../Api/itemApi";

export const fetchItemsAsync = createAsyncThunk(
  "items/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchItems();
      console.log("Fetched Items:", response);
      return response;
    } catch (error) {
      console.error("Error fetching items:", error);
      return rejectWithValue(error.message);
    }
  }
);
export const addItemAsync = createAsyncThunk(
  "items/addItem",
  async ({ categoryId, itemName }, { rejectWithValue }) => {
    try {
      return await addItem(categoryId, itemName);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItemAsync = createAsyncThunk(
  "items/updateItem",
  async ({ itemId, itemData }, { rejectWithValue }) => {
    try {
      const updatedItem = await updateItem(itemId, itemData); // Call API
      return { itemId, updatedItem }; // Return updated item
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteItemAsync = createAsyncThunk(
  "items/deleteItem",
  async (itemId, { rejectWithValue }) => {
    try {
      await deleteItem(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItemOrderAsync = createAsyncThunk(
  "items/updateItemOrder",
  async (
    { itemId, newOrder, sourceCategoryId, targetCategoryId },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await updateItemOrder(
        itemId,
        newOrder,
        sourceCategoryId,
        targetCategoryId
      );
      // After successful update, re-fetch items to ensure we have correct ordering from server
      dispatch(fetchItemsAsync());
      return { itemId, newOrder, sourceCategoryId, targetCategoryId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const itemSlice = createSlice({
  name: "items",
  initialState: {
    itemsByCategory: {},
    loading: false,
    error: null,
  },
  reducers: {
    selectItem: (state, action) => {
      state.selectedItem = action.payload; // Set selected item
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null; // Clear selection when needed
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchItemsAsync.fulfilled, (state, action) => {
        if (!Array.isArray(action.payload)) {
          console.error("Invalid payload format:", action.payload);
          return;
        }

        const validItems = action.payload.filter((item) => item && item.name);
        state.itemsByCategory = {};

        validItems.forEach((item) => {
          if (!state.itemsByCategory[item.categoryId]) {
            state.itemsByCategory[item.categoryId] = [];
          }
          state.itemsByCategory[item.categoryId].push(item);
        });

        // Sort each category's array by the order property
        Object.keys(state.itemsByCategory).forEach((categoryId) => {
          state.itemsByCategory[categoryId].sort((a, b) => a.order - b.order);
        });
      })
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        const { itemId, updatedItem } = action.payload;
        const categoryItems =
          state.itemsByCategory[updatedItem.categoryId] || [];

        const itemIndex = categoryItems.findIndex((item) => item.id === itemId);
        if (itemIndex !== -1) {
          categoryItems[itemIndex] = updatedItem; // Update item in category
        }
      })
      .addCase(fetchItemsAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateItemOrderAsync.rejected, (state, action) => {
        state.error = action.payload || "Failed to reorder item";
      });
  },
});

export const selectItemsByCategory = (state, categoryId) => {
  return (state.items.itemsByCategory[categoryId] || [])
    .slice() // Create a shallow copy so the original state isn't mutated
    .sort((a, b) => a.order - b.order);
};

export const { selectItem, clearSelectedItem } = itemSlice.actions;
export default itemSlice.reducer;
